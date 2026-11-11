/* Noneun Creator accounts: Firebase Auth (email + Google) and learning progress in Firestore.
   Settings live in assets/firebase-config.js. With no apiKey there, accounts stay switched off. */
const FB = 'https://www.gstatic.com/firebasejs/10.12.2/';
const NC = window.NC;
const { T, href, go } = NC;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ic = n => `<svg class="i"><use href="#${n}"/></svg>`;
const cfg = window.FIREBASE_CONFIG || {};
let A = null, F = null, auth = null, db = null, user = null, profile = null, ready = false, disabled = '', store = 'fs', pending = null, demo = null;
/* Demo mode: a sample account that lives only in this browser. Available in the preview, or with ?demo
   on the live site, and only while Firebase is not connected yet. */
const DEMO = !cfg.apiKey && (NC.inFrame || (() => { try { if (/[?&]demo\b/.test(location.search)) sessionStorage.setItem('nc-demo', '1'); return sessionStorage.getItem('nc-demo') === '1'; } catch (e) { return /[?&]demo\b/.test(location.search); } })());
const DEMO_EMAIL = 'demo@noneuncreator.com', DEMO_PW = 'demo1234';

const ERR = {
  'auth/invalid-credential': ['이메일 또는 비밀번호가 올바르지 않습니다.', 'The email or password is incorrect.'],
  'auth/invalid-login-credentials': ['이메일 또는 비밀번호가 올바르지 않습니다.', 'The email or password is incorrect.'],
  'auth/wrong-password': ['비밀번호가 올바르지 않습니다.', 'The password is incorrect.'],
  'auth/user-not-found': ['이메일 또는 비밀번호가 올바르지 않습니다.', 'The email or password is incorrect.'],
  'auth/email-already-in-use': ['이미 가입된 이메일입니다. 로그인해 주세요.', 'This email is already registered. Please log in.'],
  'auth/invalid-email': ['이메일 주소 형식을 확인해 주세요.', 'Please check the email address.'],
  'auth/missing-password': ['비밀번호를 입력해 주세요.', 'Please enter your password.'],
  'auth/weak-password': ['비밀번호는 6자 이상이어야 합니다.', 'Your password must be at least 6 characters.'],
  'auth/too-many-requests': ['시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.', 'Too many attempts. Please wait a moment and try again.'],
  'auth/network-request-failed': ['인터넷 연결을 확인해 주세요.', 'Please check your internet connection.'],
  'auth/requires-recent-login': ['보안을 위해 로그아웃 후 다시 로그인한 뒤 시도해 주세요.', 'For your security, please log out, log back in and try again.'],
  'auth/unauthorized-domain': ['이 주소에서는 Google 로그인이 허용되지 않았습니다. (관리자: Firebase 승인된 도메인에 이 주소를 추가해 주세요.)', 'Google sign-in is not allowed on this address yet. (Admin: add it to the authorized domains in Firebase.)'],
  'auth/operation-not-allowed': ['이 로그인 방법이 아직 켜져 있지 않습니다. (관리자: Firebase에서 로그인 방법을 사용 설정해 주세요.)', 'This sign-in method is not turned on yet. (Admin: enable it in Firebase.)'],
  'auth/account-exists-with-different-credential': ['이 이메일은 다른 방법(이메일 또는 Google)으로 가입되어 있습니다. 가입한 방법으로 로그인해 주세요.', 'This email is registered with a different sign-in method. Please log in the way you signed up.'],
  'auth/user-mismatch': ['지금 로그인한 계정과 다른 Google 계정입니다.', "That's a different Google account from the one you're signed in with."],
  'auth/popup-blocked': ['팝업이 차단되었습니다. 브라우저에서 팝업을 허용한 뒤 다시 시도해 주세요.', 'The pop-up was blocked. Allow pop-ups for this site and try again.'],
};
const errMsg = e => { const m = ERR[e && e.code]; return m ? T(m[0], m[1]) : T('문제가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'Something went wrong. Please try again in a moment.') + (e && e.code ? ` (${e.code})` : ''); };
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/* ---------- small UI helpers ---------- */
function showMsg(box, text, ok) { const el = $('.form-error', box); if (!el) return; el.textContent = text; el.className = ok ? 'form-ok' : 'form-error'; el.hidden = !text; }
function clearMsg(box) { const el = $('.form-error, .form-ok', box); if (el) { el.hidden = true; el.className = 'form-error'; } }
function inline(form, text) { const el = $('.form-msg', form); if (!el) return; el.textContent = text; el.style.color = 'var(--ok)'; clearTimeout(el._t); el._t = setTimeout(() => { el.textContent = ''; }, 4000); }
function busy(btn, on) { if (!btn) return; if (on) { btn._html = btn.innerHTML; btn.disabled = true; btn.textContent = T('처리 중…', 'Working…'); } else if (btn._html) { btn.disabled = false; btn.innerHTML = btn._html; } }
function toast(text) {
  let t = $('#nc-toast'); if (!t) { t = document.createElement('div'); t.id = 'nc-toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = text; t.hidden = false; clearTimeout(t._t); t._t = setTimeout(() => { t.hidden = true; }, 3500);
}
const setNext = p => { try { sessionStorage.setItem('nc-next', p); } catch (e) {} };
const takeNext = () => { try { const v = sessionStorage.getItem('nc-next'); sessionStorage.removeItem('nc-next'); return v; } catch (e) { return null; } };

/* ---------- profile storage (Firestore, falls back to this browser) ---------- */
const lsKey = uid => 'nc-profile-' + uid;
async function loadProfile(u) {
  let p = null;
  try { const snap = await F.getDoc(F.doc(db, 'users', u.uid)); p = snap.exists() ? snap.data() : null; store = 'fs'; }
  catch (e) { store = 'local'; try { p = JSON.parse(localStorage.getItem(lsKey(u.uid)) || 'null'); } catch (_) {} }
  if (!p) {
    p = { name: (pending && pending.name) || u.displayName || '', email: u.email || '', newsletter: !!(pending && pending.newsletter), completed: [], quizPassed: [], last: null, lang: NC.LANG, createdAt: Date.now(), termsAgreedAt: Date.now() };
    profile = p; await saveProfile(p, u);
  }
  p.completed = Array.isArray(p.completed) ? p.completed : [];
  p.quizPassed = Array.isArray(p.quizPassed) ? p.quizPassed : [];
  return p;
}
async function saveProfile(patch, u = user) {
  profile = { ...(profile || {}), ...patch };
  if (store === 'fs') { try { await F.setDoc(F.doc(db, 'users', u.uid), patch, { merge: true }); return; } catch (e) { store = 'local'; } }
  try { localStorage.setItem(lsKey(u.uid), JSON.stringify(profile)); } catch (_) {}
}

/* ---------- start ---------- */
async function init() {
  bindStatic();
  if (!cfg.apiKey && !DEMO) disabled = T('로그인 기능을 준비하고 있습니다. 조금만 기다려 주세요.', 'Accounts are coming soon. Please check back shortly.');
  if (disabled) { ready = true; paintHeader(); onRoute(NC.last); return; }
  try {
    let app = {};
    if (DEMO) { demo = demoFirebase(); A = demo.A; F = demo.F; }
    else {
      const [appM, authM, fsM] = await Promise.all([import(FB + 'firebase-app.js'), import(FB + 'firebase-auth.js'), import(FB + 'firebase-firestore.js')]);
      A = authM; F = fsM; app = appM.initializeApp(cfg);
    }
    auth = A.getAuth(app); auth.languageCode = NC.EN ? 'en' : 'ko';
    db = F.getFirestore(app);
    A.getRedirectResult(auth).catch(e => { if (e && e.code) toast(errMsg(e)); });
    A.onAuthStateChanged(auth, async u => {
      user = u; profile = u ? await loadProfile(u) : null; pending = null; ready = true;
      paintHeader(); onRoute(NC.last);
    });
  } catch (e) {
    disabled = T('로그인 서비스를 불러오지 못했습니다. 인터넷 연결을 확인한 뒤 새로고침해 주세요.', "Couldn't load the login service. Check your connection and refresh the page.");
    ready = true; paintHeader(); onRoute(NC.last);
  }
}
document.addEventListener('nc:route', e => onRoute(e.detail));

function onRoute(d) {
  if (!d || !ready) return;
  const page = d.page;
  if (page === 'login' || page === 'signup') {
    if (user) { go(takeNext() || 'account'); return; }
    $$(`[data-page="${page}"] [data-auth-note]`).forEach(n => {
      const msg = DEMO ? T('데모 모드입니다. 실제 가입 없이 체험용 계정으로 모든 기능을 둘러볼 수 있어요.', 'Demo mode: try every feature with a sample account. No real sign-up needed.') : disabled;
      n.textContent = msg; n.hidden = !msg;
      if (DEMO && !n.parentElement.querySelector('[data-demo]')) n.insertAdjacentHTML('afterend', `<button class="btn btn-ok btn-block" type="button" data-demo>${ic('p-user')} ${T('데모 계정으로 로그인', 'Log in with the demo account')}</button>`);
    });
  }
  if (page === 'account') {
    if (disabled) { const n = $('[data-page="account"] [data-auth-note]'); n.textContent = disabled; n.hidden = false; $('#acct-loading').hidden = true; $('#acct-body').hidden = true; return; }
    if (!user) { setNext('account'); go('login'); return; }
    renderAccount();
  }
  if (page === 'lesson') renderLessonDone(d.seg[1], +d.seg[2]);
  if (page === 'course') renderCourseProgress(d.seg[1]);
}

/* ---------- header + menu button ---------- */
function initials(name, email) { const s = (name || email || '?').trim(); return esc(s[0].toUpperCase()); }
function avatarHTML() { return user && user.photoURL ? `<img src="${esc(user.photoURL)}" alt="" referrerpolicy="no-referrer">` : initials(profile && profile.name, user && user.email); }
function paintHeader() {
  $$('[data-auth-link]').forEach(a => {
    const inDrawer = !!a.closest('.drawer'), label = $('[data-auth-label]', a);
    let av = $('.hdr-av', a);
    if (user) {
      a.href = href('account'); label.textContent = T('내 정보', 'My account');
      if (!inDrawer) { if (!av) { av = document.createElement('span'); av.className = 'hdr-av'; av.setAttribute('aria-hidden', 'true'); a.prepend(av); } av.innerHTML = avatarHTML(); }
    } else {
      a.href = href('login'); label.textContent = inDrawer ? T('로그인 / 회원가입', 'Log in / Sign up') : T('로그인', 'Log in');
      if (av) av.remove();
    }
  });
}
document.addEventListener('click', e => {
  const a = e.target.closest('[data-auth-link],[data-login-next]'); if (!a || user) return;
  const p = NC.last && NC.last.path;
  if (p && !['login', 'signup', 'account'].includes(p)) setNext(p);
}, true);

/* ---------- forms that work without Firebase loaded (toggles) + submit handlers ---------- */
function bindStatic() {
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-pw]'); if (!b) return;
    const inp = b.parentElement.querySelector('input'); const show = inp.type === 'password';
    inp.type = show ? 'text' : 'password'; b.textContent = show ? T('숨기기', 'Hide') : T('보기', 'Show'); b.setAttribute('aria-pressed', show);
  });
  $$('[data-google]').forEach(b => b.addEventListener('click', () => googleSignIn(b)));
  $('#forgot-btn').addEventListener('click', e => { const f = $('#reset-form'); f.hidden = !f.hidden; e.currentTarget.setAttribute('aria-expanded', !f.hidden); if (!f.hidden) { $('#rs-email').value = $('#li-email').value; $('#rs-email').focus(); } });
  $('#login-form').addEventListener('submit', onLogin);
  $('#reset-form').addEventListener('submit', onReset);
  $('#signup-form').addEventListener('submit', onSignup);
  { const ag = $('#su-agree'); if (ag) ag.addEventListener('change', () => { if (ag.checked) { ag.closest('.agree').classList.remove('need'); clearMsg(ag.closest('.auth-card')); } }); }
  $('#ac-logout').addEventListener('click', async () => { await A.signOut(auth); toast(T('로그아웃되었습니다.', 'You have been logged out.')); go(''); });
  $('#f-name').addEventListener('submit', onName);
  $('#f-news').addEventListener('submit', async e => { e.preventDefault(); const b = $('button[type=submit]', e.target); busy(b, true); await saveProfile({ newsletter: $('#ac-news').checked }); busy(b, false); inline(e.target, T('저장했습니다.', 'Saved.')); });
  $('#f-pw').addEventListener('submit', onPassword);
  $('#ac-reset').addEventListener('click', () => { $('#ac-reset-box').hidden = false; $('#ac-reset-yes').focus(); });
  $('#ac-reset-no').addEventListener('click', () => { $('#ac-reset-box').hidden = true; });
  $('#ac-reset-yes').addEventListener('click', async e => { busy(e.currentTarget, true); await saveProfile({ completed: [], quizPassed: [], last: null }); busy(e.currentTarget, false); $('#ac-reset-box').hidden = true; renderAccount(); toast(T('학습 기록을 초기화했습니다.', 'Your learning progress has been reset.')); });
  $('#ac-del').addEventListener('click', () => { const f = $('#ac-del-form'); f.hidden = false; clearMsg(f); $('#ac-del-word').focus(); });
  $('#ac-del-no').addEventListener('click', () => { $('#ac-del-form').hidden = true; });
  $('#ac-del-form').addEventListener('submit', onDelete);
  document.addEventListener('click', onLessonClick);
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-demo]'); if (!b || !demo) return;
    if (!demo.hasDemo()) demo.reseed();
    busy(b, true);
    try { await A.signInWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PW); } catch (err) { toast(errMsg(err)); }
    busy(b, false);
  });
}

