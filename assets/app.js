/* Noneun Creator site script. Clean-URL router + page rendering (ko / en). */
(function(){
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const SITE=window.SITE||{};
const LANG=SITE.lang||document.documentElement.lang||'ko',EN=LANG==='en';
const T=(ko,en)=>EN?en:ko;
const BRAND=T('노는창작자','Noneun Creator');
const PREFIX=EN?'en/':'';
const inFrame=(()=>{try{return window.self!==window.top}catch(e){return true}})();
const ROOT=new URL(document.querySelector('base')?document.querySelector('base').getAttribute('href'):'./',location.href).pathname;
const DATA=window.DATA;
const ic=n=>`<svg class="i"><use href="#i-${n}"/></svg>`;
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num=n=>Number(n).toLocaleString(EN?'en-US':'ko-KR');
const ph=(t,r)=>`<div class="ph"${r?` style="--r:${r}"`:''}><span>${ic('photo')}${t}</span></div>`;
/* path helpers: '' = home, 'about', 'creators/sonmat-grandma' ... (relative to the site root, without language) */
const href=p=>(PREFIX+(p?p.replace(/\/?$/,'/'):''))||'./';
const otherHref=p=>EN?((p?p+'/':'')||'./'):'en/'+(p?p+'/':'');
function curPath(){let p=decodeURI(location.pathname);if(!p.startsWith(ROOT))return '';p=p.slice(ROOT.length).replace(/index\.html$/,'');if(EN)p=p.replace(/^en(\/|$)/,'');return p.replace(/\/+$/,'')}

const {faqs,creators:allCreators,courses,extras,events,posts}=DATA;
const creators=allCreators.filter(c=>c.show).reverse();
const CAT={beauty:T('뷰티','Beauty'),cooking:T('요리','Cooking'),travel:T('여행','Travel'),vlog:T('브이로그','Vlogs')};

/* Lightbox */
const lb=$('#lightbox');let lbList=[],lbI=0,lbReturn=null;const lbSets={};
function lbShow(){$('#lb-img').src=lbList[lbI];$('#lb-img').alt=T(`사진 ${lbI+1}`,`Photo ${lbI+1}`);$('#lb-count').textContent=`${lbI+1} / ${lbList.length}`;$('#lb-prev').hidden=$('#lb-next').hidden=lbList.length<2}
function lbOpen(list,i){lbList=list;lbI=i;lbReturn=document.activeElement;lb.hidden=false;document.body.style.overflow='hidden';lbShow();$('#lb-close').focus()}
function lbClose(){lb.hidden=true;document.body.style.overflow='';$('#lb-img').removeAttribute('src');if(lbReturn)lbReturn.focus()}
$('#lb-close').addEventListener('click',lbClose);
$('#lb-prev').addEventListener('click',()=>{lbI=(lbI-1+lbList.length)%lbList.length;lbShow()});
$('#lb-next').addEventListener('click',()=>{lbI=(lbI+1)%lbList.length;lbShow()});
lb.addEventListener('click',e=>{if(e.target===lb||e.target.classList.contains('lb-stage'))lbClose()});
document.addEventListener('keydown',e=>{if(lb.hidden)return;if(e.key==='Escape')lbClose();if(e.key==='ArrowLeft')$('#lb-prev').click();if(e.key==='ArrowRight')$('#lb-next').click()});
let tx=null;lb.addEventListener('touchstart',e=>{tx=e.touches[0].clientX},{passive:true});
lb.addEventListener('touchend',e=>{if(tx===null)return;const dx=e.changedTouches[0].clientX-tx;if(Math.abs(dx)>50)(dx>0?$('#lb-prev'):$('#lb-next')).click();tx=null});
document.addEventListener('click',e=>{const b=e.target.closest('[data-lb]');if(!b)return;const [set,i]=b.dataset.lb.split(':');lbOpen(lbSets[set],+i)});

/* FAQ ({a:path|text} becomes a link) */
const linkify=t=>esc(t).replace(/\{a:([\w\/-]*)\|([^}]*)\}/g,(_,p,x)=>`<a href="${href(p)}"${p===''?' data-sub':''}>${x}</a>`);
$('#faq').innerHTML=faqs.map((f,i)=>`<details${i===0?' open':''}><summary>${esc(f.q)}</summary><div class="a">${linkify(f.a)}</div></details>`).join('');

/* Creators */
const catTags=c=>`<div class="tags">${c.cats.map(t=>`<span class="tag">${esc(CAT[t]||t)}</span>`).join('')}</div>`;
const tile=(c,dup)=>`<a class="cover-tile" href="${href('creators/'+c.slug)}"${dup?' aria-hidden="true" tabindex="-1"':''}><img src="${c.cover}" alt="" loading="lazy"><span>${esc(c.name)}</span></a>`;
const mc=creators.filter(c=>c.cover);
$('#marquee-track').innerHTML=mc.map(c=>tile(c)).join('')+mc.map(c=>tile(c,true)).join('');
$('#marquee-track').style.setProperty('--dur',(mc.length*5)+'s');
function renderCreators(cat){
 const list=creators.filter(c=>cat==='all'||c.cats.includes(cat));
 $('#creator-grid').innerHTML=list.map(c=>`<a class="creator" href="${href('creators/'+c.slug)}"><img src="${c.pic}" alt="" loading="lazy"><b>${esc(c.name)}</b>${catTags(c)}</a>`).join('');
 $('#creator-count').textContent=list.length?T(`크리에이터 ${list.length}명`,`${list.length} creator${list.length>1?'s':''}`):T('이 분야의 크리에이터를 곧 소개할게요.','Creators in this topic are coming soon.');
}
$$('.chip').forEach(b=>b.addEventListener('click',()=>{$$('.chip').forEach(x=>x.setAttribute('aria-pressed',x===b));renderCreators(b.dataset.cat)}));
renderCreators('all');
const vcard=v=>`<a class="card" href="https://www.youtube.com/watch?v=${encodeURIComponent(v.id)}" target="_blank" rel="noopener"><div class="vthumb"><img src="https://i.ytimg.com/vi/${encodeURIComponent(v.id)}/hqdefault.jpg" alt="" loading="lazy" onerror="this.remove()"><span class="pbtn">${ic('play')}</span></div><div class="card-body"><h3>${esc(v.title)}</h3><div class="card-meta"><span>${ic('ext')} ${T('유튜브에서 보기','Watch on YouTube')}</span></div></div></a>`;

/* Count-up numbers */
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let counted=false;
function countUp(){
 if(counted||reduce)return;counted=true;
 $$('#stats [data-count]').forEach(el=>{
  const a=+el.dataset.count,b=el.dataset.count2?+el.dataset.count2:null,suf=el.dataset.suffix||'',t0=performance.now(),D=1600;
  const f=now=>{const p=Math.min(1,(now-t0)/D),e=1-Math.pow(1-p,3);
   el.textContent=(b!==null?`${Math.round(a*e)}–${Math.round(b*e)}`:Math.round(a*e))+suf;if(p<1)requestAnimationFrame(f)};
  requestAnimationFrame(f)});
}
if('IntersectionObserver' in window){new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&!$('.page[data-page="home"]').hidden)countUp()}),{threshold:.4}).observe($('#stats'))}

