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

document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------------
    // 1. UI 요소 가져오기
    // ---------------------------------------------------------
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
    let cloudTools = []; // 서버에서 실시간으로 받아온 툴들
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

    // ---------------------------------------------------------
    // 2. 실시간 데이터 동기화 (Firebase Connection)
    // ---------------------------------------------------------
    function initSync() {
        if (!isFirebaseReady) {
            console.warn("Firebase 설정이 완료되지 않았습니다. 로컬 데모 모드로 전환합니다.");
            statusText.innerText = "로컬 모드 (오프라인)";
            statusDot.className = "w-1.5 h-1.5 rounded-full bg-amber-500";
            initialLoader.classList.add('opacity-0', 'pointer-events-none');
            // 데모용 데이터
            cloudTools = JSON.parse(localStorage.getItem('demo-tools')) || [];
            renderTools();
            return;
        }

        // Firebase 실시간 리스너 연결
        db.ref('tools').on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                cloudTools = Object.keys(data).map(key => ({
                    ...data[key],
                    firebaseId: key 
                }));
            } else {
                cloudTools = [];
            }
            
            statusText.innerText = "실시간 클라우드 연결됨";
            statusDot.className = "w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse";
            
            renderTools();
            initialLoader.classList.add('opacity-0', 'pointer-events-none');
        }, (error) => {
            console.error("Firebase sync error:", error);
            statusText.innerText = "연결 오류 (규칙 확인 필요)";
            statusDot.className = "w-1.5 h-1.5 rounded-full bg-red-500";
            initialLoader.classList.add('opacity-0', 'pointer-events-none');
        });
    }

    // ---------------------------------------------------------
    // 3. 카드 렌더링
    // ---------------------------------------------------------
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
                    <button type="button" class="tool-edit-btn p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors" title="수정" data-fid="${firebaseId}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button type="button" class="tool-delete-btn p-1.5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="삭제" data-fid="${firebaseId}">
                         <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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

        if (filteredTools.length === 0) {
            toolGrid.innerHTML = `
                <div class="col-span-full py-20 text-center">
                    <div class="text-4xl mb-4">🔍</div>
                    <p class="text-slate-400">찾으시는 툴이 아직 없네요. 직접 팀에 공유해 보세요!</p>
                </div>
            `;
        } else {
            filteredTools.forEach(tool => {
                toolGrid.appendChild(createToolCard(tool));
            });
        }
    }

    // ---------------------------------------------------------
    // 4. 이벤트 핸들러 (등록 / 수정 / 삭제)
    // ---------------------------------------------------------
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
            document.getElementsByName('tool-source').forEach(r => {
                if(r.value === toolData.source) r.checked = true;
            });
        } else {
            modalTitle.innerText = "새로운 툴 공유하기";
            submitBtn.innerText = "팀과 공유하기";
            document.getElementById('tool-id').value = "";
        }
    }

    addToolBtn.addEventListener('click', () => openModal('create'));
    closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
    cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));

    addToolForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fid = document.getElementById('tool-id').value;
        const sourceInputs = document.getElementsByName('tool-source');
        let selectedSource = 'external';
        for (const input of sourceInputs) if (input.checked) selectedSource = input.value;

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
                if (fid) {
                    await db.ref('tools/' + fid).update(toolData);
                } else {
                    await db.ref('tools').push(toolData);
                }
                modal.classList.add('hidden');
            } catch (err) {
                alert("저장 실패: " + err.message + "\nFirebase의 Realtime Database 규칙이 '테스트 모드'인지 확인해 주세요.");
            }
        } else {
            // 로컬 데모 모드
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
    });

    toolGrid.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.tool-delete-btn');
        const editBtn = e.target.closest('.tool-edit-btn');
        const favBtn = e.target.closest('.tool-favorite-btn');

        if (deleteBtn || editBtn) {
            const fid = (deleteBtn || editBtn).dataset.fid;
            const target = cloudTools.find(t => t.firebaseId === fid);
            
            const pwd = prompt("비밀번호를 입력하세요.");
            if (pwd === null) return;
            if (pwd !== target.password && pwd !== ADMIN_PASSWORD) {
                alert("비밀번호가 틀렸습니다.");
                return;
            }

            if (deleteBtn && confirm("정말로 삭제할까요?")) {
                if (isFirebaseReady) await db.ref('tools/' + fid).remove();
                else {
                    cloudTools = cloudTools.filter(t => t.firebaseId !== fid);
                    localStorage.setItem('demo-tools', JSON.stringify(cloudTools));
                    renderTools();
                }
            } else if (editBtn) {
                openModal('edit', target);
            }
        }

        if (favBtn) {
            const id = favBtn.dataset.id;
            if (favorites.includes(id)) favorites = favorites.filter(fid => fid !== id);
            else favorites.push(id);
            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
            renderTools();
        }
    });

    // ---------------------------------------------------------
    // 5. 초기화 및 사이드바 제어
    // ---------------------------------------------------------
    searchInput.addEventListener('input', renderTools);
    
    navHomeBtn.addEventListener('click', () => {
        currentView = 'all';
        currentCategory = '전체';
        navHomeBtn.className = "flex items-center w-full px-4 py-3 text-sm font-medium transition-colors rounded-xl group bg-brand-50 text-brand-600";
        navFavoritesBtn.className = "flex items-center w-full px-4 py-3 text-sm font-medium transition-colors rounded-xl group text-slate-500 hover:bg-slate-50 hover:text-slate-800";
        renderCategoryTabs();
        renderTools();
    });

    navFavoritesBtn.addEventListener('click', () => {
        currentView = 'favorites';
        navHomeBtn.className = "flex items-center w-full px-4 py-3 text-sm font-medium transition-colors rounded-xl group text-slate-500 hover:bg-slate-50 hover:text-slate-800";
        navFavoritesBtn.className = "flex items-center w-full px-4 py-3 text-sm font-medium transition-colors rounded-xl group bg-brand-50 text-brand-600";
        renderTools();
    });

    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('-translate-x-full');
        sidebarOverlay.classList.toggle('hidden');
        setTimeout(() => sidebarOverlay.classList.toggle('opacity-0'), 10);
    });

    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
        sidebarOverlay.classList.add('hidden', 'opacity-0');
    });

    renderCategoryTabs();
    initSync();
});
