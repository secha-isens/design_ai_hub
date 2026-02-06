document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------------
    // 1. 설정 및 변수 (UI 요소 가져오기)
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

    // 데이터를 저장할 이름표들
    // ★ 중요: 이제 이 키에는 '사용자가 직접 추가한 툴'만 저장합니다.
    const USER_TOOLS_STORAGE_KEY = 'ai-design-hub-user-tools-v2';
    const FAVORITES_STORAGE_KEY = 'ai-design-hub-favorites';

    // ★ 관리자 비밀번호 설정
    const ADMIN_PASSWORD = "admin"; 

    // ---------------------------------------------------------
    // 2. 데이터 관리 (기본 툴 + 사용자 툴 병합)
    // ---------------------------------------------------------
    
    // 시니어 디자이너 추천 필수 툴 (코드에 영구적으로 박제된 데이터)
    const DEFAULT_TOOLS = [
        // --- 1. 영감 & 레퍼런스 ---
        {
            id: 'tool-def-int-1',
            name: '2026 S/S 시즌 무드보드',
            creator: '관리자',
            category: '영감 & 레퍼런스 (Inspiration)',
            description: '내년도 시즌 컨셉 도출을 위해 팀원들이 수집한 레퍼런스 및 무드보드 아카이브 (보안 필수).',
            url: '#',
            source: 'internal'
        },
        {
            id: 'tool-def-1',
            name: 'Pinterest',
            creator: '관리자',
            category: '영감 & 레퍼런스 (Inspiration)',
            description: '디자이너에게 가장 강력한 영감의 원천. 무한한 아이디어와 무드보드를 위한 필수 사이트.',
            url: 'https://www.pinterest.com',
            source: 'external'
        },
        {
            id: 'tool-def-2',
            name: 'Behance',
            creator: '관리자',
            category: '영감 & 레퍼런스 (Inspiration)',
            description: '전 세계 디자이너들의 고퀄리티 포트폴리오를 한눈에 볼 수 있는 어도비의 커뮤니티.',
            url: 'https://www.behance.net',
            source: 'external'
        },
        {
            id: 'tool-def-8',
            name: 'Awwwards',
            creator: '관리자',
            category: '영감 & 레퍼런스 (Inspiration)',
            description: '세계 최고의 웹 디자인 어워드. 혁신적인 웹사이트 디자인과 인터랙션을 경험하고 배우세요.',
            url: 'https://www.awwwards.com',
            source: 'external'
        },

        // --- 2. 무료 소스 & 에셋 ---
        {
            id: 'tool-def-int-2',
            name: '공통 아이콘 시스템 v2.0',
            creator: '관리자',
            category: '무료 소스 & 에셋 (Assets)',
            description: '우리 서비스 전반에 사용되는 SVG 아이콘 모음. (FigJam 링크 포함)',
            url: '#',
            source: 'internal'
        },
        {
            id: 'tool-def-3',
            name: 'Unsplash',
            creator: '관리자',
            category: '무료 소스 & 에셋 (Assets)',
            description: '감각적이고 트렌디한 고해상도 무료 이미지 스톡 사이트. 상업적 이용 가능.',
            url: 'https://unsplash.com',
            source: 'external'
        },
        {
            id: 'tool-def-9',
            name: 'Freepik',
            creator: '관리자',
            category: '무료 소스 & 에셋 (Assets)',
            description: '벡터, PSD, 아이콘 등 디자인에 필요한 방대한 그래픽 리소스를 제공하는 사이트.',
            url: 'https://www.freepik.com',
            source: 'external'
        },

        // --- 3. 폰트 & 타이포그래피 ---
        {
            id: 'tool-def-int-3',
            name: '전용 서체 (Hub Sans) 가이드',
            creator: '관리자',
            category: '폰트 & 타이포그래피 (Typography)',
            description: '브랜드 전용 서체 국문/영문 사용 규정 및 웹폰트 CDN 링크.',
            url: '#',
            source: 'internal'
        },
        {
            id: 'tool-def-4',
            name: 'Noonnu (눈누)',
            creator: '관리자',
            category: '폰트 & 타이포그래피 (Typography)',
            description: '상업적으로 이용 가능한 한글 무료 폰트를 모아둔 아카이브. 저작권 걱정 없이 폰트를 찾아보세요.',
            url: 'https://noonnu.cc',
            source: 'external'
        },
        {
            id: 'tool-def-10',
            name: 'Google Fonts',
            creator: '관리자',
            category: '폰트 & 타이포그래피 (Typography)',
            description: '웹과 모바일에서 사용 가능한 구글의 방대한 오픈 소스 폰트 라이브러리.',
            url: 'https://fonts.google.com',
            source: 'external'
        },

        // --- 4. 컬러 & 배색 ---
        {
            id: 'tool-def-int-4',
            name: '2026 브랜드 컬러 팔레트',
            creator: '관리자',
            category: '컬러 & 배색 (Color Tools)',
            description: '메인, 서브, 그레이스케일 등 브랜드 아이덴티티 컬러 헥사코드 및 사용 예시.',
            url: '#',
            source: 'internal'
        },
        {
            id: 'tool-def-5',
            name: 'Adobe Color',
            creator: '관리자',
            category: '컬러 & 배색 (Color Tools)',
            description: '완벽한 배색을 위한 도구. 트렌디한 컬러 팔레트를 탐색하고 추출할 수 있습니다.',
            url: 'https://color.adobe.com',
            source: 'external'
        },
        {
            id: 'tool-def-11',
            name: 'Coolors',
            creator: '관리자',
            category: '컬러 & 배색 (Color Tools)',
            description: '스페이스바만 누르면 완벽한 컬러 조합을 생성해주는 초스피드 배색 제너레이터.',
            url: 'https://coolors.co',
            source: 'external'
        },

        // --- 5. AI & 편의 도구 ---
        {
            id: 'tool-def-int-5',
            name: '배너 자동 생성 스크립트',
            creator: '관리자',
            category: 'AI & 편의 도구 (AI & Utilities)',
            description: '반복되는 마케팅 배너 리사이징을 자동화하는 포토샵 스크립트 파일.',
            url: '#',
            source: 'internal'
        },
        {
            id: 'tool-def-6',
            name: 'Remove.bg',
            creator: '관리자',
            category: 'AI & 편의 도구 (AI & Utilities)',
            description: '이미지 배경을 5초 만에 자동으로 제거해주는 AI 도구. 누끼 따기 작업 시간을 획기적으로 줄여줍니다.',
            url: 'https://www.remove.bg',
            source: 'external'
        },
        {
            id: 'tool-def-12',
            name: 'Midjourney',
            creator: '관리자',
            category: 'AI & 편의 도구 (AI & Utilities)',
            description: '텍스트 프롬프트로 고퀄리티 아트워크를 생성하는 생성형 AI. 아이디어 시각화에 최적입니다.',
            url: 'https://www.midjourney.com',
            source: 'external'
        },

        // --- 6. 트렌드 & 아티클 ---
        {
            id: 'tool-def-int-6',
            name: '주간 디자인 인사이트',
            creator: '관리자',
            category: '트렌드 & 아티클 (News & Career)',
            description: '매주 월요일 공유되는 디자인 트렌드 리포트 및 회의록 모음.',
            url: '#',
            source: 'internal'
        },
        {
            id: 'tool-def-7',
            name: 'Surfit',
            creator: '관리자',
            category: '트렌드 & 아티클 (News & Career)',
            description: '디자이너를 위한 커리어 지식 플랫폼. 매일 업데이트되는 업계 아티클과 트렌드를 놓치지 마세요.',
            url: 'https://www.surfit.io',
            source: 'external'
        }
    ];

    let currentCategory = "전체";
    let currentView = 'all'; 
    let favorites = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)) || [];
    
    // LocalStorage에서 사용자 추가 툴 불러오기
    function getUserTools() {
        return JSON.parse(localStorage.getItem(USER_TOOLS_STORAGE_KEY)) || [];
    }

    // 모든 툴 병합해서 가져오기 (기본 + 사용자)
    function getAllTools() {
        const userTools = getUserTools();
        return [...DEFAULT_TOOLS, ...userTools];
    }

    const CATEGORIES = [
        "영감 & 레퍼런스 (Inspiration)",
        "무료 소스 & 에셋 (Assets)",
        "폰트 & 타이포그래피 (Typography)",
        "컬러 & 배색 (Color Tools)",
        "AI & 편의 도구 (AI & Utilities)",
        "트렌드 & 아티클 (News & Career)",
        "기타 (Etc)"
    ];

    // ---------------------------------------------------------
    // 3. UI 및 이벤트 리스너
    // ---------------------------------------------------------
    function toggleSidebar() {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            sidebar.classList.toggle('-translate-x-full');
            sidebarOverlay.classList.toggle('hidden');
            setTimeout(() => sidebarOverlay.classList.toggle('opacity-0'), 10);
        } else {
            sidebar.classList.toggle('md:w-0');
            sidebar.classList.toggle('md:border-none');
            const logo = document.getElementById('desktop-logo');
            if(logo) logo.classList.toggle('hidden', sidebar.classList.contains('md:w-0'));
        }
    }
    if (sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', toggleSidebar);

    function updateNavUI() {
        const activeClass = "bg-brand-50 text-brand-600";
        const inactiveClass = "text-slate-500 hover:bg-slate-50 hover:text-slate-800";
        if (currentView === 'all') {
            navHomeBtn.className = `flex items-center w-full px-4 py-3 text-sm font-medium transition-colors rounded-xl group ${activeClass}`;
            navFavoritesBtn.className = `flex items-center w-full px-4 py-3 text-sm font-medium transition-colors rounded-xl group ${inactiveClass}`;
        } else {
            navHomeBtn.className = `flex items-center w-full px-4 py-3 text-sm font-medium transition-colors rounded-xl group ${inactiveClass}`;
            navFavoritesBtn.className = `flex items-center w-full px-4 py-3 text-sm font-medium transition-colors rounded-xl group ${activeClass}`;
        }
    }

    navHomeBtn.addEventListener('click', () => {
        currentView = 'all';
        currentCategory = '전체';
        updateNavUI();
        renderCategoryTabs();
        renderTools(); // 필터 대신 렌더 호출
    });

    navFavoritesBtn.addEventListener('click', () => {
        currentView = 'favorites';
        updateNavUI();
        renderTools();
    });

    // ---------------------------------------------------------
    // 4. 카드 렌더링
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
                updateNavUI();
                renderTools();
            };
            tabsContainer.appendChild(btn);
        });
    }

    function createToolCard(tool) {
        const { name, creator, description, icon, url, id, category, source } = tool;
        const isFav = favorites.includes(id);

        let iconHtml = icon || '✨';
        if (url) {
            try {
                const safeUrl = url.startsWith('http') ? url : `https://${url}`;
                const domain = new URL(safeUrl).hostname;
                iconHtml = `<img src="https://www.google.com/s2/favicons?domain=${domain}&sz=128" alt="${name}" class="w-8 h-8 object-contain" onerror="this.parentElement.innerText='✨'">`;
            } catch (e) {
                console.warn('Invalid URL for icon:', url);
            }
        }

        const sourceBadge = source === 'internal' 
            ? `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-700 border border-brand-200 ml-2 shadow-sm">🏢 우리팀</span>`
            : `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200 ml-2">🌐 외부</span>`;

        const card = document.createElement('div');
        card.dataset.id = id;
        card.dataset.category = category || '';
        card.className = `group relative flex flex-col p-6 bg-white border ${source === 'internal' ? 'border-brand-100 ring-1 ring-brand-50' : 'border-slate-200'} rounded-2xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-brand-500/50`;
        
        // ★ 변경점: opacity 클래스를 제거하여 버튼이 항상 보이도록 수정 (모바일/프리뷰 대응)
        card.innerHTML = `
            <div class="absolute top-4 left-4 z-10 flex gap-1">
                <button type="button" class="tool-edit-btn p-2 rounded-full hover:bg-slate-100 bg-white shadow-sm border border-slate-100" title="수정" data-id="${id}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-500 hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <button type="button" class="tool-delete-btn p-2 rounded-full hover:bg-red-50 bg-white shadow-sm border border-slate-100" title="삭제" data-id="${id}">
                     <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
            
            <button type="button" class="tool-favorite-btn absolute top-4 right-4 p-2 rounded-full transition-colors hover:bg-slate-50 z-10" data-id="${id}">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 heart-icon ${isFav ? 'active' : 'text-slate-300'}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="${isFav ? 'currentColor' : 'none'}">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
            </button>
            <div class="flex items-center justify-center w-12 h-12 text-2xl bg-slate-50 rounded-xl mb-4 overflow-hidden shadow-sm">${iconHtml}</div>
            <div class="flex-1">
                <div class="flex items-center mb-1">
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wide opacity-80 truncate max-w-[120px]">${category.split('(')[0]}</div>
                    ${sourceBadge}
                </div>
                <h3 class="mb-2 text-lg font-bold text-slate-800 group-hover:text-brand-600 transition-colors">${name}</h3>
                <p class="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-3">${description}</p>
                <p class="text-xs text-slate-400">등록: ${creator || '익명'}</p>
            </div>
            <div class="mt-6 pt-4 border-t border-slate-100">
                <a href="${url || '#'}" target="_blank" class="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-slate-500 bg-slate-50 rounded-lg group-hover:bg-brand-500 group-hover:text-white transition-all no-underline">
                    <span>바로가기</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </a>
            </div>
        `;
        return card;
    }

    function renderTools() {
        toolGrid.innerHTML = '';
        const allTools = getAllTools();
        const searchTerm = searchInput.value.toLowerCase().trim();

        const filteredTools = allTools.filter(tool => {
            const text = tool.name.toLowerCase() + tool.description.toLowerCase();
            const matchesSearch = text.includes(searchTerm);
            const matchesCategory = currentCategory === '전체' || tool.category === currentCategory;
            const matchesView = currentView === 'all' || favorites.includes(tool.id);
            return matchesSearch && matchesCategory && matchesView;
        });

        filteredTools.forEach(tool => {
            toolGrid.appendChild(createToolCard(tool));
        });
    }

    // ---------------------------------------------------------
    // 5. 모달창: 등록 및 수정 (핵심 로직 변경)
    // ---------------------------------------------------------
    function openModal(mode = 'create', toolData = null) {
        addToolForm.reset();
        modal.classList.remove('hidden');
        
        if (mode === 'edit' && toolData) {
            modalTitle.innerText = "툴 정보 수정하기";
            submitBtn.innerText = "수정완료";
            
            document.getElementById('tool-id').value = toolData.id;
            document.getElementById('tool-name').value = toolData.name;
            document.getElementById('tool-creator').value = toolData.creator;
            document.getElementById('tool-category').value = toolData.category;
            document.getElementById('tool-description').value = toolData.description;
            document.getElementById('tool-url').value = toolData.url;
            
            document.getElementById('tool-password').value = toolData.password || ''; 
            
            // 라디오 버튼 설정
            const radios = document.getElementsByName('tool-source');
            for(const r of radios) {
                if(r.value === toolData.source) r.checked = true;
            }
        } else {
            modalTitle.innerText = "새로운 툴 등록하기";
            submitBtn.innerText = "등록하기";
            document.getElementById('tool-id').value = ""; // ID 비움
            // 라디오 기본값 리셋
            document.getElementsByName('tool-source')[0].checked = true;
        }
    }

    addToolBtn.addEventListener('click', () => openModal('create'));
    closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
    cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));

    addToolForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const toolId = document.getElementById('tool-id').value;
        const password = document.getElementById('tool-password').value;
        
        // 라디오 버튼 값 가져오기
        const sourceInputs = document.getElementsByName('tool-source');
        let selectedSource = 'external';
        for (const input of sourceInputs) {
            if (input.checked) {
                selectedSource = input.value;
                break;
            }
        }

        const formData = {
            name: document.getElementById('tool-name').value,
            creator: document.getElementById('tool-creator').value,
            category: document.getElementById('tool-category').value,
            description: document.getElementById('tool-description').value,
            url: document.getElementById('tool-url').value,
            source: selectedSource,
            password: password // 비밀번호 저장
        };

        let userTools = getUserTools();

        if (toolId) {
            // 수정 모드
            const index = userTools.findIndex(t => t.id === toolId);
            if (index !== -1) {
                userTools[index] = { ...userTools[index], ...formData, id: toolId };
                alert("수정되었습니다.");
            } else {
                alert("수정할 툴을 찾을 수 없습니다. 문제가 지속되면 새로고침 후 다시 시도해주세요.");
            }
        } else {
            // 등록 모드
            const newTool = {
                id: 'tool-' + Date.now(),
                ...formData
            };
            userTools.push(newTool);
            alert("등록되었습니다.");
        }

        localStorage.setItem(USER_TOOLS_STORAGE_KEY, JSON.stringify(userTools));
        modal.classList.add('hidden');
        renderTools();
    });

    // ---------------------------------------------------------
    // 6. 삭제 및 수정 이벤트 위임 (비밀번호 체크)
    // ---------------------------------------------------------
    toolGrid.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.tool-delete-btn');
        const editBtn = e.target.closest('.tool-edit-btn');
        const favBtn = e.target.closest('.tool-favorite-btn');

        // 6-1. 삭제
        if (deleteBtn) {
            e.stopPropagation();
            const id = deleteBtn.dataset.id;
            const allTools = getAllTools();
            const targetTool = allTools.find(t => t.id === id);

            if (!targetTool) return;

            // 기본 툴인지 확인
            const isDefault = DEFAULT_TOOLS.some(t => t.id === id);
            
            const pwd = prompt("삭제하려면 비밀번호를 입력하세요.\n(기본 툴의 경우 관리자 비밀번호)");
            if (pwd === null) return; // 취소

            let isAuthorized = false;
            if (isDefault) {
                if (pwd === ADMIN_PASSWORD) isAuthorized = true;
                else alert("관리자 비밀번호가 일치하지 않습니다.");
            } else {
                // 사용자 툴: 해당 툴의 비번과 일치하는지 확인 (혹은 관리자 비번)
                if ((targetTool.password && pwd === targetTool.password) || pwd === ADMIN_PASSWORD) isAuthorized = true;
                else alert("비밀번호가 일치하지 않습니다.");
            }

            if (isAuthorized && confirm("정말로 삭제하시겠습니까?")) {
                if (isDefault) {
                    alert("기본 툴은 화면에서만 숨겨지며, 새로고침 시 복구될 수 있습니다. (영구 삭제는 코드 수정 필요)");
                    // 이번 세션에서만 안 보이게 하려면 필터링 로직이 복잡해지므로, 
                    // 간단히 여기서는 사용자 툴 삭제만 완벽 지원하고 기본 툴은 경고만 줍니다.
                } else {
                    let userTools = getUserTools();
                    userTools = userTools.filter(t => t.id !== id);
                    localStorage.setItem(USER_TOOLS_STORAGE_KEY, JSON.stringify(userTools));
                    
                    // 즐겨찾기에서도 제거
                    favorites = favorites.filter(fid => fid !== id);
                    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
                    
                    renderTools();
                }
            }
            return;
        }

        // 6-2. 수정
        if (editBtn) {
            e.stopPropagation();
            const id = editBtn.dataset.id;
            const allTools = getAllTools();
            const targetTool = allTools.find(t => t.id === id);

            if (!targetTool) {
                alert("툴 정보를 찾을 수 없습니다.");
                return;
            }

            // 기본 툴 수정 시도
            const isDefault = DEFAULT_TOOLS.some(t => t.id === id);
            if (isDefault) {
                alert("기본 제공 툴은 수정할 수 없습니다.");
                return;
            }

            const pwd = prompt("수정하려면 등록 시 설정한 비밀번호를 입력하세요.");
            if (pwd === null) return; // 취소

            // 비밀번호 확인
            if ((targetTool.password && pwd === targetTool.password) || pwd === ADMIN_PASSWORD) {
                openModal('edit', targetTool);
            } else {
                alert("비밀번호가 일치하지 않습니다.");
            }
            return;
        }

        // 6-3. 즐겨찾기
        if (favBtn) {
            const id = favBtn.dataset.id;
            if (favorites.includes(id)) {
                favorites = favorites.filter(favId => favId !== id);
            } else {
                favorites.push(id);
            }
            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
            
            const svg = favBtn.querySelector('svg');
            const isFav = favorites.includes(id);
            svg.classList.toggle('active', isFav);
            svg.setAttribute('fill', isFav ? 'currentColor' : 'none');
            
            if (currentView === 'favorites') renderTools();
        }
    });

    searchInput.addEventListener('input', renderTools);

    // ---------------------------------------------------------
    // 7. 초기 실행
    // ---------------------------------------------------------
    renderCategoryTabs();
    updateNavUI();
    renderTools();

    // ★ 개발자/관리자를 위한 데이터 백업 팁 (콘솔에 출력)
    console.log("%c[관리자 팁] 등록된 툴을 코드(GitHub)에 영구 저장하려면?", "color: #f97316; font-weight: bold; font-size: 14px; margin-top: 10px;");
    console.log("%c아래 코드를 실행하여 JSON을 복사한 뒤, index.js의 DEFAULT_TOOLS 배열에 붙여넣으세요:", "color: #475569;");
    console.log(`console.log(JSON.stringify(JSON.parse(localStorage.getItem('${USER_TOOLS_STORAGE_KEY}')), null, 2))`);
});