/* Education */
const nLessons=n=>T(`강의 ${n}개`,`${n} lesson${n>1?'s':''}`);
const courseCard=c=>`<a class="card" href="${href('education/'+c.slug)}"><img class="media" src="${c.img}" alt="" loading="lazy" style="--r:3/2"><div class="card-body"><h3>${esc(c.title)}</h3><div class="card-meta"><span>${ic('layers')} ${nLessons(c.lessons.length)}</span></div></div></a>`;
$('#home-courses').innerHTML=['youtube-guide','phone-basics','phone-hobby','storybook-youtuber'].map(s=>courseCard(courses.find(c=>c.slug===s))).join('');
const allLessons=courses.flatMap(c=>c.lessons.map((l,i)=>({c,l,i})));
function renderEdu(q){
 q=(q||'').trim().toLowerCase();
 const has=s=>String(s||'').toLowerCase().includes(q);
 const cs=courses.filter(c=>!q||has(c.title)||has(c.alt));
 const ls=q?allLessons.filter(x=>has(x.l.title)&&!cs.includes(x.c)):[];
 const lessonCard=({c,l,i})=>`<a class="card" href="${href(`education/${c.slug}/${i+1}`)}">${l.slides[0]?`<img class="media" src="${l.slides[0]}" alt="" loading="lazy" style="--r:3/2">`:ph(T('강의','Lesson'),'3/2')}<div class="card-body"><h3>${esc(l.title)}</h3><div class="card-meta"><span>${ic('book')} ${esc(c.title)}</span></div></div></a>`;
 $('#edu-grid').innerHTML=cs.map(courseCard).join('')+ls.map(lessonCard).join('');
 $('#edu-empty').hidden=cs.length+ls.length>0;
}
$('#edu-search').addEventListener('input',e=>renderEdu(e.target.value));
renderEdu('');