function needReady(box) { if (disabled) { showMsg(box, disabled); return false; } if (!auth) { showMsg(box, T('잠시 후 다시 시도해 주세요.', 'Please try again in a moment.')); return false; } return true; }

function agreed(card) {
  const box = $('#su-agree', card); if (!box) return true;
  const lab = box.closest('.agree'); lab.classList.toggle('need', !box.checked);
  if (!box.checked) { showMsg(card, T('이용약관과 개인정보처리방침에 동의해 주세요.', 'Please agree to the Terms of Service and Privacy Policy.')); box.focus(); }
  return box.checked;
}
async function googleSignIn(btn) {
  const card = btn.closest('.auth-card'); clearMsg(card);
  if (!agreed(card)) return;
  if (!needReady(card)) return;
  const p = new A.GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' });
  busy(btn, true);
  try { await A.signInWithPopup(auth, p); }
  catch (e) {
    if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') { try { await A.signInWithRedirect(auth, p); return; } catch (e2) { showMsg(card, errMsg(e2)); } }
    else if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') showMsg(card, errMsg(e));
  }
  busy(btn, false);
}
async function onLogin(e) {
  e.preventDefault(); const f = e.target, card = f.closest('.auth-card'); clearMsg(f);
  const email = $('#li-email').value.trim(), pw = $('#li-pw').value;
  if (!isEmail(email)) return showMsg(f, T('이메일을 정확히 입력해 주세요.', 'Please enter a valid email address.'));
  if (!pw) return showMsg(f, T('비밀번호를 입력해 주세요.', 'Please enter your password.'));
  if (!needReady(f)) return;
  const b = $('button[type=submit]', f); busy(b, true);
  try { await A.signInWithEmailAndPassword(auth, email, pw); } catch (err) { showMsg(f, errMsg(err)); }
  busy(b, false);
}
async function onReset(e) {
  e.preventDefault(); const f = e.target; clearMsg(f);
  const email = $('#rs-email').value.trim();
  if (!isEmail(email)) return showMsg(f, T('이메일을 정확히 입력해 주세요.', 'Please enter a valid email address.'));
  if (!needReady(f)) return;
  const b = $('button[type=submit]', f); busy(b, true);
  try { await A.sendPasswordResetEmail(auth, email); showMsg(f, T('재설정 메일을 보냈습니다. 받은 편지함(또는 스팸함)을 확인해 주세요.', 'Reset email sent. Check your inbox (or spam folder).'), true); }
  catch (err) { showMsg(f, errMsg(err)); }
  busy(b, false);
}
async function onSignup(e) {
  e.preventDefault(); const f = e.target; clearMsg(f);
  const name = $('#su-name').value.trim(), email = $('#su-email').value.trim(), pw = $('#su-pw').value, pw2 = $('#su-pw2').value, newsletter = !!($('#su-news') && $('#su-news').checked);
  if (!agreed(f.closest('.auth-card'))) return;
  if (!name) return showMsg(f, T('이름을 입력해 주세요.', 'Please enter your name.'));
  if (!isEmail(email)) return showMsg(f, T('이메일을 정확히 입력해 주세요.', 'Please enter a valid email address.'));
  if (pw.length < 6) return showMsg(f, T('비밀번호는 6자 이상이어야 합니다.', 'Your password must be at least 6 characters.'));
  if (pw !== pw2) return showMsg(f, T('비밀번호가 서로 다릅니다. 다시 확인해 주세요.', "The passwords don't match. Please check them."));
  if (!needReady(f)) return;
  const b = $('button[type=submit]', f); busy(b, true);
  pending = { name, newsletter };
  try {
    const cred = await A.createUserWithEmailAndPassword(auth, email, pw);
    await A.updateProfile(cred.user, { displayName: name });
    if (user) { await saveProfile({ name, newsletter, email }); paintHeader(); }
    toast(T('가입을 환영합니다!', 'Welcome to Noneun Creator!'));
  } catch (err) { pending = null; showMsg(f, errMsg(err)); }
  busy(b, false);
}

