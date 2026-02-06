/**
 * ✅ [연결 완료] 디자인팀 실시간 공유 설정이 적용되었습니다.
 */
const firebaseConfig = {
    apiKey: "AIzaSyBKPzEZK6xg4KfNITdHzMotIn_oI6k7k6c",
    authDomain: "designaihub-186dc.firebaseapp.com",
    databaseURL: "https://designaihub-186dc-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "designaihub-186dc",
    storageBucket: "designaihub-186dc.firebasestorage.app",
    messagingSenderId: "851861297940",
    appId: "1:851861297940:web:71f9638b9dff6729458001",
    measurementId: "G-DQ1PSP452G"
};

// Firebase 초기화
const isFirebaseReady = firebaseConfig.apiKey !== "YOUR_API_KEY";
let db = null;

if (isFirebaseReady) {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
}

// ---------------------------------------------------------
// 초기 추천 데이터 세트 (25선)
// ---------------------------------------------------------
const DEFAULT_TOOLS = [
    { name: "Dribbble", creator: "System", category: "영감 & 레퍼런스 (Inspiration)", description: "전 세계 디자이너들의 최신 트렌드와 포트폴리오를 확인할 수 있는 대표 플랫폼입니다.", url: "https://dribbble.com", source: "external", password: "admin" },
    { name: "Mobbin", creator: "System", category: "영감 & 레퍼런스 (Inspiration)", description: "최신 모바일 앱 UI 패턴과 스크린샷 레퍼런스를 가장 방대하게 보유한 곳입니다.", url: "https://mobbin.com", source: "external", password: "admin" },
    { name: "Behance", creator: "System", category: "영감 & 레퍼런스 (Inspiration)", description: "어도비에서 운영하는 고퀄리티 프로젝트 중심의 포트폴리오 사이트입니다.", url: "https://www.behance.net", source: "external", password: "admin" },
    { name: "Awwwards", creator: "System", category: "영감 & 레퍼런스 (Inspiration)", description: "전 세계의 창의적이고 실험적인 웹 디자인 수상작들을 모아 놓은 곳입니다.", url: "https://www.awwwards.com", source: "external", password: "admin" },
    { name: "Unsplash", creator: "System", category: "무료 소스 & 에셋 (Assets)", description: "저작권 걱정 없는 초고화질 감성 사진들을 무료로 다운로드할 수 있습니다.", url: "https://unsplash.com", source: "external", password: "admin" },
    { name: "LottieFiles", creator: "System", category: "무료 소스 & 에셋 (Assets)", description: "웹과 앱에 가볍게 적용 가능한 JSON 기반 애니메이션(Lottie) 오픈 소스입니다.", url: "https://lottiefiles.com", source: "external", password: "admin" },
    { name: "Freepik", creator: "System", category: "무료 소스 & 에셋 (Assets)", description: "벡터 이미지, PSD, 사진 등 방대한 양의 디자인 소스를 제공합니다.", url: "https://www.freepik.com", source: "external", password: "admin" },
    { name: "Flaticon", creator: "System", category: "무료 소스 & 에셋 (Assets)", description: "UI 디자인에 필요한 수백만 개의 아이콘을 벡터 포맷으로 제공합니다.", url: "https://www.flaticon.com", source: "external", password: "admin" },
    { name: "눈누 (Noonnu)", creator: "System", category: "폰트 & 타이포그래피 (Typography)", description: "상업적으로 이용 가능한 국내 모든 무료 한글 폰트를 모아놓은 필수 사이트입니다.", url: "https://noonnu.cc", source: "external", password: "admin" },
    { name: "Google Fonts", creator: "System", category: "폰트 & 타이포그래피 (Typography)", description: "가장 안정적이고 범용적인 웹폰트 라이브러리를 무료로 제공합니다.", url: "https://fonts.google.com", source: "external", password: "admin" },
    { name: "FontShare", creator: "System", category: "폰트 & 타이포그래피 (Typography)", description: "ITF에서 제공하는 고퀄리티 무료 영문 폰트 서비스입니다.", url: "https://www.fontshare.com", source: "external", password: "admin" },
    { name: "Coolors", creator: "System", category: "컬러 & 배색 (Color Tools)", description: "스페이스바만 누르면 감각적인 컬러 팔레트를 무한으로 생성해 줍니다.", url: "https://coolors.co", source: "external", password: "admin" },
    { name: "Adobe Color", creator: "System", category: "컬러 & 배색 (Color Tools)", description: "어도비 제품군과 연동되는 전문적인 색상 규칙 및 트렌드 확인이 가능합니다.", url: "https://color.adobe.com", source: "external", password: "admin" },
    { name: "Happy Hues", creator: "System", category: "컬러 & 배색 (Color Tools)", description: "실제 웹 사이트 UI에 적용된 컬러의 느낌을 미리 보며 배색을 공부할 수 있습니다.", url: "https://www.happyhues.co", source: "external", password: "admin" },
    { name: "Remove.bg", creator: "System", category: "AI & 편의 도구 (AI & Utilities)", description: "이미지의 배경(누끼)을 인공지능이 클릭 한 번에 깔끔하게 제거해 줍니다.", url: "https://www.remove.bg", source: "external", password: "admin" },
    { name: "Upscale.media", creator: "System", category: "AI & 편의 도구 (AI & Utilities)", description: "저해상도 이미지를 AI가 화질 저하 없이 고해상도로 확대해 줍니다.", url: "https://www.upscale.media", source: "external", password: "admin" },
    { name: "ChatGPT (OpenAI)", creator: "System", category: "AI & 편의 도구 (AI & Utilities)", description: "디자인 기획, 카피라이팅, 사용자 인터뷰 대본 작성 등에 활용하는 최고의 AI 비서입니다.", url: "https://chatgpt.com", source: "external", password: "admin" },
    { name: "Midjourney", creator: "System", category: "AI & 편의 도구 (AI & Utilities)", description: "텍스트 입력만으로 압도적인 퀄리티의 이미지를 생성하는 현존 최강 AI 툴입니다.", url: "https://www.midjourney.com", source: "external", password: "admin" },
    { name: "성원애드피아", creator: "System", category: "인쇄 & 발주 (Print & Production)", description: "국내 가장 대중적인 인쇄 발주 사이트로, 가성비 좋은 출력물을 주문할 수 있습니다.", url: "https://www.swadpia.co.kr", source: "external", password: "admin" },
    { name: "레드프린팅", creator: "System", category: "인쇄 & 발주 (Print & Production)", description: "소량 굿즈 제작 및 실험적인 후가공 인쇄에 강점이 있는 사이트입니다.", url: "https://www.redprinting.co.kr", source: "external", password: "admin" },
    { name: "오프린트미", creator: "System", category: "인쇄 & 발주 (Print & Production)", description: "직관적인 편집 툴과 세련된 패키징으로 인기 있는 인쇄 서비스입니다.", url: "https://www.ohprint.me", source: "external", password: "admin" },
    { name: "Surfe (서피)", creator: "System", category: "트렌드 & 아티클 (News & Career)", description: "디자이너들에게 영감을 주는 국내외 최신 아티클과 트렌드를 큐레이션해 줍니다.", url: "https://surfe.io", source: "external", password: "admin" },
    { name: "커리어리", creator: "System", category: "트렌드 & 아티클 (News & Career)", description: "현직 디자이너 및 개발자들의 전문적인 의견과 인사이트를 볼 수 있는 SNS입니다.", url: "https://careerly.co.kr", source: "external", password: "admin" },
    { name: "Medium (Design)", creator: "System", category: "트렌드 & 아티클 (News & Career)", description: "글로벌 디자인 기업(Google, Airbnb 등)의 디자인 시스템과 철학을 읽을 수 있습니다.", url: "https://medium.com/design", source: "external", password: "admin" },
    { name: "Figma Community", creator: "System", category: "기타 (Etc)", description: "전 세계 디자이너들이 공유한 피그마 플러그인과 디자인 시스템 파일의 보고입니다.", url: "https://www.figma.com/community", source: "external", password: "admin" }
];