/* Posts */
const postCard=(p,set,i)=>`<article class="card"><div class="post-head"><img src="images/logo-faces.webp" alt="">${BRAND}</div><button class="post-img" type="button" data-lb="${set}:${i}" aria-label="${T('사진 크게 보기','Enlarge photo')}${p.desc?': '+esc(p.desc):''}"><img src="${p.img}" alt="${esc(p.desc)}" loading="lazy"></button><div class="card-body" style="padding:12px 16px 14px"><div class="card-meta" style="padding:0"><span>${ic('eye')} ${num(p.views)}</span></div></div></article>`;
const featured=posts.filter(p=>p.featured).slice(0,4);
lbSets.featured=featured.map(p=>p.img);
$('#home-posts').innerHTML=featured.map((p,i)=>postCard(p,'featured',i)).join('');
lbSets.posts=posts.map(p=>p.img);
let shown=0;const STEP=12;
function morePosts(){const next=posts.slice(shown,shown+STEP);$('#act-posts').insertAdjacentHTML('beforeend',next.map((p,i)=>postCard(p,'posts',shown+i)).join(''));shown+=next.length;
 const b=$('#act-more'),left=posts.length-shown;b.hidden=left<=0;b.textContent=T(`사진 더 보기 (${left}장 남음)`,`See more photos (${left} more)`)}
$('#act-more').addEventListener('click',morePosts);morePosts();

/* Events */
const today=new Date().toISOString().slice(0,10);
$('#event-list').innerHTML=events.map(e=>`<article class="event"><a href="${href('events/'+e.id)}" tabindex="-1" aria-hidden="true">${e.cover?`<img class="media" src="${e.cover}" alt="" loading="lazy" style="--r:3/2">`:ph(T('행사 사진','Event photo'),'3/2')}</a><div><span class="tag">${e.iso<today?T('지난 행사','Past event'):T('예정된 행사','Upcoming')}</span><h2>${esc(e.title)}</h2><div class="meta"><div>${ic('pin')}${esc(e.place)}</div><div>${ic('cal')}${e.date}</div></div><a class="btn btn-primary" href="${href('events/'+e.id)}">${T(`사진 ${e.photos.length}장 보기`,`View ${e.photos.length} photos`)} ${ic('right')}</a></div></article>`).join('');

/* Activity video: plays on the page on the live site */
$$('[data-yt]').forEach(a=>a.addEventListener('click',e=>{if(inFrame)return;e.preventDefault();e.stopPropagation();
 a.outerHTML=`<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${a.dataset.yt}?autoplay=1&rel=0" title="${T('우리도 예술가! 노는 창작자들의 그림 인터뷰',"We're artists too! Interviews with Noneun Creator painters")}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`}));