/* ---------- account page ---------- */
const providers = () => (user ? user.providerData.map(p => p.providerId) : []);
function fmtDate(t) { const d = new Date(t); return isNaN(d) ? '' : d.toLocaleDateString(NC.EN ? 'en-US' : 'ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }); }
function progressRows() {
  const done = new Set(profile.completed), qp = new Set(profile.quizPassed);
  return NC.courses.map(c => {
    const n = c.lessons.length, has = i => `${c.slug}/${i + 1}`;
    const d = c.lessons.filter((_, i) => done.has(has(i))).length;
    const qn = c.lessons.filter(l => l.quiz).length, q = c.lessons.filter((l, i) => l.quiz && qp.has(has(i))).length;
    return { c, n, d, qn, q };
  });
}
function renderAccount() {
  if (!user || !profile) return;
  $('#acct-loading').hidden = true; $('#acct-body').hidden = false;
  const note = $('[data-page="account"] [data-auth-note]');
  note.textContent = DEMO ? T('데모 계정입니다. 바꾼 내용은 이 브라우저에만 저장되고 실제 계정과는 연결되지 않습니다.', "This is the demo account. Changes are saved only in this browser and aren't linked to a real account.") : '';
  note.hidden = !DEMO;
  const name = profile.name || user.displayName || (user.email || '').split('@')[0];
  $('#ac-avatar').innerHTML = avatarHTML();
  $('#ac-name').textContent = name; $('#ac-email').textContent = user.email || '';
  const pv = providers(), hasPw = pv.includes('password'), hasG = pv.includes('google.com');
  const joined = fmtDate(user.metadata && user.metadata.creationTime);
  $('#ac-tags').innerHTML = (hasG ? '<span class="tag">Google</span>' : '') + (hasPw ? `<span class="tag">${T('이메일', 'Email')}</span>` : '') + (joined ? `<span class="tag" style="background:var(--band);color:var(--muted)">${T('가입일', 'Joined')} ${esc(joined)}</span>` : '');
  $('#ac-name-in').value = name; $('#ac-news').checked = !!profile.newsletter;
  $('#f-pw').hidden = !hasPw; $('#f-pw-google').hidden = hasPw;
  $('#ac-del-pw-wrap').hidden = !hasPw; $('#ac-del-google').hidden = hasPw;
  const rows = progressRows(), started = rows.filter(r => r.d > 0 || r.q > 0);
  $('#st-lessons').textContent = rows.reduce((s, r) => s + r.d, 0);
  $('#st-quiz').textContent = rows.reduce((s, r) => s + r.q, 0);
  $('#st-courses').textContent = started.filter(r => r.d < r.n).length;
  $('#st-done').textContent = started.filter(r => r.d === r.n).length;
  // continue where you left off
  let next = null;
  const last = profile.last && NC.courses.find(c => c.slug === profile.last.course);
  if (last) {
    const done = new Set(profile.completed);
    let i = Math.max(0, (profile.last.n || 1) - 1);
    if (done.has(`${last.slug}/${i + 1}`)) { const j = last.lessons.findIndex((_, k) => !done.has(`${last.slug}/${k + 1}`)); i = j === -1 ? i : j; }
    next = { c: last, i };
  }
  $('#ac-continue').innerHTML = next
    ? `<a class="continue" href="${href(`education/${next.c.slug}/${next.i + 1}`)}"><span><small>${T('이어서 학습하기', 'Continue learning')} · ${esc(next.c.title)}</small><b>${esc(next.c.lessons[next.i].title)}</b></span><span class="go">${T('계속하기', 'Continue')} ${ic('i-right')}</span></a>`
    : `<div class="empty">${T('아직 학습 기록이 없어요. 교육자료에서 첫 강의를 시작해 보세요.', "You haven't started any lessons yet. Pick your first course on the Learn page.")}<div style="margin-top:16px"><a class="btn btn-primary" href="${href('education')}">${T('교육자료 보기', 'Browse courses')} ${ic('i-right')}</a></div></div>`;
  $('#ac-courses').innerHTML = started.map(({ c, n, d, qn, q }) => {
    const pct = Math.round(d / n * 100);
    return `<a class="cp-row" href="${href('education/' + c.slug)}"><img src="${c.img}" alt="" loading="lazy"><span><b>${esc(c.title)}</b><span class="progress" aria-hidden="true"><i style="width:${pct}%"></i></span><small>${T(`${n}개 중 ${d}개 강의 완료`, `${d} of ${n} lessons completed`)}${qn ? ' · ' + T(`퀴즈 ${qn}개 중 ${q}개 정답`, `${q} of ${qn} quizzes passed`) : ''}</small></span><span class="cp-pct">${pct === 100 ? ic('i-check') : pct + '%'}</span></a>`;
  }).join('');
}
async function onName(e) {
  e.preventDefault(); const f = e.target, name = $('#ac-name-in').value.trim();
  if (!name) { inline(f, T('이름을 입력해 주세요.', 'Please enter your name.')); return; }
  const b = $('button[type=submit]', f); busy(b, true);
  try { await A.updateProfile(user, { displayName: name }); } catch (_) {}
  await saveProfile({ name }); busy(b, false); paintHeader(); renderAccount(); inline(f, T('저장했습니다.', 'Saved.'));
}
async function onPassword(e) {
  e.preventDefault(); const f = e.target; clearMsg(f);
  const cur = $('#ac-pw-cur').value, nw = $('#ac-pw-new').value;
  if (!cur) return showMsg(f, T('현재 비밀번호를 입력해 주세요.', 'Please enter your current password.'));
  if (nw.length < 6) return showMsg(f, T('새 비밀번호는 6자 이상이어야 합니다.', 'Your new password must be at least 6 characters.'));
  const b = $('button[type=submit]', f); busy(b, true);
  try {
    await A.reauthenticateWithCredential(user, A.EmailAuthProvider.credential(user.email, cur));
    await A.updatePassword(user, nw);
    $('#ac-pw-cur').value = ''; $('#ac-pw-new').value = '';
    inline(f, T('비밀번호를 변경했습니다.', 'Password changed.'));
  } catch (err) { showMsg(f, errMsg(err)); }
  busy(b, false);
}
async function onDelete(e) {
  e.preventDefault(); const f = e.target; clearMsg(f);
  if ($('#ac-del-word').value.trim().toUpperCase() !== T('삭제', 'DELETE')) return showMsg(f, T('확인 문구로 "삭제"를 정확히 입력해 주세요.', 'Please type DELETE exactly to confirm.'));
  const hasPw = providers().includes('password');
  if (hasPw && !$('#ac-del-pw').value) return showMsg(f, T('비밀번호를 입력해 주세요.', 'Please enter your password.'));
  const b = $('button[type=submit]', f); busy(b, true);
  try {
    if (hasPw) await A.reauthenticateWithCredential(user, A.EmailAuthProvider.credential(user.email, $('#ac-del-pw').value));
    else await A.reauthenticateWithPopup(user, new A.GoogleAuthProvider());
    const uid = user.uid;
    try { await F.deleteDoc(F.doc(db, 'users', uid)); } catch (_) {}
    try { localStorage.removeItem(lsKey(uid)); } catch (_) {}
    await A.deleteUser(user);
    toast(T('계정이 삭제되었습니다. 그동안 함께해 주셔서 감사합니다.', 'Your account has been deleted. Thank you for learning with us.'));
    go('');
  } catch (err) { if (err.code !== 'auth/popup-closed-by-user') showMsg(f, errMsg(err)); }
  busy(b, false);
}

/* ---------- lesson + course progress ---------- */
function renderCourseProgress(slug) {
  const box = $('#co-prog'), c = NC.courses.find(x => x.slug === slug);
  if (!c || !user || !profile) { box.hidden = true; return; }
  const done = new Set(profile.completed), n = c.lessons.length, d = c.lessons.filter((_, i) => done.has(`${slug}/${i + 1}`)).length;
  box.hidden = false;
  box.innerHTML = `<small>${T(`내 진도: ${n}개 중 ${d}개 완료`, `My progress: ${d} of ${n} completed`)}</small><span class="progress" aria-hidden="true"><i style="width:${Math.round(d / n * 100)}%"></i></span>`;
  if (d) { const nx = c.lessons.findIndex((_, i) => !done.has(`${slug}/${i + 1}`)); if (nx > 0) { const s = $('#co-start'); s.href = href(`education/${slug}/${nx + 1}`); s.innerHTML = `${T('이어서 학습하기', 'Continue learning')} ${ic('i-right')}`; } }
  $$('#co-lessons .lesson-row').forEach((row, i) => { const nEl = $('.n', row); if (done.has(`${slug}/${i + 1}`)) { nEl.classList.add('done'); nEl.innerHTML = ic('i-check'); nEl.setAttribute('aria-label', T('완료', 'Completed')); } });
}
function renderLessonDone(slug, n) {
  const box = $('#le-done');
  if (disabled) { box.hidden = true; return; }
  box.hidden = false;
  if (!user || !profile) {
    box.className = 'mark-done';
    box.innerHTML = `<p>${T('로그인하면 학습 완료 기록을 저장하고 이어서 배울 수 있어요.', 'Log in to save your progress and pick up where you left off.')}</p><a class="btn btn-ghost" href="${href('login')}" data-login-next>${T('로그인', 'Log in')}</a>`;
    return;
  }
  const key = `${slug}/${n}`, done = profile.completed.includes(key);
  box.className = 'mark-done' + (done ? ' done' : '');
  box.innerHTML = done
    ? `<p>${ic('i-check')} ${T('이 강의를 완료했어요', 'You completed this lesson')}</p><button class="btn btn-ghost" type="button" data-undo="${key}">${T('완료 취소', 'Mark as not done')}</button>`
    : `<p>${T('강의를 다 보셨나요?', 'Finished this lesson?')}</p><button class="btn btn-ok" type="button" data-mark="${key}">${ic('i-check')} ${T('학습 완료로 표시', 'Mark as complete')}</button>`;
  if (!profile.last || profile.last.course !== slug || profile.last.n !== n) saveProfile({ last: { course: slug, n, at: Date.now() } });
}
async function setDone(key, on) {
  const set = new Set(profile.completed); on ? set.add(key) : set.delete(key);
  await saveProfile({ completed: [...set] });
}
async function onLessonClick(e) {
  if (!user || !profile) return;
  const m = e.target.closest('[data-mark],[data-undo]');
  if (m) { const key = m.dataset.mark || m.dataset.undo; busy(m, true); await setDone(key, !!m.dataset.mark); const [s, n] = key.split('/'); renderLessonDone(s, +n); if (m.dataset.mark) toast(T('학습 완료! 잘하셨어요.', 'Lesson complete. Well done!')); return; }
}
// Pressing "Next" / "Finish course" on a lesson also counts it as completed.
// Capture phase, so this runs before the router moves on to the next lesson.
document.addEventListener('click', e => {
  if (!user || !profile || !e.target.closest('#le-next') || !NC.last || NC.last.page !== 'lesson') return;
  const key = `${NC.last.seg[1]}/${NC.last.seg[2]}`; if (!profile.completed.includes(key)) setDone(key, true);
}, true);

function demoFirebase() {
  const KEY = 'nc-demo-v2', mem = {};
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return mem.st || null; } };
  const save = () => { mem.st = st; try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
  const range = (c, a, b) => Array.from({ length: b - a + 1 }, (_, i) => `${c}/${a + i}`);
  const seed = () => ({
    cur: null,
    users: { [DEMO_EMAIL]: { uid: 'demo', email: DEMO_EMAIL, pw: DEMO_PW, provider: 'password', displayName: T('데모 사용자', 'Demo User'), emailVerified: false, photoURL: null, created: '2026-10-01T09:00:00Z' } },
    db: { 'users/demo': { name: T('데모 사용자', 'Demo User'), email: DEMO_EMAIL, newsletter: true, lang: NC.LANG, createdAt: Date.parse('2026-10-01T09:00:00Z'),
      completed: [...range('phone-hobby', 1, 11), ...range('phone-basics', 1, 4), ...range('youtube-guide', 1, 3)],
      quizPassed: [...range('phone-hobby', 1, 11), ...range('phone-basics', 1, 3), ...range('youtube-guide', 1, 2)],
      last: { course: 'youtube-guide', n: 4, at: Date.now() } } },
  });
  let st = read() || seed(); save();
  const subs = [];
  const mk = u => u && { ...u, providerData: [{ providerId: u.provider }], metadata: { creationTime: u.created } };
  const cur = () => mk(st.users[st.cur]);
  const emit = () => { save(); subs.forEach(cb => cb(cur())); };
  const E = c => Object.assign(new Error(c), { code: c });
  const wait = () => new Promise(r => setTimeout(r, 300));
  const A = {
    getAuth: () => ({}),
    onAuthStateChanged: (a, cb) => { subs.push(cb); setTimeout(() => cb(cur()), 0); },
    getRedirectResult: async () => null,
    signInWithEmailAndPassword: async (a, e, p) => { await wait(); const u = st.users[e]; if (!u || u.pw !== p) throw E('auth/invalid-credential'); st.cur = e; emit(); return { user: cur() }; },
    createUserWithEmailAndPassword: async (a, e, p) => { await wait(); if (st.users[e]) throw E('auth/email-already-in-use'); st.users[e] = { uid: 'u' + Date.now(), email: e, pw: p, provider: 'password', displayName: '', emailVerified: false, created: new Date().toISOString() }; st.cur = e; emit(); return { user: cur() }; },
    updateProfile: async (u, p) => { Object.assign(st.users[u.email], p); save(); },
    sendEmailVerification: async () => { await wait(); },
    sendPasswordResetEmail: async () => { await wait(); },
    signOut: async () => { st.cur = null; emit(); },
    GoogleAuthProvider: class { setCustomParameters() {} },
    signInWithPopup: async () => { await wait(); const e = 'demo.google@gmail.com'; if (!st.users[e]) st.users[e] = { uid: 'demo-g', email: e, provider: 'google.com', displayName: T('구글 데모 사용자', 'Google Demo User'), emailVerified: true, created: new Date().toISOString() }; st.cur = e; emit(); },
    signInWithRedirect: async () => {},
    EmailAuthProvider: { credential: (e, p) => ({ e, p }) },
    reauthenticateWithCredential: async (u, c) => { await wait(); if (st.users[u.email].pw !== c.p) throw E('auth/invalid-credential'); },
    reauthenticateWithPopup: async () => { await wait(); },
    updatePassword: async (u, p) => { st.users[u.email].pw = p; save(); },
    deleteUser: async u => { delete st.users[u.email]; st.cur = null; emit(); },
  };
  const F = {
    getFirestore: () => ({}),
    doc: (_, c, id) => `${c}/${id}`,
    getDoc: async k => ({ exists: () => !!st.db[k], data: () => JSON.parse(JSON.stringify(st.db[k])) }),
    setDoc: async (k, v, o) => { st.db[k] = Object.assign({}, o && o.merge ? st.db[k] : {}, v); save(); },
    deleteDoc: async k => { delete st.db[k]; save(); },
  };
  return { A, F, hasDemo: () => !!st.users[DEMO_EMAIL], reseed: () => { const c = st.cur; st = seed(); st.cur = c; save(); } };
}

/* Quiz: a correct answer counts the lesson as completed and is saved to the profile */
document.addEventListener('nc:quiz', async e => {
  const { key, correct } = e.detail, msg = $('.quiz-msg');
  if (!user || !profile) {
    if (!disabled && msg) msg.insertAdjacentHTML('beforeend', ` <span style="color:var(--muted);font-weight:500">${T('로그인하면 결과가 내 정보에 저장돼요.', 'Log in to save your results.')}</span>`);
    return;
  }
  if (!correct) return;
  const qp = new Set(profile.quizPassed), done = new Set(profile.completed);
  const isNew = !qp.has(key) || !done.has(key);
  qp.add(key); done.add(key);
  await saveProfile({ quizPassed: [...qp], completed: [...done] });
  const [s, n] = key.split('/'); renderLessonDone(s, +n);
  if (isNew && msg) msg.insertAdjacentHTML('beforeend', ` <span style="font-weight:500">${T('학습 완료로 기록했어요.', 'Saved to your progress.')}</span>`);
});

init();
