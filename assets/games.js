/* Noneun Creator games. window.NCGames.mount(slug, rootElement) renders one game into the page. */
(function () {
  const SITE = window.SITE || {}, EN = (SITE.lang || document.documentElement.lang) === 'en';
  const T = (ko, en) => (EN ? en : ko);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const shuffle = a => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  const WW = 'https://wander-wonder.base44.app/';
  const CHECK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5 9.5 18 20 6"/></svg>';
  const CROSS = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5.5 5.5l13 13M18.5 5.5l-13 13"/></svg>';
  const shake = el => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };

  /* ---------------- content ---------------- */
  const IDIOMS = [
      { word: "일석이조", hanja: "一石二鳥", meaning: "돌 한 개를 던져 두 마리의 새를 맞춘다는 뜻으로, 한 가지 일로 두 가지 이익을 얻음을 이르는 말.", chosung: "ㅇ ㅅ ㅇ ㅈ", distractors: ["삼", "사", "물", "산"] },
      { word: "동문서답", hanja: "東問西答", meaning: "동쪽을 묻는데 서쪽을 대답한다는 뜻으로, 묻는 말에 전혀 딴판의 대답을 함.", chosung: "ㄷ ㅁ ㅅ ㄷ", distractors: ["남", "북", "말", "글"] },
      { word: "역지사지", hanja: "易地思之", meaning: "처지를 서로 바꾸어 생각함이라는 뜻으로, 상대방의 입장 처지에서 생각해보는 태도.", chosung: "ㅇ ㅈ ㅅ ㅈ", distractors: ["마", "음", "경", "천"] },
      { word: "고진감래", hanja: "苦盡甘來", meaning: "쓴 것이 다하면 단 것이 온다는 뜻으로, 고생 끝에 즐거움이 옴을 이르는 말.", chosung: "ㄱ ㅈ ㄱ ㄹ", distractors: ["화", "복", "생", "사"] },
      { word: "대기만성", hanja: "大器晩成", meaning: "큰 그릇은 늦게 이루어진다는 뜻으로, 크게 될 사람은 오랜 노력을 거쳐 늦게 대성함을 이르는 말.", chosung: "ㄷ ㄱ ㅁ ㅅ", distractors: ["소", "중", "성", "공"] },
      { word: "유유자적", hanja: "悠悠自適", meaning: "속세를 떠나 아무것에도 매이지 않고 자유롭고 여유 있게 삶.", chosung: "ㅇ ㅇ ㅈ ㅈ", distractors: ["풍", "류", "한", "강"] },
      { word: "십시일반", hanja: "十匙一飯", meaning: "열 숟가락이면 밥 한 그릇이 된다는 뜻으로, 여럿이 힘을 합치면 한 사람을 돕기 쉬움.", chosung: "ㅅ ㅅ ㅇ ㅂ", distractors: ["백", "천", "이", "삼"] },
      { word: "전화위복", hanja: "轉禍爲福", meaning: "재앙이 바뀌어 오히려 복이 된다는 뜻으로, 불행한 일이 계기가 되어 좋은 일이 생김.", chosung: "ㅈ ㅎ ㅇ ㅂ", distractors: ["길", "흉", "화", "락"] },
      { word: "동고동락", hanja: "同苦同樂", meaning: "괴로움도 함께하고 즐거움도 함께함.", chosung: "ㄷ ㄱ ㄷ ㄹ", distractors: ["생", "사", "희", "노"] },
      { word: "작심삼일", hanja: "作心三日", meaning: "단단히 먹은 마음이 사흘을 가지 못한다는 뜻으로, 결심이 오래가지 못함.", chosung: "ㅈ ㅅ ㅅ ㅇ", distractors: ["일", "월", "년", "시"] }
    ];
  const TRIVIA = [
      { category: "지리", question: "세계에서 가장 긴 강은 무엇일까요?", choices: ["나일강", "아마존강", "양쯔강", "미시시피강"], answer: 0, hint: "아프리카 대륙을 흐르는 강이에요." },
      { category: "과학", question: "물의 화학식은 무엇일까요?", choices: ["CO2", "H2O", "O2", "NaCl"], answer: 1, hint: "수소 원자 두 개와 산소 원자 한 개로 이루어져 있어요." },
      { category: "역사", question: "우리나라 최초의 한글 소설은 무엇일까요?", choices: ["춘향전", "홍길동전", "심청전", "박씨전"], answer: 1, hint: "허균이 지은 작품이에요." },
      { category: "천문", question: "태양계에서 가장 큰 행성은 무엇일까요?", choices: ["토성", "지구", "목성", "해왕성"], answer: 2, hint: "가스로 이루어진 거대한 행성이에요." },
      { category: "상식", question: "1년은 총 며칠일까요? (평년 기준)", choices: ["364일", "365일", "366일", "360일"], answer: 1, hint: "4년마다 하루가 더 있는 윤년이 있어요." },
      { category: "문화", question: "세계 3대 영화제에 속하지 않는 것은?", choices: ["칸 영화제", "베니스 영화제", "베를린 영화제", "아카데미 시상식"], answer: 3, hint: "이건 시상식이지 '영화제'가 아니에요." },
      { category: "신체", question: "사람 몸에서 가장 큰 장기는 무엇일까요?", choices: ["심장", "간", "피부", "폐"], answer: 2, hint: "몸 전체를 감싸고 있어요." },
      { category: "지리", question: "다음 중 가장 인구가 많은 나라는 어디일까요?", choices: ["미국", "인도네시아", "인도", "브라질"], answer: 2, hint: "2023년 기준 세계 1위 인구 대국이 되었어요." },
      { category: "과학", question: "인간의 정상 체온은 대략 몇 도일까요?", choices: ["33.5도", "35도", "36.5도", "39도"], answer: 2, hint: "'삼십육점오'라고 흔히 말해요." },
      { category: "경제", question: "우리나라 중앙은행의 이름은 무엇일까요?", choices: ["한국산업은행", "한국은행", "국민은행", "기획재정부"], answer: 1, hint: "화폐를 발행하는 기관이에요." }
    ];
  const COUNTRY = [
            // 일본
            {
                country: "일본",
                question: "일본의 수도는 어디일까요?",
                options: ["교토", "오사카", "도쿄", "히로시마"],
                answer: 2,
                fact: "교토는 1868년 수도가 도쿄로 옮겨지기 전까지 1,000년 넘게 일본의 수도였어요."
            },
            {
                country: "일본",
                question: "일본에서 가장 높은 산은 무엇일까요?",
                options: ["후지산", "아소산", "에베레스트산", "킬리만자로산"],
                answer: 0,
                fact: "후지산은 높이가 약 3,776m이고, 사실 지금도 활화산이에요."
            },
            // 요르단
            {
                country: "요르단",
                question: "요르단에 있는, 분홍빛 사암 절벽을 그대로 깎아 만든 고대 도시는 어디일까요?",
                options: ["페트라", "폼페이", "트로이", "바빌론"],
                answer: 0,
                fact: "페트라는 2,000여 년 전 나바테아인이 만든 도시로, 분홍빛 돌 때문에 '장밋빛 도시'라고도 불려요."
            },
            {
                country: "요르단",
                question: "요르단과 맞닿아 있는, 소금기가 너무 많아 사람이 쉽게 둥둥 뜨는 바다는 어디일까요?",
                options: ["홍해", "사해", "흑해", "카스피해"],
                answer: 1,
                fact: "사해 연안은 해수면보다 약 430m 낮아서, 지구의 육지 중 가장 낮은 곳이에요."
            },
            // 이탈리아
            {
                country: "이탈리아",
                question: "유명한 '기울어진 탑'이 있는 이탈리아 도시는 어디일까요?",
                options: ["로마", "베네치아", "피사", "밀라노"],
                answer: 2,
                fact: "피사의 사탑은 1100년대 공사 도중 아래쪽 땅이 너무 물러서 기울기 시작했어요."
            },
            {
                country: "이탈리아",
                question: "이탈리아는 지도에서 보이는 모양으로 유명해요. 어떤 모양일까요?",
                options: ["삼각형", "별", "원", "장화"],
                answer: 3,
                fact: "이탈리아의 '장화'는 마치 시칠리아섬이라는 공을 차고 있는 것처럼 보이기도 해요."
            },
            // 프랑스
            {
                country: "프랑스",
                question: "파리 루브르 박물관에 전시된 유명한 그림은 무엇일까요?",
                options: ["별이 빛나는 밤", "모나리자", "절규", "진주 귀걸이를 한 소녀"],
                answer: 1,
                fact: "모나리자는 레오나르도 다빈치가 그린 작품이고, 루브르는 세계에서 방문객이 가장 많은 미술관이에요."
            },
            {
                country: "프랑스",
                question: "에펠탑은 원래 어떤 행사를 위해 지어졌을까요?",
                options: ["왕실 결혼식", "1889년 파리 만국박람회", "제1회 올림픽", "새해 축제"],
                answer: 1,
                fact: "에펠탑은 원래 20년만 세워둘 예정이었지만, 라디오 안테나로 쓸모가 있어서 남게 되었어요."
            },
            // 그리스
            {
                country: "그리스",
                question: "고대 올림픽이 처음 시작된 나라는 어디일까요?",
                options: ["이탈리아", "이집트", "그리스", "프랑스"],
                answer: 2,
                fact: "고대 올림픽은 기원전 776년 무렵부터 그리스의 올림피아에서 열렸어요."
            },
            {
                country: "그리스",
                question: "아테네 아크로폴리스 위에 있는 유명한 고대 신전의 이름은 무엇일까요?",
                options: ["판테온", "파르테논 신전", "콜로세움", "알함브라 궁전"],
                answer: 1,
                fact: "파르테논 신전은 여신 아테나를 위해 지어졌어요. 이름이 비슷한 판테온은 로마에 있으니 헷갈리지 마세요!"
            },
            // 한국
            {
                country: "한국",
                question: "한국의 문자인 한글을 만든 왕은 누구일까요?",
                options: ["세종대왕", "태조", "정조", "광개토대왕"],
                answer: 0,
                fact: "세종대왕은 1400년대에 누구나 쉽게 읽고 쓸 수 있도록 한글을 만들었어요."
            },
            {
                country: "한국",
                question: "주로 배추로 만드는 한국의 대표적인 발효 반찬은 무엇일까요?",
                options: ["스시", "김치", "쌀국수", "딤섬"],
                answer: 1,
                fact: "김치를 함께 담그고 나누는 '김장 문화'는 유네스코 인류무형문화유산으로 등재되어 있어요."
            },
            // 페루
            {
                country: "페루",
                question: "페루의 높은 산 위에 있는 마추픽추를 만든 문명은 무엇일까요?",
                options: ["마야 문명", "아즈텍 문명", "잉카 문명", "올멕 문명"],
                answer: 2,
                fact: "마추픽추는 1400년대에 지어졌고, 안데스산맥 해발 약 2,400m에 자리하고 있어요."
            },
            {
                country: "페루",
                question: "세계에서 가장 높은 곳에 있는 항해 가능한 호수 중 하나인 티티카카호를 페루와 함께 나누어 가진 나라는 어디일까요?",
                options: ["칠레", "볼리비아", "브라질", "에콰도르"],
                answer: 1,
                fact: "티티카카호에는 토토라 갈대로 만든 '떠 있는 섬'에서 생활하는 사람들도 있어요."
            },
            // 캐나다
            {
                country: "캐나다",
                question: "캐나다의 수도는 어디일까요?",
                options: ["토론토", "밴쿠버", "오타와", "몬트리올"],
                answer: 2,
                fact: "가장 큰 도시인 토론토로 착각하기 쉽지만, 캐나다의 수도는 1857년부터 오타와예요."
            },
            {
                country: "캐나다",
                question: "캐나다 국기에 그려진 잎은 무엇일까요?",
                options: ["참나무 잎", "단풍잎", "솔잎", "자작나무 잎"],
                answer: 1,
                fact: "캐나다는 1965년에 빨간색과 흰색의 단풍잎 국기를 채택했어요. 전 세계 메이플 시럽의 대부분도 캐나다에서 생산돼요."
            },
            // 호주
            {
                country: "호주",
                question: "호주의 수도는 어디일까요?",
                options: ["시드니", "멜버른", "캔버라", "퍼스"],
                answer: 2,
                fact: "시드니와 멜버른이 서로 수도가 되고 싶어 해서, 그 절충안으로 캔버라가 수도로 정해졌어요."
            },
            {
                country: "호주",
                question: "호주 해안에 있는, 세계에서 가장 큰 산호초 지대는 무엇일까요?",
                options: ["그레이트배리어리프", "벨리즈 배리어 리프", "홍해 산호초", "몰디브 산호초"],
                answer: 0,
                fact: "그레이트배리어리프는 길이가 2,300km가 넘고, 수천 종의 바다 생물이 살고 있어요."
            }
        ];
  const ART = [
            // 프랑스
            {
                country: "프랑스", era: "1503–1519",
                artwork: "모나리자",
                files: ["Mona_Lisa,_by_Leonardo_da_Vinci,_from_C2RMF_retouched.jpg"],
                wiki: ["Mona_Lisa"], image: "",
                question: "모나리자를 그린 화가는 누구일까요?",
                options: ["레오나르도 다빈치", "빈센트 반 고흐", "파블로 피카소", "클로드 모네"],
                answer: 0,
                fact: "모나리자는 프랑스 파리의 루브르 박물관에 있고, 특별한 보호 유리 안에 전시되어 있어요."
            },
            {
                country: "프랑스", era: "1872",
                artwork: "인상, 해돋이",
                files: ["Monet_-_Impression,_Sunrise.jpg"],
                wiki: ["Impression,_Sunrise"], image: "",
                question: "모네의 이 그림은 하루 중 언제를 그린 것일까요?",
                options: ["해 뜰 무렵", "한밤중", "점심시간", "눈 오는 밤"],
                answer: 0,
                fact: "이 그림의 제목 '인상, 해돋이'에서 '인상주의'라는 미술 사조의 이름이 생겨났어요."
            },
            {
                country: "프랑스", era: "1830",
                artwork: "민중을 이끄는 자유의 여신",
                files: ["Eugène_Delacroix_-_Le_28_Juillet._La_Liberté_guidant_le_peuple.jpg"],
                wiki: ["Liberty_Leading_the_People"], image: "",
                question: "가운데 있는 여인이 깃발을 들고 있어요. 어느 나라의 국기일까요?",
                options: ["프랑스", "일본", "한국", "멕시코"],
                answer: 0,
                fact: "그림 속 여인은 '자유'를 상징해요. 들라크루아가 1830년 파리에서 일어난 혁명을 보고 그렸어요."
            },
            {
                country: "프랑스", era: "1876",
                artwork: "물랭 드 라 갈레트의 무도회",
                files: ["Pierre-Auguste_Renoir,_Le_Moulin_de_la_Galette.jpg"],
                wiki: ["Bal_du_moulin_de_la_Galette"], image: "",
                question: "이 그림 속 사람들은 무엇을 하고 있을까요?",
                options: ["야외에서 춤추며 이야기하기", "농사짓기", "배 타기", "잠자기"],
                answer: 0,
                fact: "르누아르가 파리 몽마르트르 언덕에서 열린 즐거운 일요일 무도회를 그렸어요."
            },
            // 이탈리아
            {
                country: "이탈리아", era: "1509–1511",
                artwork: "아테네 학당",
                files: ["\"The_School_of_Athens\"_by_Raffaello_Sanzio_da_Urbino.jpg"],
                wiki: ["The_School_of_Athens"], image: "",
                question: "이 그림 속 사람들은 고대 그리스의 위대한 사상가들이에요. 이들을 무엇이라고 부를까요?",
                options: ["철학자", "해적", "우주비행사", "농부"],
                answer: 0,
                fact: "그림 한가운데에 유명한 철학자 플라톤과 아리스토텔레스가 서 있어요. 이 그림은 바티칸에 있어요."
            },
            {
                country: "이탈리아", era: "1508–1512",
                artwork: "아담의 창조",
                files: ["Michelangelo_-_Creation_of_Adam_(cropped).jpg"],
                wiki: ["The_Creation_of_Adam"], image: "",
                question: "이 유명한 그림에서 두 인물의 어느 부분이 닿을 듯 말 듯 할까요?",
                options: ["손가락", "발", "코", "무릎"],
                answer: 0,
                fact: "미켈란젤로가 로마 시스티나 성당의 천장에 그린 그림이에요."
            },
            {
                country: "이탈리아", era: "1536–1541",
                artwork: "최후의 심판",
                files: ["Last_Judgement_(Michelangelo).jpg"],
                wiki: ["The_Last_Judgment_(Michelangelo)"], image: "",
                question: "시스티나 성당의 '최후의 심판'을 그린 화가는 누구일까요?",
                options: ["미켈란젤로", "클로드 모네", "프리다 칼로", "빈센트 반 고흐"],
                answer: 0,
                fact: "이 거대한 벽화에는 약 300명의 인물이 그려져 있고, 완성하는 데 약 5년이 걸렸어요."
            },
            {
                country: "이탈리아", era: "1512",
                artwork: "갈라테아의 승리",
                files: ["Raffael_013.jpg"],
                wiki: ["Triumph_of_Galatea", "Galatea_(Raphael)"], image: "",
                question: "갈라테아가 조개 배를 타고 바다를 건너고 있어요. 이 배를 끄는 바다 동물은 무엇일까요?",
                options: ["돌고래", "말", "소", "낙타"],
                answer: 0,
                fact: "라파엘로가 1512년 무렵 로마의 한 저택 벽에 직접 그린 프레스코화예요."
            },
            // 일본
            {
                country: "일본", era: "1831",
                artwork: "가나가와 해변의 높은 파도 아래",
                files: ["Tsunami_by_hokusai_19th_century.jpg", "Great_Wave_off_Kanagawa2.jpg"],
                wiki: ["The_Great_Wave_off_Kanagawa"], image: "",
                question: "큰 파도 뒤로 작게 보이는 유명한 산은 무엇일까요?",
                options: ["후지산", "에베레스트산", "킬리만자로산", "마터호른"],
                answer: 0,
                fact: "호쿠사이가 목판화로 만들어서 여러 장이 찍혔고, 전 세계 사람들의 사랑을 받았어요."
            },
            {
                country: "일본", era: "1593",
                artwork: "송림도 병풍",
                files: ["Hasegawa_Tohaku_-_Pine_Trees_(Shōrin-zu_byōbu)_-_right_hand_screen.jpg"],
                wiki: ["Shōrin-zu_byōbu", "Hasegawa_Tōhaku"], image: "",
                question: "이 일본 그림에 그려진 나무는 무엇일까요?",
                options: ["소나무", "야자나무", "사과나무", "벚나무"],
                answer: 0,
                fact: "하세가와 도하쿠는 검은 먹만으로 안개 속 소나무를 그렸어요. 일본의 국보예요."
            },
            {
                country: "일본", era: "17세기",
                artwork: "풍신뇌신도",
                files: [],
                wiki: ["Fūjin", "Raijin", "Tawaraya_Sōtatsu"], image: "",
                question: "금빛 그림 속 두 신은 날씨를 다스려요. 무엇을 다스릴까요?",
                options: ["바람과 천둥", "해와 달", "눈과 얼음", "꽃과 나무"],
                answer: 0,
                fact: "바람의 신은 바람이 가득 든 자루를 메고, 천둥의 신은 북을 쳐서 천둥을 만들어요."
            },
            {
                country: "일본", era: "18세기",
                artwork: "학 (단초즈루)",
                files: [],
                wiki: ["Maruyama_Ōkyo", "Red-crowned_crane"], image: "",
                question: "일본과 한국에서 학은 무엇을 상징할까요?",
                options: ["오래 사는 행복한 삶", "불운", "비 오는 날씨", "분노"],
                answer: 0,
                fact: "학은 오래 살고 복을 누리기를 바라는 마음을 담아 동아시아 그림에 자주 등장해요."
            },
            // 한국
            {
                country: "한국", era: "조선 시대",
                artwork: "조선 왕의 초상화 (어진)",
                files: [],
                wiki: ["Taejo_of_Joseon", "Eojin", "Yeongjo_of_Joseon"], image: "",
                question: "조선 시대 어진에는 누가 그려져 있을까요?",
                options: ["왕", "어부", "농부", "군인"],
                answer: 0,
                fact: "궁중 화가들은 어진을 아주 귀하게 여겨 머리카락 한 올까지 정성껏 그렸어요."
            },
            {
                country: "한국", era: "19세기",
                artwork: "민화",
                files: [],
                wiki: ["Minhwa", "Kkachi_horangi"], image: "",
                question: "한국 민화에 함께 자주 등장하는 두 동물은 무엇일까요?",
                options: ["호랑이와 까치", "고양이와 쥐", "사자와 말", "강아지와 토끼"],
                answer: 0,
                fact: "사람들은 새해에 까치호랑이 그림을 걸어 나쁜 기운을 막고 좋은 소식을 빌었어요."
            },
            {
                country: "한국", era: "12세기",
                artwork: "청자 상감 운학문 매병",
                files: [],
                wiki: ["Vase_with_Cranes_and_Clouds", "Korean_celadon", "Goryeo_celadon"], image: "",
                question: "고려청자는 아름다운 빛깔로 유명해요. 어떤 색일까요?",
                options: ["비취색 (옥빛 초록)", "빨간색", "검은색", "주황색"],
                answer: 0,
                fact: "고려의 도공들은 청자에 구름과 학 무늬를 새겨 넣었고, 고려청자는 세계적으로 사랑받게 되었어요."
            },
            {
                country: "한국", era: "18세기",
                artwork: "달항아리",
                files: [],
                wiki: ["Moon_jar", "Joseon_white_porcelain", "Korean_pottery_and_porcelain"], image: "",
                question: "이 둥근 흰 항아리를 왜 '달항아리'라고 부를까요?",
                options: ["보름달처럼 생겨서", "달에서 만들어서", "밤에만 써서", "아주 작아서"],
                answer: 0,
                fact: "위쪽과 아래쪽을 따로 빚어 이어 붙여서, 달항아리는 모양이 조금씩 다 달라요."
            },
            // 튀르키예
            {
                country: "튀르키예", era: "9세기",
                artwork: "아야 소피아 모자이크",
                files: [],
                wiki: ["Deësis", "Deesis", "Hagia_Sophia"], image: "",
                question: "아야 소피아는 어느 도시에 있을까요?",
                options: ["이스탄불", "파리", "도쿄", "뉴욕"],
                answer: 0,
                fact: "아야 소피아는 약 1,500년 된 건물로, 반짝이는 금빛 모자이크로 유명해요."
            },
            {
                country: "튀르키예", era: "16세기",
                artwork: "이즈니크 타일",
                files: [],
                wiki: ["İznik_pottery", "Iznik_pottery", "Sultan_Ahmed_Mosque"], image: "",
                question: "이스탄불의 블루 모스크는 수많은 타일로 꾸며져 있어요. 타일의 주된 색은 무엇일까요?",
                options: ["파란색", "분홍색", "갈색", "보라색"],
                answer: 0,
                fact: "이즈니크라는 마을에서 손으로 그린 타일 2만 장 이상이 모스크 안을 장식하고 있어요."
            },
            {
                country: "튀르키예", era: "16세기",
                artwork: "오스만 세밀화",
                files: [],
                wiki: ["Ottoman_miniature", "Surname-i_Vehbi"], image: "",
                question: "오스만 세밀화는 어떤 그림으로 유명할까요?",
                options: ["작고 아주 섬세한 그림", "집채만큼 큰 그림", "검은색으로만 그린 그림", "돌로 만든 그림"],
                answer: 0,
                fact: "이 작은 그림들은 책 속에 그려졌고, 축제와 행렬, 궁궐 생활을 보여 줘요."
            },
            {
                country: "튀르키예", era: "16세기",
                artwork: "에브루 (튀르키예 마블링 종이)",
                files: [],
                wiki: ["Paper_marbling", "Ebru"], image: "",
                question: "튀르키예 예술가들은 에브루를 만들 때 어디에 물감을 떨어뜨린 뒤 종이를 올릴까요?",
                options: ["물", "모래", "눈", "빵"],
                answer: 0,
                fact: "물감이 물 위에서 만드는 무늬는 똑같이 두 번 만들 수 없어서, 에브루 작품은 모두 세상에 하나뿐이에요."
            },
            // 네덜란드
            {
                country: "네덜란드", era: "1889",
                artwork: "별이 빛나는 밤",
                files: ["Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg"],
                wiki: ["The_Starry_Night"], image: "",
                question: "'별이 빛나는 밤'을 그린 화가는 누구일까요?",
                options: ["빈센트 반 고흐", "레오나르도 다빈치", "프리다 칼로", "미켈란젤로"],
                answer: 0,
                fact: "반 고흐는 1889년 창밖으로 보이는 소용돌이치는 밤하늘을 그렸어요. 지금은 미국 뉴욕에 있어요."
            },
            {
                country: "네덜란드", era: "1665",
                artwork: "진주 귀걸이를 한 소녀",
                files: ["1665_Girl_with_a_Pearl_Earring.jpg"],
                wiki: ["Girl_with_a_Pearl_Earring"], image: "",
                question: "이 유명한 그림 속 소녀가 하고 있는 장신구는 무엇일까요?",
                options: ["진주 귀걸이", "금관", "다이아몬드 목걸이", "은팔찌"],
                answer: 0,
                fact: "페르메이르가 1665년 무렵 그린 그림으로, '북유럽의 모나리자'라고도 불려요."
            },
            // 스페인
            {
                country: "스페인", era: "1656",
                artwork: "시녀들 (라스 메니나스)",
                files: ["Las_Meninas,_by_Diego_Velázquez,_from_Prado_in_Google_Earth.jpg"],
                wiki: ["Las_Meninas"], image: "",
                question: "이 그림 한가운데에 있는 어린 소녀는 누구일까요?",
                options: ["스페인의 공주", "농부의 딸", "유명한 가수", "학교 선생님"],
                answer: 0,
                fact: "뒤쪽 벽의 거울을 자세히 보세요. 스페인의 왕과 왕비가 비쳐 보여요."
            },
            {
                country: "스페인", era: "1814",
                artwork: "1808년 5월 3일",
                files: ["El_Tres_de_Mayo,_by_Francisco_de_Goya,_from_Prado_thin_black_margin.jpg"],
                wiki: ["The_Third_of_May_1808"], image: "",
                question: "흰 셔츠를 입은 남자가 무언가를 높이 들어 올리고 있어요. 무엇일까요?",
                options: ["두 팔", "우산", "깃발", "등불"],
                answer: 0,
                fact: "프란시스코 고야가 1814년에 그린 전쟁 장면이에요. 스페인 마드리드의 프라도 미술관에서 볼 수 있어요."
            },
            // 멕시코
            {
                country: "멕시코", era: "1500년 무렵",
                artwork: "아즈텍 태양의 돌",
                files: [],
                wiki: ["Aztec_sun_stone", "Aztec_calendar_stone", "Sun_Stone"], image: "",
                question: "이 거대한 둥근 돌 조각은 멕시코의 어느 고대 사람들이 만들었을까요?",
                options: ["아즈텍인", "바이킹", "로마인", "이집트인"],
                answer: 0,
                fact: "태양의 돌은 무게가 약 24톤이에요. 1790년 멕시코시티의 땅속에서 발견되어 지금은 그곳 박물관에 있어요."
            },
            // 노르웨이
            {
                country: "노르웨이", era: "1893",
                artwork: "절규",
                files: ["Edvard_Munch,_1893,_The_Scream,_oil,_tempera_and_pastel_on_cardboard,_91_x_73_cm,_National_Gallery_of_Norway.jpg"],
                wiki: ["The_Scream"], image: "",
                question: "그림 속 사람이 얼굴을 감싸고 있어요. 무엇을 하고 있을까요?",
                options: ["비명 지르기", "노래하기", "잠자기", "웃기"],
                answer: 0,
                fact: "노르웨이의 화가 에드바르 뭉크는 '절규'를 여러 가지 버전으로 만들었어요."
            }
        ];
  const VOCAB = [{"question": "Abate", "options": ["Moderate", "Increase", "Find", "Hope"], "answer": 1}, {"question": "Adhere", "options": ["Disobey", "Comply", "Wander", "Present"], "answer": 1}, {"question": "Pensive", "options": ["Oppressed", "Caged", "Thoughtful", "Happy"], "answer": 2}, {"question": "Saccharine", "options": ["Leave", "Sweet", "Arid", "Quit"], "answer": 1}, {"question": "Acumen", "options": ["Awareness", "Stupidity", "Ignorance", "Belligerent"], "answer": 0}, {"question": "Adversity", "options": ["Friend", "Prosperous", "Fortunte", "Misfortune"], "answer": 3}, {"question": "Kin", "options": ["Exult", "Friend", "Relative", "Twist"], "answer": 2}, {"question": "Accord", "options": ["Discord", "Document", "Agreement", "Speech"], "answer": 2}, {"question": "Society", "options": ["Indivdual", "Civilisation", "Nomad", "Caretaker"], "answer": 1}, {"question": "Happy", "options": ["Merry", "Incredulous", "Dizzy", "Revolting"], "answer": 0}, {"question": "Technology", "options": ["Metal", "Innovation", "Science", "Teleportation"], "answer": 1}, {"question": "Generic", "options": ["General", "Fresh", "Cheap", "Elderly"], "answer": 0}, {"question": "Reverie", "options": ["Palimpsest", "Ghost", "Daydream", "Curious"], "answer": 2}, {"question": "March", "options": ["Strut", "Fear", "Jump", "Tie"], "answer": 0}, {"question": "Custom", "options": ["Dessert", "Habit", "Ethic", "Deliver"], "answer": 1}, {"question": "Upright", "options": ["Honorable", "Horizontal", "Humble", "Supine"], "answer": 0}, {"question": "Loot", "options": ["Destruction", "Waste", "Spoils", "Cavort"], "answer": 2}, {"question": "Qualm", "options": ["Distress", "Impunity", "Persevere", "Scruple"], "answer": 0}, {"question": "Wary", "options": ["Calm", "Curved", "Confused", "Cautious"], "answer": 3}, {"question": "Aloof", "options": ["Above", "Tidy", "Clever", "Reserved"], "answer": 3}, {"question": "Imply", "options": ["Suggest", "Stab", "Thick", "Destroy"], "answer": 0}, {"question": "Utter", "options": ["Express", "Defer", "Borrow", "Laugh"], "answer": 0}, {"question": "Rake", "options": ["Thin", "Scoundrel", "Gentleman", "Shovel"], "answer": 3}, {"question": "Beneficial", "options": ["Help", "Advantageous", "Charity", "Wise"], "answer": 1}];
  const ICONS = [{"ko": "인스타그램", "en": "instagram", "img": "images/games/icon-1.webp"}, {"ko": "카카오톡", "en": "kakaotalk", "img": "images/games/icon-2.webp"}, {"ko": "날씨", "en": "weather", "img": "images/games/icon-3.webp"}, {"ko": "카메라", "en": "camera", "img": "images/games/icon-4.webp"}, {"ko": "전화", "en": "phone", "img": "images/games/icon-5.webp"}, {"ko": "메시지", "en": "messages", "img": "images/games/icon-6.svg"}, {"ko": "유튜브", "en": "youtube", "img": "images/games/icon-7.webp"}, {"ko": "네이버", "en": "naver", "img": "images/games/icon-8.webp"}, {"ko": "구글", "en": "google", "img": "images/games/icon-9.webp"}, {"ko": "설정", "en": "settings", "img": "images/games/icon-10.webp"}];
  const WORDS = [
    { pre: '노는', opts: ['창', '조', '작', '가', '자', '흠'], ans: '창작자', post: '', practice: true },
    { pre: '컴', opts: ['까', '퓨', '직'], ans: '퓨', post: '터' },
    { pre: '', opts: ['스', '아', '나', '마', '니'], ans: '스마', post: '트폰' },
    { pre: '블루', opts: ['아', '투', '이', '탕', '스'], ans: '투스', post: '' },
    { pre: '', opts: ['카', '커', '키', '튀'], ans: '카', post: '메라' },
    { pre: '', opts: ['우', '유', '미', '하', '모'], ans: '유', post: '튜브' },
    { pre: '', opts: ['인', '헐', '일', '터', '웹'], ans: '인터', post: '넷' },
    { pre: '', opts: ['디', '티', '뒤', '지', '웹'], ans: '디지', post: '털' },
  ];
  const GRID = ["마", "사", "라", "나", "다", "바", "가", "차", "자", "아", "파", "버", "타", "머", "노", "더", "러", "인", "카", "너", "커", "처", "저", "어", "서", "터", "퍼", "는", "고", "터", "도", "크", "리", "에", "이", "터", "토", "오", "소", "코", "창", "넷", "구", "누", "부", "루", "우", "무", "두", "스", "쿠", "니", "리", "작", "기", "추", "유", "투", "주", "디", "이", "지", "마", "피", "미", "치", "자", "히", "튜", "키", "냐", "갸", "뱌", "먀", "랴", "트", "댜", "샤", "야", "챠", "브", "겨", "캬", "녀", "며", "려", "퍄", "뎌", "폰", "벼", "여", "쳐", "교", "뇨", "셔", "아"];
  const SEARCH = [ // word + 1-based cell numbers from the Bubble export
    { w: '노는창작자', c: [15, 28, 41, 54, 67] }, { w: '크리에이터', c: [32, 33, 34, 35, 36] },
    { w: '유튜브', c: [57, 69, 81] }, { w: '인터넷', c: [18, 30, 42] }, { w: '스마트폰', c: [50, 63, 76, 89] },
  ];
  const MEMORY = ['instagram', 'kakaotalk', 'youtube', 'naver', 'google', 'settings', 'phone'];

  /* ---------------- shared pieces ---------------- */
  function head(i, n, score, scoreLabel) {
    return `<div class="g-top"><span>${T(`<b>${i + 1}</b> / ${n} 문제`, `Question <b>${i + 1}</b> of ${n}`)}</span><span>${scoreLabel || T('점수', 'Score')} <b>${score}</b></span></div><div class="progress"><i style="width:${(i + 1) / n * 100}%"></i></div>`;
  }
  function result(root, { score, total, unit, rank, msg, ww, onRestart }) {
    root.innerHTML = `<div class="g-card g-result">
      <span class="tag">${T('완료', 'Finished')}</span>
      <h2>${T('모든 문제를 풀었어요!', 'You finished every question!')}</h2>
      <div class="big">${unit === 'pts' ? score + T('점', ' pts') : `${score} / ${total}`}</div>
      ${rank ? `<b style="font-size:1.15rem">${esc(rank)}</b>` : ''}${msg ? `<p>${esc(msg)}</p>` : ''}
      <div class="g-actions"><button class="btn btn-primary" type="button" data-restart>${T('다시 도전하기', 'Play again')}</button>${ww ? `<a class="btn btn-ghost" href="${WW}" target="_blank" rel="noopener">${T('Wander & Wonder 방문하기', 'Visit Wander & Wonder')}</a>` : ''}</div>
    </div>`;
    root.querySelector('[data-restart]').addEventListener('click', onRestart);
  }
  const rankOf = (pct, ranks) => pct >= 0.85 ? ranks[0] : pct >= 0.55 ? ranks[1] : ranks[2];

  /* ---------------- multiple-choice quiz (trivia, country, art, vocabulary) ---------------- */
  function mcQuiz(root, cfg) {
    let qs, i, score, answered, tries;
    const start = () => {
      qs = (cfg.shuffle ? shuffle(cfg.data) : cfg.data.slice()).slice(0, cfg.limit || 999).map(q => {
        const right = q.options[q.answer];
        const options = cfg.shuffleOptions ? shuffle(q.options) : q.options.slice();
        return { ...q, options, answer: options.indexOf(right) };
      });
      i = 0; score = 0; show();
    };
    const show = () => {
      const q = qs[i]; answered = false; tries = 0;
      const tags = (cfg.tags ? cfg.tags(q) : []).filter(Boolean).map(t => `<span class="tag">${esc(t)}</span>`).join('');
      root.innerHTML = `<div class="g-card">${head(i, qs.length, cfg.points ? score * 10 : score, cfg.points ? null : T('맞힌 문제', 'Correct'))}
        ${tags ? `<div class="g-tags">${tags}</div>` : ''}
        ${cfg.image ? `<div class="g-art loading"><span class="muted">${T('그림을 불러오는 중…', 'Loading image…')}</span></div><p class="g-credit"></p>` : ''}
        ${q.artwork ? `<p class="muted center" style="font-weight:700;margin-bottom:6px">${esc(q.artwork)}</p>` : ''}
        <p class="g-q">${esc(q.question)}</p>
        <p class="g-hint" hidden></p>
        <div class="g-opts">${q.options.map((o, k) => `<button class="g-opt" type="button" data-k="${k}"><span class="mk">${cfg.letters ? 'ABCD'[k] : k + 1}</span><span>${esc(o)}</span></button>`).join('')}</div>
        <div class="g-fact" hidden></div><p class="g-msg" aria-live="polite"></p>
        <div class="g-actions">${q.hint ? `<button class="btn btn-ghost" type="button" data-hint>${T('힌트 보기', 'Show hint')}</button>` : ''}<button class="btn btn-primary" type="button" data-next hidden>${i === qs.length - 1 ? T('결과 보기', 'See results') : T('다음 문제', 'Next question')}</button></div>
      </div>`;
      if (cfg.image) cfg.image(q, root.querySelector('.g-art'), root.querySelector('.g-credit'), () => qs[i] === q);
      root.querySelectorAll('.g-opt').forEach(b => b.addEventListener('click', () => pick(+b.dataset.k, b)));
      const hb = root.querySelector('[data-hint]');
      if (hb) hb.addEventListener('click', () => { const h = root.querySelector('.g-hint'); h.textContent = '💡 ' + q.hint; h.hidden = false; hb.disabled = true; });
      root.querySelector('[data-next]').addEventListener('click', () => { i++; i < qs.length ? show() : finish(); });
    };
    const pick = (k, btn) => {
      if (answered) return;
      const q = qs[i], all = root.querySelectorAll('.g-opt'), msg = root.querySelector('.g-msg');
      tries++;
      if (k === q.answer) {
        answered = true; if (tries === 1) score++;
        all.forEach((b, j) => { b.disabled = true; if (j === k) { b.classList.add('ok'); b.querySelector('.mk').innerHTML = CHECK; } else if (!b.classList.contains('bad')) b.classList.add('dim'); });
        msg.className = 'g-msg ok'; msg.textContent = T('정답입니다!', 'Correct!');
      } else if (cfg.retry) {
        btn.classList.add('bad'); btn.disabled = true; btn.querySelector('.mk').innerHTML = CROSS; shake(btn);
        msg.className = 'g-msg bad'; msg.textContent = T('다시 한번 생각해 보세요.', 'Not quite. Try again.');
        return;
      } else {
        answered = true;
        btn.classList.add('bad'); btn.querySelector('.mk').innerHTML = CROSS;
        all[q.answer].classList.add('ok'); all[q.answer].querySelector('.mk').innerHTML = CHECK;
        all.forEach(b => { b.disabled = true; });
        msg.className = 'g-msg bad'; msg.textContent = T('아쉬워요!', 'Not quite!');
      }
      if (q.fact) { const f = root.querySelector('.g-fact'); f.innerHTML = `<b>${k === q.answer ? T('정답이에요! ', 'Correct! ') : T('알고 계셨나요? ', 'Did you know? ')}</b>${esc(q.fact)}`; f.hidden = false; msg.textContent = ''; }
      const hb = root.querySelector('[data-hint]'); if (hb) hb.hidden = true;
      const nx = root.querySelector('[data-next]'); nx.hidden = false; nx.focus({ preventScroll: true });
    };
    const finish = () => {
      const pct = score / qs.length, r = cfg.ranks ? rankOf(pct, cfg.ranks) : null;
      result(root, { score: cfg.points ? score * 10 : score, total: qs.length, unit: cfg.points ? 'pts' : '', rank: r && r[0], msg: r && r[1], ww: cfg.ww, onRestart: start });
    };
    start();
  }

  /* ---------------- letter slots (word completion, idioms) ---------------- */
  function slotQuiz(root, cfg) {
    let qs, i, score, input, done;
    const start = () => { qs = cfg.make(); i = 0; score = 0; show(); };
    const show = () => {
      const q = qs[i]; input = []; done = false;
      root.innerHTML = `<div class="g-card">${head(i, qs.length, cfg.points ? score * 10 : score, cfg.points ? null : T('맞힌 문제', 'Correct'))}
        ${q.practice ? `<div class="g-tags"><span class="tag">${T('연습 문제', 'Practice')}</span></div>` : ''}
        ${q.prompt ? `<p class="g-q">${esc(q.prompt)}${q.sub ? `<span class="g-sub">${esc(q.sub)}</span>` : ''}</p>` : ''}
        <p class="g-hint" hidden></p>
        <div class="g-word">${q.pre ? `<span>${esc(q.pre)}</span>` : ''}${q.ans.map(() => '<span class="g-slot"></span>').join('')}${q.post ? `<span>${esc(q.post)}</span>` : ''}</div>
        <div class="g-chars">${q.opts.map((c, k) => `<button class="g-char" type="button" data-k="${k}" aria-label="${esc(c)}">${esc(c)}</button>`).join('')}</div>
        <p class="g-msg" aria-live="polite"></p>
        <div class="g-actions">${q.hint ? `<button class="btn btn-ghost" type="button" data-hint>${T('초성 힌트', 'Hint')}</button>` : ''}<button class="btn btn-ghost" type="button" data-erase>${T('한 글자 지우기', 'Erase one letter')}</button><button class="btn btn-primary" type="button" data-next hidden>${i === qs.length - 1 ? T('결과 보기', 'See results') : T('다음 문제', 'Next question')}</button></div>
      </div>`;
      root.querySelectorAll('.g-char').forEach(b => b.addEventListener('click', () => add(+b.dataset.k)));
      root.querySelector('[data-erase]').addEventListener('click', () => { if (done || !input.length) return; input.pop(); paint(); root.querySelector('.g-msg').textContent = ''; });
      const hb = root.querySelector('[data-hint]');
      if (hb) hb.addEventListener('click', () => { const h = root.querySelector('.g-hint'); h.textContent = q.hint; h.hidden = false; hb.disabled = true; });
      root.querySelector('[data-next]').addEventListener('click', () => { i++; i < qs.length ? show() : result(root, { score: cfg.points ? score * 10 : score, total: qs.length, unit: cfg.points ? 'pts' : '', onRestart: start }); });
    };
    const paint = () => {
      const q = qs[i];
      root.querySelectorAll('.g-slot').forEach((s, k) => { s.textContent = input[k] != null ? q.opts[input[k]] : ''; s.classList.toggle('filled', input[k] != null); });
      root.querySelectorAll('.g-char').forEach((b, k) => b.classList.toggle('used', input.includes(k)));
    };
    const add = k => {
      const q = qs[i]; if (done || input.length >= q.ans.length || input.includes(k)) return;
      input.push(k); paint();
      if (input.length < q.ans.length) return;
      const msg = root.querySelector('.g-msg'), slots = root.querySelectorAll('.g-slot');
      if (input.map(x => q.opts[x]).join('') === q.ans.join('')) {
        done = true; if (!q.practice) score++;
        slots.forEach(s => s.classList.add('ok'));
        msg.className = 'g-msg ok'; msg.textContent = T('정답입니다!', 'Correct!');
        root.querySelector('[data-erase]').hidden = true; const hb = root.querySelector('[data-hint]'); if (hb) hb.hidden = true;
        const nx = root.querySelector('[data-next]'); nx.hidden = false; nx.focus({ preventScroll: true });
      } else {
        slots.forEach(s => { s.classList.add('bad'); shake(s); });
        msg.className = 'g-msg bad'; msg.textContent = T('다시 한번 생각해 보세요.', 'Not quite. Try again.');
        setTimeout(() => { input = []; slots.forEach(s => s.classList.remove('bad')); paint(); }, 600);
      }
    };
    start();
  }

  /* ---------------- picture quiz ---------------- */
  function pictureQuiz(root) {
    let qs, i, score;
    const norm = s => String(s).toLowerCase().replace(/\s+/g, '');
    const start = () => { qs = shuffle(ICONS); i = 0; score = 0; show(); };
    const show = () => {
      const q = qs[i];
      root.innerHTML = `<div class="g-card">${head(i, qs.length, score, T('맞힌 문제', 'Correct'))}
        <img class="g-pic" src="${q.img}" alt="${T('문제 그림', 'Picture to identify')}">
        <form class="g-form" novalidate><label class="sr" for="pq-in">${T('정답', 'Answer')}</label>
          <input class="g-input" id="pq-in" autocomplete="off" placeholder="${T('정답을 입력해 주세요', 'Type your answer')}">
          <p class="g-hint" hidden style="margin:14px 0 0"></p><p class="g-msg" aria-live="polite"></p>
          <div class="g-actions"><button class="btn btn-ghost" type="button" data-hint>${T('첫 글자 힌트', 'First-letter hint')}</button><button class="btn btn-ghost" type="button" data-skip>${T('정답 보기', 'Show answer')}</button><button class="btn btn-primary" type="submit">${T('확인', 'Check')}</button></div>
        </form></div>`;
      const f = root.querySelector('form'), inp = f.querySelector('input'), msg = f.querySelector('.g-msg');
      const next = () => { i++; i < qs.length ? show() : result(root, { score, total: qs.length, onRestart: start }); };
      const solved = (ok) => {
        f.querySelector('.g-actions').innerHTML = `<button class="btn btn-primary" type="button" data-next>${i === qs.length - 1 ? T('결과 보기', 'See results') : T('다음 문제', 'Next question')}</button>`;
        f.querySelector('[data-next]').addEventListener('click', next); f.querySelector('[data-next]').focus();
        inp.disabled = true; msg.className = 'g-msg ' + (ok ? 'ok' : '');
        msg.textContent = ok ? T('정답입니다!', 'Correct!') : T(`정답은 "${q.ko}" (${q.en}) 입니다.`, `The answer is "${q.en}" (${q.ko}).`);
      };
      f.addEventListener('submit', e => {
        e.preventDefault(); if (!inp.value.trim()) { inp.focus(); return; }
        if ([q.ko, q.en].some(a => norm(a) === norm(inp.value))) { score++; solved(true); }
        else { msg.className = 'g-msg bad'; msg.textContent = T('다시 한번 생각해 보세요.', 'Not quite. Try again.'); shake(inp); inp.select(); }
      });
      f.querySelector('[data-hint]').addEventListener('click', e => { const h = f.querySelector('.g-hint'); h.textContent = T(`첫 글자: ${q.ko[0]}`, `Starts with: ${q.en[0].toUpperCase()}`); h.hidden = false; e.currentTarget.disabled = true; });
      f.querySelector('[data-skip]').addEventListener('click', () => solved(false));
      inp.focus({ preventScroll: true });
    };
    start();
  }

  /* ---------------- memory ---------------- */
  function memory(root) {
    let open, tries, found, lock;
    MEMORY.forEach(e => { new Image().src = `images/games/mem-${e}.webp`; });
    const start = () => {
      const deck = shuffle([...MEMORY, ...MEMORY]); open = []; tries = 0; found = 0; lock = false;
      root.innerHTML = `<div class="g-card"><div class="g-top"><span>${T('시도', 'Tries')} <b data-tries>0</b></span><span>${T('찾은 짝', 'Pairs found')} <b data-found>0</b> / ${MEMORY.length}</span></div>
        <div class="mem">${deck.map((e, k) => `<button type="button" data-e="${e}" aria-label="${T('카드', 'Card')} ${k + 1}"><img src="images/logo-faces.webp" alt=""></button>`).join('')}</div>
        <p class="g-msg ok" aria-live="polite"></p><div class="g-actions"><button class="btn btn-ghost" type="button" data-restart>${T('처음부터 다시', 'Start over')}</button></div></div>`;
      root.querySelector('[data-restart]').addEventListener('click', start);
      root.querySelectorAll('.mem button').forEach(b => b.addEventListener('click', () => flip(b)));
    };
    const face = (b, up) => { b.innerHTML = up ? `<img class="face" src="images/games/mem-${b.dataset.e}.webp" alt="">` : '<img src="images/logo-faces.webp" alt="">'; b.classList.toggle('open', up); };
    const flip = b => {
      if (lock || b.classList.contains('open') || b.classList.contains('done')) return;
      face(b, true); open.push(b);
      if (open.length < 2) return;
      tries++; root.querySelector('[data-tries]').textContent = tries;
      const [a, c] = open; open = [];
      if (a.dataset.e === c.dataset.e) {
        [a, c].forEach(x => { x.classList.remove('open'); x.classList.add('done'); });
        found++; root.querySelector('[data-found]').textContent = found;
        if (found === MEMORY.length) root.querySelector('.g-msg').textContent = T(`모든 짝을 찾았어요! ${tries}번 만에 성공했습니다.`, `You found every pair in ${tries} tries!`);
      } else { lock = true; setTimeout(() => { face(a, false); face(c, false); lock = false; }, 1000); }
    };
    start();
  }

  /* ---------------- word search ---------------- */
  function wordSearch(root) {
    const words = SEARCH.map(x => ({ w: x.w, c: x.c.map(n => n - 1) }));
    let sel, found;
    const start = () => {
      sel = []; found = new Set();
      root.innerHTML = `<div class="g-card"><div class="ws-words">${words.map((x, k) => `<span data-w="${k}">${esc(x.w)}</span>`).join('')}</div>
        <div class="ws">${GRID.map((ch, k) => `<button type="button" data-k="${k}">${esc(ch)}</button>`).join('')}</div>
        <p class="g-msg" aria-live="polite"></p><div class="g-actions"><button class="btn btn-ghost" type="button" data-clear>${T('선택 지우기', 'Clear selection')}</button><button class="btn btn-ghost" type="button" data-restart>${T('처음부터 다시', 'Start over')}</button></div></div>`;
      root.querySelectorAll('.ws button').forEach(b => b.addEventListener('click', () => tap(+b.dataset.k)));
      root.querySelector('[data-clear]').addEventListener('click', () => { sel = []; paint(); });
      root.querySelector('[data-restart]').addEventListener('click', start);
    };
    const paint = () => root.querySelectorAll('.ws button').forEach((b, k) => b.classList.toggle('sel', sel.includes(k)));
    const prefixOf = s => words.filter((x, k) => !found.has(k) && s.every((v, j) => x.c[j] === v));
    const tap = k => {
      const msg = root.querySelector('.g-msg');
      if (root.querySelector(`.ws [data-k="${k}"]`).classList.contains('found') && !prefixOf([...sel, k]).length) return;
      let next = [...sel, k];
      if (!prefixOf(next).length) {
        const b = root.querySelector(`.ws [data-k="${k}"]`); b.classList.add('bad'); shake(b); setTimeout(() => b.classList.remove('bad'), 500);
        next = prefixOf([k]).length ? [k] : [];
        msg.className = 'g-msg bad'; msg.textContent = T('순서가 맞지 않아요. 단어의 첫 글자부터 다시 눌러 보세요.', "That's not the next letter. Start again from the first letter of a word.");
      } else msg.textContent = '';
      sel = next;
      const hit = words.findIndex((x, j) => !found.has(j) && x.c.length === sel.length && x.c.every((v, m) => v === sel[m]));
      if (hit >= 0) {
        found.add(hit); words[hit].c.forEach(c => root.querySelector(`.ws [data-k="${c}"]`).classList.add('found'));
        root.querySelector(`[data-w="${hit}"]`).classList.add('found'); sel = [];
        msg.className = 'g-msg ok'; msg.textContent = found.size === words.length ? T('모든 단어를 찾았어요! 훌륭합니다.', 'You found every word. Well done!') : T(`"${words[hit].w}" 찾았어요!`, `Found "${words[hit].w}"!`);
      }
      paint();
    };
    start();
  }

  /* ---------------- artwork images (Wikimedia, loaded on the live site) ---------------- */
  const imgCache = {};
  function tryImg(src) { return new Promise(res => { const im = new Image(); const t = setTimeout(() => res(false), 9000); im.onload = () => { clearTimeout(t); res(im.naturalWidth > 0); }; im.onerror = () => { clearTimeout(t); res(false); }; im.src = src; }); }
  async function firstOk(list) { for (const x of list) if (await tryImg(x.src)) return x; return null; }
  async function wikiList(titles) {
    if (!titles || !titles.length) return [];
    try {
      const r = await fetch('https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=800&titles=' + encodeURIComponent(titles.join('|')));
      const d = await r.json(), out = [];
      Object.values((d.query && d.query.pages) || {}).forEach(p => { if (p.thumbnail) out.push({ src: p.thumbnail.source, credit: 'Wikipedia – ' + p.title, url: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(p.title.replace(/ /g, '_')) }); });
      return out;
    } catch (e) { return []; }
  }
  function artImage(q, frame, credit, still) {
    if (!imgCache[q.artwork]) {
      const direct = [...(q.image ? [{ src: q.image }] : []), ...(q.files || []).map(f => ({ src: 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(f) + '?width=800', credit: 'Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(f) }))];
      imgCache[q.artwork] = firstOk(direct).then(x => x || wikiList(q.wiki).then(firstOk));
    }
    imgCache[q.artwork].then(info => {
      if (!still()) return;
      if (!info) { frame.innerHTML = `<span class="muted" style="text-align:center;padding:16px">🎨<br>${esc(q.artwork)}</span>`; return; }
      frame.innerHTML = `<img src="${esc(info.src)}" alt="${esc(q.artwork)}">`;
      if (info.url) credit.innerHTML = `${T('이미지', 'Image')}: <a href="${esc(info.url)}" target="_blank" rel="noopener">${esc(info.credit)}</a>`;
    });
  }

  /* ---------------- registry ---------------- */
  const KO_ONLY = T('', 'This game is in Korean.');
  const GAMES = {
    'word-completion': { note: KO_ONLY, howto: [T('빈칸에 들어갈 글자를 순서대로 눌러 단어를 완성하세요.', 'Tap the letters in order to fill the blanks and complete the word.'), T('첫 문제는 연습 문제예요. 틀리면 다시 고를 수 있어요.', "The first one is for practice. If you get it wrong, just try again.")],
      run: r => slotQuiz(r, { make: () => WORDS.map(w => ({ ...w, ans: [...w.ans] })) }) },
    'memory': { howto: [T('16장의 카드가 뒤집힌 채로 시작합니다.', 'All 16 cards start face down.'), T('한 번에 카드 2장을 뒤집을 수 있습니다.', 'Flip two cards at a time.'), T('같은 그림이면 열린 채로 남고, 다르면 다시 뒤집힙니다.', 'Matching pictures stay face up; others flip back.'), T('카드의 위치를 기억하며 모든 짝을 찾아보세요.', 'Remember where each card is and find every pair.')], run: memory },
    'vocabulary': { howto: [T('제시된 영어 단어와 뜻이 가장 비슷한 단어를 고르세요.', 'Choose the word closest in meaning to the word shown.')],
      run: r => mcQuiz(r, { data: VOCAB, shuffle: true, letters: true }) },
    'picture-quiz': { howto: [T('그림을 보고 무엇인지 입력한 뒤 확인을 누르세요.', 'Look at the picture, type what it is and press Check.'), T('한글이나 영어 중 편한 말로 써도 됩니다.', 'You can answer in Korean or English.')], run: pictureQuiz },
    'word-search': { note: KO_ONLY, howto: [T('위에 있는 단어들이 글자판 속에 가로, 세로, 대각선으로 숨어 있어요.', 'The words listed at the top are hidden across, down or diagonally in the grid.'), T('단어의 첫 글자부터 마지막 글자까지 순서대로 눌러 주세요.', 'Tap the letters of a word in order, from first to last.'), T('맞게 찾으면 초록색으로 표시됩니다.', 'Words you find turn green.')], run: wordSearch },
    'idiom-quiz': { note: KO_ONLY, howto: [T('뜻풀이를 읽고 알맞은 글자를 순서대로 눌러 사자성어를 완성하세요.', 'Read the meaning, then tap the letters in order to complete the four-character idiom.'), T('어려우면 초성 힌트를 눌러 보세요.', 'Stuck? Press Hint to see the first consonants.')],
      run: r => slotQuiz(r, { points: true, make: () => shuffle(IDIOMS).map(q => ({ prompt: q.meaning, sub: q.hanja, hint: q.chosung, ans: [...q.word], opts: shuffle([...q.word, ...q.distractors]) })) }) },
    'trivia': { note: KO_ONLY, howto: [T('알맞은 답을 고르세요. 틀리면 다시 고를 수 있어요.', 'Choose the right answer. If you miss, you can try again.'), T('어려우면 힌트를 볼 수 있어요. 처음에 맞히면 10점!', 'Use a hint if you need one. Getting it on the first try earns 10 points.')],
      run: r => mcQuiz(r, { data: TRIVIA.map(q => ({ ...q, options: q.choices })), shuffle: true, retry: true, points: true, tags: q => [q.category] }) },
    'country-quiz': { note: KO_ONLY, howto: [T('각 나라에 대한 질문에 알맞은 답을 고르세요.', 'Choose the right answer about each country.'), T('답을 고르면 그 나라의 재미있는 이야기를 알려드려요.', "After you answer, you'll learn a fun fact.")],
      run: r => mcQuiz(r, { data: COUNTRY, shuffle: true, shuffleOptions: true, tags: q => [q.country], ww: true,
        ranks: [[T('세계 탐험가 ✈️', 'World explorer ✈️'), T('대단해요! 노련한 여행자처럼 이 나라들을 잘 알고 있네요. 이제 다음 여행을 계획해 볼까요?', 'Amazing! You know these countries like a seasoned traveler.')], [T('호기심 많은 여행자 🧳', 'Curious traveler 🧳'), T('잘했어요! 세계에 대해 많이 알고 있네요. 다시 도전해서 놓친 상식도 알아보세요.', 'Nice work! Try again to learn the facts you missed.')], [T('미래의 모험가 🗺️', 'Future adventurer 🗺️'), T('모든 탐험가에게는 시작이 있어요. 재미있는 상식을 읽고 다시 도전해 점수를 올려 보세요!', 'Every explorer starts somewhere. Read the facts and try again!')]] }) },
    'art-quiz': { note: KO_ONLY, howto: [T('세계의 유명한 작품을 감상하고 질문에 알맞은 답을 고르세요.', 'Look at famous artworks from around the world and choose the right answer.'), T('답을 고르면 작품에 얽힌 이야기를 알려드려요.', "After you answer, you'll learn the story behind the work.")],
      run: r => mcQuiz(r, { data: ART, shuffle: true, shuffleOptions: true, tags: q => [q.country, q.era], image: artImage, ww: true,
        ranks: [[T('미술관 큐레이터 🖼️', 'Museum curator 🖼️'), T('대단해요! 세계의 명작을 큐레이터처럼 잘 알고 있네요.', 'Amazing! You know the masterpieces like a curator.')], [T('예술 애호가 🎨', 'Art lover 🎨'), T('잘했어요! 다시 도전해서 놓친 이야기도 알아보세요.', 'Nice work! Try again to learn the stories you missed.')], [T('미래의 감상가 🖌️', 'Future art fan 🖌️'), T('모든 예술 여행에는 시작이 있어요. 다시 도전해 점수를 올려 보세요!', 'Every art journey starts somewhere. Try again!')]] }) },
  };

  window.NCGames = {
    has: slug => !!GAMES[slug],
    info: slug => GAMES[slug],
    mount(slug, root) { const g = GAMES[slug]; root.innerHTML = ''; if (g) g.run(root); },
  };
})();