/* Games list */
const games=DATA.games||[];
$('#games-grid').innerHTML=games.map(g=>`<a class="card game-tile" href="${href('games/'+g.slug)}"><img class="media" src="${g.img}" alt="" loading="lazy" style="--r:3/2"><div class="card-body">${g.new||g.ww?`<div class="tags">${g.new?'<span class="tag">NEW</span>':''}${g.ww?'<span class="tag ww">W&amp;W</span>':''}</div>`:''}<div class="row"><h3>${esc(g.name)}</h3><span class="plays"><svg><use href="#p-gamepad"/></svg>${num(g.plays)}</span></div><p>${esc(g.desc)}</p><span class="btn btn-primary btn-sm">${T('게임하기','Play')}</span></div></a>`).join('');

/* Router */
const STATIC=['about','activities','events','creators','education','games','volunteer','contact','thanks','login','signup','account','privacy','terms'];
function show(name,title){$$('.page').forEach(p=>p.hidden=p.dataset.page!==name);document.title=title||$(`.page[data-page="${name}"]`).dataset.title}
let current=null,keepScroll=false;
if(inFrame){try{const k=sessionStorage.getItem('nc-lang-path');if(k!==null){current=k;sessionStorage.removeItem('nc-lang-path')}}catch(e){}}
function go(p){if(inFrame)current=p;else{try{history.pushState(null,'',href(p))}catch(e){current=p}}route()}
function route(){
 const path=current!==null?current:curPath();current=null;
 const seg=path.split('/');let nav=seg[0],e,c;
 if(path===''){show('home');nav=''}
 else if(seg[0]==='events'&&seg.length===2&&(e=events.find(x=>x.id===seg[1]))){
  $('#ev-title').textContent=e.title;$('#ev-meta').textContent=`${e.place} · ${e.date}`;
  $('#ev-desc').textContent=e.desc;$('#ev-desc').hidden=!e.desc;
  $('#ev-count').textContent=T(`사진 ${e.photos.length}장 · 사진을 누르면 크게 볼 수 있어요`,`${e.photos.length} photos · Tap a photo to enlarge it`);
  lbSets['ev'+e.id]=e.photos;
  $('#ev-gallery').innerHTML=e.photos.map((src,i)=>`<button class="shot" type="button" data-lb="ev${e.id}:${i}" aria-label="${T(`사진 ${i+1} 크게 보기`,`Enlarge photo ${i+1}`)}"><img src="${src}" alt="" loading="lazy"></button>`).join('');
  show('event',`${e.title} · ${BRAND}`);
 }else if(seg[0]==='creators'&&seg.length===2&&(c=creators.find(x=>x.slug===seg[1]))){
  $('#cr-pic').src=c.pic;$('#cr-pic').alt=c.name;
  $('#cr-name').textContent=c.name;$('#cr-en').textContent=c.alt;$('#cr-tags').innerHTML=c.cats.map(t=>`<span class="tag">${esc(CAT[t]||t)}</span>`).join('');
  $('#cr-desc').textContent=c.desc;$('#cr-url').href=c.url;$('#cr-url').hidden=!c.url;
  $('#cr-videos').innerHTML=c.videos.map(vcard).join('')||`<p class="muted">${T('등록된 영상이 없습니다.','No videos yet.')}</p>`;
  $('#cr-more').innerHTML=creators.filter(x=>x!==c&&x.cats.some(t=>c.cats.includes(t))).slice(0,4).map(x=>`<a href="${href('creators/'+x.slug)}" style="display:flex;gap:12px;align-items:center;text-decoration:none;font-weight:700"><img src="${x.pic}" alt="" style="width:44px;height:44px;border-radius:50%;object-fit:cover">${esc(x.name)}</a>`).join('');
  show('creator',`${c.name} · ${BRAND}`);
 }else if(seg[0]==='education'&&seg.length===2&&(c=courses.find(x=>x.slug===seg[1]))){
  $('#co-img').src=c.img;$('#co-en').textContent=c.alt;$('#co-title').textContent=c.title;$('#co-desc').textContent=c.desc;
  const views=c.lessons.reduce((s,l)=>s+l.views,0);
  $('#co-facts').innerHTML=`<span>${ic('layers')} ${nLessons(c.lessons.length)}</span><span>${ic('eye')} ${T('조회','Views')} ${num(views)}</span>`;
  $('#co-start').href=href(`education/${c.slug}/1`);
  $('#co-lessons').innerHTML=c.lessons.map((l,i)=>`<li><a class="lesson-row" href="${href(`education/${c.slug}/${i+1}`)}"><span class="n">${i+1}</span>${l.slides[0]?`<img src="${l.slides[0]}" alt="" loading="lazy">`:ph('','16/10')}<span><b>${esc(l.title)}</b><small>${l.video?T('영상 포함 · ','Video · '):''}${l.slides.length?T(`슬라이드 ${l.slides.length}장 · `,`${l.slides.length} slides · `):''}${T('조회','Views')} ${num(l.views)}</small></span><span class="go">${ic('right')}</span></a></li>`).join('');
  $('#co-extras').innerHTML=c.slug==='storybook-youtuber'&&extras.length?`<h2 style="font-size:1.2rem;margin:44px 0 6px">${T('추가 자료','More resources')}</h2><div class="extra-links">${extras.map(x=>`<a class="lesson-row" style="grid-template-columns:auto 1fr auto" href="${x.url}" target="_blank" rel="noopener"><span class="n">${ic('book')}</span><span><b>${esc(x.title)}</b><small>${T('구글 드라이브에서 열기','Open in Google Drive')}</small></span><span class="go">${ic('ext')}</span></a>`).join('')}</div>`:'';
  show('course',`${c.title} · ${BRAND}`);
 }else if(seg[0]==='education'&&seg.length===3&&(c=courses.find(x=>x.slug===seg[1]))&&c.lessons[+seg[2]-1]){
  const n=+seg[2],L=c.lessons,l=L[n-1];
  $('#le-back').href=href('education/'+c.slug);$('#le-course').textContent=c.title;$('#le-step').textContent=`${n} / ${L.length}`;
  $('#le-bar').style.width=(n/L.length*100)+'%';$('#le-title').textContent=l.title;
  $('#le-facts').innerHTML=`<span>${ic('eye')} ${T('조회','Views')} ${num(l.views)}</span>${l.author?`<span>${ic('users')} ${esc(l.author)}</span>`:''}`;
  $('#le-video').innerHTML=l.video?`<video class="lesson-video" controls preload="metadata" src="${esc(l.video)}"></video>`:'';
  $('#le-slides').innerHTML=l.slides.length?l.slides.map((s,i)=>`<img src="${s}" alt="${esc(l.title)} ${T('슬라이드','slide')} ${i+1}" loading="${i<2?'eager':'lazy'}">`).join(''):`<p class="empty">${T('자료를 준비하고 있습니다.','This material is being prepared.')}</p>`;
  $('#le-quiz').innerHTML=l.quiz?`<div class="quiz"><h2>${T('확인 퀴즈','Quick quiz')}</h2><p class="q">${esc(l.quiz.q)}</p><div class="ox"><button type="button" class="o" data-v="true" aria-label="${T('맞다','True')}">O</button><button type="button" class="x" data-v="false" aria-label="${T('틀리다','False')}">X</button></div><p class="quiz-msg" aria-live="polite"></p></div>`:'';
  if(l.quiz)$$('.ox button').forEach(b=>b.addEventListener('click',()=>{const right=(b.dataset.v==='true')===l.quiz.a;$$('.ox button').forEach(x=>x.removeAttribute('data-state'));b.dataset.state=right?'right':'wrong';
   const msg=$('.quiz-msg');msg.textContent=right?T('정답입니다! 잘하셨어요.','Correct! Well done.'):T(`아쉬워요. 정답은 ${l.quiz.a?'O':'X'} 입니다.`,`Not quite. The answer is ${l.quiz.a?'O (true)':'X (false)'}.`);msg.style.color=right?'var(--ok)':'var(--bad)';
   document.dispatchEvent(new CustomEvent('nc:quiz',{detail:{key:`${c.slug}/${n}`,correct:right}}))}));
  const prev=$('#le-prev'),next=$('#le-next');prev.hidden=n===1;prev.href=href(`education/${c.slug}/${n-1}`);
  if(n===L.length){next.href=href('education/'+c.slug);next.innerHTML=T('강의 완료 ','Finish course ')+ic('check')}else{next.href=href(`education/${c.slug}/${n+1}`);next.innerHTML=T('다음 ','Next ')+ic('right')}
  show('lesson',`${l.title} · ${BRAND}`);
 }else if(seg[0]==='games'&&seg.length===2&&(c=games.find(x=>x.slug===seg[1]))&&window.NCGames){
  const info=NCGames.info(c.slug)||{};
  $('#gm-title').textContent=c.name;$('#gm-desc').textContent=c.desc;
  $('#gm-plays').innerHTML=`<svg style="width:22px;height:22px;fill:currentColor"><use href="#p-gamepad"/></svg><span>${T('플레이','Plays')} ${num(c.plays)}</span>`;
  $('#gm-note').textContent=info.note||'';$('#gm-note').hidden=!info.note;
  $('#gm-howto').innerHTML=(info.howto||[]).map(x=>`<li>${esc(x)}</li>`).join('');$('#gm-howto').hidden=!(info.howto||[]).length;
  NCGames.mount(c.slug,$('#game-root'));
  show('game',`${c.name} · ${BRAND}`);nav='games';
 }else if(seg.length===1&&STATIC.includes(seg[0])){show(seg[0])}
 else{show('notfound');nav='-'}
 $$('.main-nav a,.drawer-nav a').forEach(a=>a.getAttribute('href')===href(nav)?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));
 $$('[data-lang-link]').forEach(a=>{const v=a.getAttribute('data-lang-link');a.href=(v===''||v!==LANG)?otherHref(path):href(path)});
 document.documentElement.classList.toggle('hdr-dark',path==='');
 const pg=$$('.page').find(x=>!x.hidden);
 window.NC.last={path,seg,page:pg?pg.dataset.page:''};
 document.dispatchEvent(new CustomEvent('nc:route',{detail:window.NC.last}));
 if(path!=='')counted=false;
 closeMenu();if(!keepScroll)window.scrollTo(0,0);keepScroll=false;updateHeader();
}
window.NC={go,href,T,EN,LANG,courses,inFrame,last:null};
window.addEventListener('popstate',route);
document.addEventListener('click',e=>{
 if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
 const a=e.target.closest('a[href]');if(!a||a.target||a.hasAttribute('download'))return;
 if(a.hasAttribute('data-lang-link')){if(inFrame){e.preventDefault();try{sessionStorage.setItem('nc-lang-path',(window.NC.last&&window.NC.last.path)||'')}catch(x){}location.href=EN?SITE.koPreview||'../':SITE.enPreview||'en/'}return}
 const raw=a.getAttribute('href');if(raw.startsWith('#'))return;
 const u=new URL(a.href,location.href);if(u.origin!==location.origin&&!inFrame)return;
 if(/^(mailto|tel|https?):/i.test(raw)&&u.origin!==location.origin)return;
 let p=decodeURI(u.pathname);if(!p.startsWith(ROOT))return;p=p.slice(ROOT.length).replace(/index\.html$/,'');
 if(EN){if(!/^en(\/|$)/.test(p))return;p=p.replace(/^en(\/|$)/,'')}else if(/^en(\/|$)/.test(p))return;
 if(/^(images|videos|assets)\//.test(p))return;
 e.preventDefault();p=p.replace(/\/+$/,'');
 if(a.hasAttribute('data-sub')){go('');setTimeout(()=>{window.scrollTo(0,0);$('#hero-email').focus({preventScroll:true})},60);return}
 if(a.hasAttribute('data-faq')){keepScroll=false;go('');setTimeout(()=>$('#faq').scrollIntoView({block:'start'}),60);return}
 go(p);
});

/* Menu */
const mb=$('.menu-btn'),mn=$('#mobile-nav');
function updateHeader(){document.documentElement.classList.toggle('hdr-top',window.scrollY<12&&mn.hidden)}
window.addEventListener('scroll',updateHeader,{passive:true});
function openMenu(){mn.hidden=false;mb.setAttribute('aria-expanded','true');document.body.style.overflow='hidden';updateHeader();setTimeout(()=>$('#drawer-close').focus(),30)}
function closeMenu(restore){if(mn.hidden)return;mn.hidden=true;mb.setAttribute('aria-expanded','false');document.body.style.overflow='';updateHeader();if(restore)mb.focus({preventScroll:true})}
mb.addEventListener('click',openMenu);
$('#drawer-close').addEventListener('click',()=>closeMenu(true));
$('.drawer-backdrop').addEventListener('click',()=>closeMenu(true));
document.addEventListener('keydown',e=>{
 if(mn.hidden)return;
 if(e.key==='Escape'){closeMenu(true);return}
 if(e.key==='Tab'){const f=$$('a[href],button',mn).filter(x=>x.offsetParent);const first=f[0],last=f[f.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});

/* Text size */
function setFs(n){const r=document.documentElement;r.classList.remove('fs-1','fs-2');if(n>0)r.classList.add('fs-'+n);$$('.fs button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.fs==n));try{localStorage.setItem('nc-fs',n)}catch(e){}}
$$('.fs button').forEach(b=>b.addEventListener('click',()=>setFs(+b.dataset.fs)));
try{const s=localStorage.getItem('nc-fs');if(s)setFs(+s)}catch(e){}
const darkMQ=window.matchMedia?matchMedia('(prefers-color-scheme: dark)'):null;
const isDark=()=>{const t=document.documentElement.getAttribute('data-theme');return t?t==='dark':!!(darkMQ&&darkMQ.matches)};
function paintTheme(){const d=isDark();document.documentElement.classList.toggle('is-dark',d);
 $$('[data-theme-toggle]').forEach(b=>{const l=d?T('밝은 화면으로 바꾸기','Switch to light mode'):T('어두운 화면으로 바꾸기','Switch to dark mode');b.setAttribute('aria-label',l);b.title=l});
 $$('[data-theme-set]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.themeSet==='dark')===d)))}
function setTheme(t){document.documentElement.setAttribute('data-theme',t);try{localStorage.setItem('nc-theme',t)}catch(e){}paintTheme()}
$$('[data-theme-toggle]').forEach(b=>b.addEventListener('click',()=>setTheme(isDark()?'light':'dark')));
$$('[data-theme-set]').forEach(b=>b.addEventListener('click',()=>setTheme(b.dataset.themeSet)));
if(darkMQ){try{darkMQ.addEventListener('change',paintTheme)}catch(e){}}
paintTheme();

/* Forms → FormSubmit */
$$('form[data-fs]').forEach(f=>f.addEventListener('submit',e=>{
 const st=$('.form-status',f),nx=$('[name="_next"]',f);if(nx)nx.value=new URL(href('thanks'),document.baseURI).href;
 if(inFrame){e.preventDefault();st.hidden=false;st.textContent=T('미리보기에서는 전송되지 않습니다. 실제 사이트에서는 bubble.youthimpact@gmail.com으로 전송됩니다.','Forms are not sent from this preview. On the live site this goes to bubble.youthimpact@gmail.com.');return}
 const b=$('button[type="submit"]',f);if(b){b.disabled=true;b.textContent=T('보내는 중…','Sending…')}}));

route();
})();