document.addEventListener('DOMContentLoaded', () => {
    // 1. UI 요소 가져오기
    const addToolBtn = document.getElementById('add-tool-btn');
    const modal = document.getElementById('add-tool-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const addToolForm = document.getElementById('add-tool-form');
    const toolGrid = document.getElementById('tool-grid');
    const searchInput = document.getElementById('search-input');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const navHomeBtn = document.getElementById('nav-home-btn');
    const navFavoritesBtn = document.getElementById('nav-favorites-btn');
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = document.getElementById('submit-btn');
    const initialLoader = document.getElementById('initial-loader');
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');

    const FAVORITES_STORAGE_KEY = 'ai-design-hub-favorites-v3';
    const ADMIN_PASSWORD = "admin"; 

    // 상태 변수
    let cloudTools = [];
    let favorites = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)) || [];
    let currentCategory = "전체";
    let currentView = 'all';

    const CATEGORIES = [
        "영감 & 레퍼런스 (Inspiration)",
        "무료 소스 & 에셋 (Assets)",
        "폰트 & 타이포그래피 (Typography)",
        "컬러 & 배색 (Color Tools)",
        "AI & 편의 도구 (AI & Utilities)",
        "인쇄 & 발주 (Print & Production)",
        "트렌드 & 아티클 (News & Career)",
        "기타 (Etc)"
    ];

    // 2. 실시간 데이터 동기화
    function initSync() {
        if (!isFirebaseReady) {
            statusText.innerText = "로컬 모드 (오프라인)";
            statusDot.className = "w-1.5 h-1.5 rounded-full bg-amber-500";
            initialLoader.classList.add('opacity-0', 'pointer-events-none');
            cloudTools = JSON.parse(localStorage.getItem('demo-tools')) || [];
            renderTools();
            return;
        }

        db.ref('tools').on('value', (snapshot) => {
            const data = snapshot.val();
            cloudTools = data ? Object.keys(data).map(key => ({ ...data[key], firebaseId: key })) : [];
            statusText.innerText = "실시간 클라우드 연결됨";
            statusDot.className = "w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse";
            renderTools();
            initialLoader.classList.add('opacity-0', 'pointer-events-none');
        }, (error) => {
            statusText.innerText = "연결 오류";
            statusDot.className = "w-1.5 h-1.5 rounded-full bg-red-500";
            initialLoader.classList.add('opacity-0', 'pointer-events-none');
        });
    }

    // 3. 카드 렌더링
    function renderCategoryTabs() {
        const tabsContainer = document.getElementById('category-tabs');
        if (!tabsContainer) return;
        tabsContainer.innerHTML = '';
        const allTabs = ["전체", ...CATEGORIES];
        allTabs.forEach(cat => {
            const btn = document.createElement('button');
            btn.innerHTML = cat.replace(/\s\((.*?)\)/, ' <span class="text-xs font-normal opacity-70">($1)</span>');
            btn.className = "px-4 py-2 text-sm font-bold rounded-full transition-all duration-200 border whitespace-nowrap";
            if (cat === currentCategory) {
                btn.classList.add("bg-brand-500", "text-white", "border-brand-500", "shadow-md");
            } else {
                btn.classList.add("bg-white", "text-slate-500", "border-slate-200", "hover:bg-brand-50", "hover:text-brand-600");
            }
            btn.onclick = () => {
                currentCategory = cat;
                currentView = 'all';
                renderCategoryTabs();
                renderTools();
            };
            tabsContainer.appendChild(btn);
        });
    }

    function createToolCard(tool) {
        const { name, creator, description, url, id, category, source, firebaseId } = tool;
        const isFav = favorites.includes(id);

        let iconHtml = '✨';
        if (url && url !== '#') {
            try {
                const domain = new URL(url).hostname;
                iconHtml = `<img src="https://www.google.com/s2/favicons?domain=${domain}&sz=128" class="w-8 h-8 object-contain" onerror="this.parentElement.innerText='✨'">`;
            } catch (e) {}
        }

        const sourceBadge = source === 'internal' 
            ? `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-700 border border-brand-200 ml-2 shadow-sm">🏢 우리팀</span>`
            : `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200 ml-2">🌐 외부</span>`;

        const card = document.createElement('div');
        card.className = `group relative flex flex-col p-6 bg-white border ${source === 'internal' ? 'border-brand-100 ring-1 ring-brand-50' : 'border-slate-200'} rounded-2xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-brand-500/50 animate-fadeIn`;
        
        card.innerHTML = `
            <div class="absolute top-4 right-4 z-10 flex items-center gap-2">
                <div class="flex items-center gap-1 bg-white rounded-full border border-slate-200 shadow-sm p-1">
                    <button type="button" class="tool-copy-btn p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-brand-500 transition-colors" title="URL 복사" data-url="${url}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    </button>
                    <button type="button" class="tool-edit-btn p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors" title="수정" data-fid="${firebaseId}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button type="button" class="tool-delete-btn p-1.5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="삭제" data-fid="${firebaseId}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
                <button type="button" class="tool-favorite-btn p-2 rounded-full bg-white border border-slate-200 shadow-sm hover:text-brand-500 text-slate-300 transition-colors" data-id="${id}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 heart-icon ${isFav ? 'active' : ''}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="${isFav ? 'currentColor' : 'none'}">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                </button>
            </div>
            <div class="flex items-center justify-center w-12 h-12 text-2xl bg-slate-50 rounded-xl mb-4 overflow-hidden shadow-sm">${iconHtml}</div>
            <div class="flex-1">
                <div class="flex items-center mb-1">
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wide opacity-80 truncate max-w-[120px]">${category.split('(')[0]}</div>
                    ${sourceBadge}
                </div>
                <h3 class="mb-2 text-lg font-bold text-slate-800 group-hover:text-brand-600 transition-colors">${name}</h3>
                <p class="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-3">${description}</p>
                <p class="text-xs text-slate-400">By. ${creator || '익명'}</p>
            </div>
            <div class="mt-6 pt-4 border-t border-slate-100">
                <a href="${url || '#'}" target="_blank" class="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-slate-500 bg-slate-50 rounded-lg group-hover:bg-brand-500 group-hover:text-white transition-all">
                    <span>사이트 열기</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </a>
            </div>
        `;
        return card;
    }

    function renderTools() {
        toolGrid.innerHTML = '';
        const searchTerm = searchInput.value.toLowerCase().trim();

        const filteredTools = cloudTools.filter(tool => {
            const text = (tool.name + tool.description + tool.creator).toLowerCase();
            const matchesSearch = text.includes(searchTerm);
            const matchesCategory = currentCategory === '전체' || tool.category === currentCategory;
            const matchesView = currentView === 'all' || favorites.includes(tool.id);
            return matchesSearch && matchesCategory && matchesView;
        });

        filteredTools.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

        if (filteredTools.length === 0) {
            const isEmptySearch = searchTerm !== '' || currentCategory !== '전체' || currentView !== 'all';
            toolGrid.innerHTML = `
                <div class="col-span-full py-20 text-center flex flex-col items-center justify-center">
                    <div class="text-6xl mb-6 grayscale opacity-50">📁</div>
                    <h3 class="text-xl font-bold text-slate-800 mb-2">${isEmptySearch ? '찾으시는 툴이 없습니다.' : '등록된 디자인 툴이 없습니다.'}</h3>
                    <p class="text-slate-500 mb-8 max-w-sm mx-auto">
                        ${isEmptySearch ? '검색어 또는 필터를 변경해 보세요.' : '팀원들에게 유용한 사이트를 직접 공유하거나, <br>아래 버튼을 눌러 디자인팀 추천 리스트를 채워보세요.'}
                    </p>
                    ${!isEmptySearch ? `
                        <button id="seed-data-btn" class="px-8 py-4 bg-brand-500 text-white font-bold rounded-2xl shadow-lg hover:bg-brand-600 hover:-translate-y-1 transition-all flex items-center gap-2">
                            <span>✨ 디자인팀 추천 툴 세트 불러오기 (25선)</span>
                        </button>
                    ` : ''}
                </div>
            `;
            const seedBtn = document.getElementById('seed-data-btn');
            if (seedBtn) seedBtn.onclick = seedInitialData;
        } else {
            filteredTools.forEach(tool => toolGrid.appendChild(createToolCard(tool)));
        }
    }

    async function seedInitialData() {
        if (!confirm("25개의 엄선된 추천 디자인 툴을 클라우드에 등록할까요?")) return;
        try {
            initialLoader.classList.remove('opacity-0', 'pointer-events-none');
            const now = Date.now();
            if (isFirebaseReady) {
                // 역순으로 등록하여 리스트 상단에 Dribbble이 오도록 처리 (정렬 로직 대응)
                for (let i = DEFAULT_TOOLS.length - 1; i >= 0; i--) {
                    const tool = DEFAULT_TOOLS[i];
                    await db.ref('tools').push({ ...tool, updatedAt: now - (i * 1000) });
                }
            } else {
                cloudTools = DEFAULT_TOOLS.map((t, i) => ({ ...t, updatedAt: now - (i * 1000), firebaseId: 'local-' + now + i }));
                localStorage.setItem('demo-tools', JSON.stringify(cloudTools));
                renderTools();
            }
            alert("총 25개의 추천 툴이 등록되었습니다! 🚀");
        } catch (err) {
            alert("오류 발생: " + err.message);
        } finally {
            initialLoader.classList.add('opacity-0', 'pointer-events-none');
        }
    }

    function openModal(mode = 'create', toolData = null) {
        addToolForm.reset();
        modal.classList.remove('hidden');
        if (mode === 'edit' && toolData) {
            modalTitle.innerText = "툴 정보 수정";
            submitBtn.innerText = "수정하기";
            document.getElementById('tool-id').value = toolData.firebaseId;
            document.getElementById('tool-name').value = toolData.name;
            document.getElementById('tool-creator').value = toolData.creator;
            document.getElementById('tool-category').value = toolData.category;
            document.getElementById('tool-description').value = toolData.description;
            document.getElementById('tool-url').value = toolData.url;
            document.getElementsByName('tool-source').forEach(r => { if(r.value === toolData.source) r.checked = true; });
        } else {
            modalTitle.innerText = "새로운 툴 공유하기";
            submitBtn.innerText = "팀과 공유하기";
            document.getElementById('tool-id').value = "";
        }
    }

    addToolBtn.onclick = () => openModal('create');
    closeModalBtn.onclick = cancelBtn.onclick = () => modal.classList.add('hidden');

    addToolForm.onsubmit = async (e) => {
        e.preventDefault();
        const fid = document.getElementById('tool-id').value;
        const selectedSource = Array.from(document.getElementsByName('tool-source')).find(r => r.checked)?.value || 'external';
        const toolData = {
            id: fid ? cloudTools.find(t => t.firebaseId === fid).id : 'tool-' + Date.now(),
            name: document.getElementById('tool-name').value,
            creator: document.getElementById('tool-creator').value,
            category: document.getElementById('tool-category').value,
            description: document.getElementById('tool-description').value,
            url: document.getElementById('tool-url').value,
            source: selectedSource,
            password: document.getElementById('tool-password').value,
            updatedAt: Date.now()
        };

        if (isFirebaseReady) {
            try {
                if (fid) await db.ref('tools/' + fid).update(toolData);
                else await db.ref('tools').push(toolData);
                modal.classList.add('hidden');
            } catch (err) { alert("저장 실패: " + err.message); }
        } else {
            if (fid) {
                const idx = cloudTools.findIndex(t => t.firebaseId === fid);
                cloudTools[idx] = { ...toolData, firebaseId: fid };
            } else {
                cloudTools.push({ ...toolData, firebaseId: 'local-' + Date.now() });
            }
            localStorage.setItem('demo-tools', JSON.stringify(cloudTools));
            modal.classList.add('hidden');
            renderTools();
        }
    };

    toolGrid.onclick = async (e) => {
        const deleteBtn = e.target.closest('.tool-delete-btn');
        const editBtn = e.target.closest('.tool-edit-btn');
        const favBtn = e.target.closest('.tool-favorite-btn');
        const copyBtn = e.target.closest('.tool-copy-btn');

        if (copyBtn) {
            const url = copyBtn.dataset.url;
            if (url && url !== '#') {
                navigator.clipboard.writeText(url).then(() => {
                    const originalInner = copyBtn.innerHTML;
                    copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#f97316"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`;
                    setTimeout(() => copyBtn.innerHTML = originalInner, 1500);
                });
            }
        }

        if (deleteBtn || editBtn) {
            const fid = (deleteBtn || editBtn).dataset.fid;
            const target = cloudTools.find(t => t.firebaseId === fid);
            const pwd = prompt("비밀번호를 입력하세요.");
            if (pwd === null) return;
            if (pwd !== target.password && pwd !== ADMIN_PASSWORD) return alert("비밀번호가 틀렸습니다.");
            if (deleteBtn && confirm("삭제할까요?")) {
                if (isFirebaseReady) await db.ref('tools/' + fid).remove();
                else { cloudTools = cloudTools.filter(t => t.firebaseId !== fid); localStorage.setItem('demo-tools', JSON.stringify(cloudTools)); renderTools(); }
            } else if (editBtn) openModal('edit', target);
        }

        if (favBtn) {
            const id = favBtn.dataset.id;
            if (favorites.includes(id)) favorites = favorites.filter(fid => fid !== id);
            else favorites.push(id);
            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
            renderTools();
        }
    };

    searchInput.addEventListener('input', renderTools);
    document.onkeydown = (e) => { if (e.key === '/' && document.activeElement !== searchInput) { e.preventDefault(); searchInput.focus(); } };
    
    navHomeBtn.onclick = () => {
        currentView = 'all'; currentCategory = '전체';
        navHomeBtn.className = "flex items-center w-full px-4 py-3 text-sm font-medium transition-colors rounded-xl group bg-brand-50 text-brand-600";
        navFavoritesBtn.className = "flex items-center w-full px-4 py-3 text-sm font-medium transition-colors rounded-xl group text-slate-500 hover:bg-slate-50 hover:text-slate-800";
        renderCategoryTabs(); renderTools();
    };

    navFavoritesBtn.onclick = () => {
        currentView = 'favorites';
        navHomeBtn.className = "flex items-center w-full px-4 py-3 text-sm font-medium transition-colors rounded-xl group text-slate-500 hover:bg-slate-50 hover:text-slate-800";
        navFavoritesBtn.className = "flex items-center w-full px-4 py-3 text-sm font-medium transition-colors rounded-xl group bg-brand-50 text-brand-600";
        renderTools();
    };

    sidebarToggle.onclick = () => { sidebar.classList.toggle('-translate-x-full'); sidebarOverlay.classList.toggle('hidden'); setTimeout(() => sidebarOverlay.classList.toggle('opacity-0'), 10); };
    sidebarOverlay.onclick = () => { sidebar.classList.add('-translate-x-full'); sidebarOverlay.classList.add('hidden', 'opacity-0'); };

    renderCategoryTabs();
    initSync();
});
