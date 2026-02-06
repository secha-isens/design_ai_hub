import { GoogleGenAI } from "@google/genai";

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
    const aiEnhanceBtn = document.getElementById('ai-enhance-btn');
    const descriptionInput = document.getElementById('tool-description');
    const quoteSlider = document.getElementById('quote-slider');

    // 데이터를 저장할 이름표들
    const TOOLS_STORAGE_KEY = 'ai-design-hub-tools';
    const FAVORITES_STORAGE_KEY = 'ai-design-hub-favorites';
    const API_KEY_STORAGE_KEY = 'gemini_api_key_user'; // API 키 저장소 이름

    let currentCategory = "전체";
    let currentView = 'all'; 
    let favorites = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)) || [];
    const CATEGORIES = ["무료 외부 추천 툴", "우리 직원이 직접 만든 툴"];

    // ---------------------------------------------------------
    // 2. 사이드바 및 네비게이션 기능
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
        filterTools();
    });

    navFavoritesBtn.addEventListener('click', () => {
        currentView = 'favorites';
        updateNavUI();
        filterTools();
    });

    // ---------------------------------------------------------
    // 3. 화면 그리기 (카테고리, 카드 리스트)
    // ---------------------------------------------------------
    function renderCategoryTabs() {
        const tabsContainer = document.getElementById('category-tabs');
        if (!tabsContainer) return;
        tabsContainer.innerHTML = '';
        const allTabs = ["전체", ...CATEGORIES];
        allTabs.forEach(cat => {
            const btn = document.createElement('button');
            btn.textContent = cat;
            btn.className = "px-5 py-2 text-sm font-bold rounded-full transition-all duration-200 border";
            if (cat === currentCategory) {
                btn.classList.add("bg-brand-500", "text-white", "border-brand-500", "shadow-md");
            } else {
                btn.classList.add("bg-white", "text-slate-500", "border-slate-200", "hover:bg-brand-50");
            }
            btn.onclick = () => {
                currentCategory = cat;
                currentView = 'all';
                renderCategoryTabs();
                updateNavUI();
                filterTools();
            };
            tabsContainer.appendChild(btn);
        });
    }

    function createToolCard(tool) {
        const { name, creator, description, icon, url, id, category } = tool;
        const isFav = favorites.includes(id);
        const card = document.createElement('div');
        card.dataset.id = id;
        card.dataset.category = category || '';
        card.className = "group relative flex flex-col p-6 bg-white border border-slate-200 rounded-2xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-brand-500/50";
        card.innerHTML = `
            <button class="tool-favorite-btn absolute top-4 right-4 p-2 rounded-full transition-colors hover:bg-slate-50 z-10" data-id="${id}">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 heart-icon ${isFav ? 'active' : 'text-slate-300'}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="${isFav ? 'currentColor' : 'none'}">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
            </button>
            <div class="flex items-center justify-center w-12 h-12 text-2xl bg-slate-50 rounded-xl mb-4">${icon || '✨'}</div>
            <div class="flex-1">
                <h3 class="mb-2 text-lg font-bold text-slate-800 group-hover:text-brand-600 transition-colors">${name}</h3>
                <p class="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-3">${description}</p>
                <p class="text-xs text-slate-400">제작: ${creator || '익명'}</p>
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

    function filterTools() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        Array.from(toolGrid.children).forEach(card => {
            const text = card.textContent.toLowerCase();
            const cat = card.dataset.category;
            const id = card.dataset.id;
            const matchesSearch = text.includes(searchTerm);
            const matchesCategory = currentCategory === '전체' || cat === currentCategory;
            const matchesView = currentView === 'all' || favorites.includes(id);
            card.style.display = (matchesSearch && matchesCategory && matchesView) ? '' : 'none';
        });
    }

    // ---------------------------------------------------------
    // 4. 모달창 및 등록 폼 기능
    // ---------------------------------------------------------
    addToolBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
    cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));

    addToolForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTool = {
            id: 'tool-' + Date.now(),
            name: document.getElementById('tool-name').value,
            creator: document.getElementById('tool-creator').value,
            category: document.getElementById('tool-category').value,
            description: document.getElementById('tool-description').value,
            icon: document.getElementById('tool-icon').value || '✨',
            url: document.getElementById('tool-url').value
        };
        const tools = JSON.parse(localStorage.getItem(TOOLS_STORAGE_KEY)) || [];
        tools.push(newTool);
        localStorage.setItem(TOOLS_STORAGE_KEY, JSON.stringify(tools));
        toolGrid.appendChild(createToolCard(newTool));
        addToolForm.reset();
        modal.classList.add('hidden');
        filterTools();
    });

    // ---------------------------------------------------------
    // 5. ★★★ AI 다듬기 기능 (여기가 핵심!) ★★★
    // ---------------------------------------------------------
    aiEnhanceBtn.addEventListener('click', async () => {
        const currentText = descriptionInput.value.trim();
        if (!currentText) {
            alert('다듬을 내용을 먼저 입력해주세요.');
            return;
        }

        // 1. 브라우저에 저장된 키가 있는지 확인합니다.
        let apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);

        // 2. 키가 없으면 사용자에게 팝업창으로 물어봅니다.
        if (!apiKey) {
            const userKey = prompt("Gemini API 키를 입력해주세요.\n(발급받은 키를 여기에 붙여넣으세요. 서버가 아닌 브라우저에 안전하게 저장됩니다.)");
            
            // 취소 버튼을 눌렀거나 빈 값을 입력한 경우
            if (!userKey || userKey.trim() === '') {
                return; // 아무것도 하지 않고 종료
            }
            
            // 입력받은 키 저장
            apiKey = userKey.trim();
            localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
        }

        // 3. 로딩 표시 시작
        aiEnhanceBtn.disabled = true;
        const originalContent = aiEnhanceBtn.innerHTML;
        aiEnhanceBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-3 w-3 text-brand-600 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            생성 중...`;

        try {
            // 4. 입력받은 키로 AI 연결 시도
            const ai = new GoogleGenAI({ apiKey });
            
            // 5. AI에게 요청
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `디자인 업무 자동화 툴 설명을 임팩트 있는 짧은 한 문장으로 다듬어줘. 결과만 출력해: ${currentText}`,
            });

            // 6. 결과 반영
            if (response.text) {
                descriptionInput.value = response.text.trim();
            }

        } catch (error) {
            console.error('AI Error:', error);
            
            // 키가 틀렸거나 권한이 없는 경우
            if (error.message.includes('403') || error.message.includes('key') || error.toString().includes('API_KEY')) {
                alert('입력하신 API 키가 올바르지 않습니다. 다시 확인해주세요.');
                localStorage.removeItem(API_KEY_STORAGE_KEY); // 잘못된 키 삭제
            } else {
                alert('AI 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            }
        } finally {
            // 7. 로딩 끝, 원래 버튼으로 복구
            aiEnhanceBtn.disabled = false;
            aiEnhanceBtn.innerHTML = originalContent;
        }
    });

    // ---------------------------------------------------------
    // 6. 즐겨찾기 클릭 기능
    // ---------------------------------------------------------
    toolGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.tool-favorite-btn');
        if (btn) {
            const id = btn.dataset.id;
            if (favorites.includes(id)) {
                favorites = favorites.filter(favId => favId !== id);
            } else {
                favorites.push(id);
            }
            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
            
            const svg = btn.querySelector('svg');
            const isFav = favorites.includes(id);
            svg.classList.toggle('active', isFav);
            svg.setAttribute('fill', isFav ? 'currentColor' : 'none');
            
            // 즐겨찾기 탭 보고 있을 때 바로 리스트 갱신
            if (currentView === 'favorites') filterTools();
        }
    });

    searchInput.addEventListener('input', filterTools);

    // ---------------------------------------------------------
    // 7. 초기 실행 (저장된 툴 불러오기 등)
    // ---------------------------------------------------------
    const storedTools = JSON.parse(localStorage.getItem(TOOLS_STORAGE_KEY)) || [];
    storedTools.forEach(tool => toolGrid.appendChild(createToolCard(tool)));
    renderCategoryTabs();
    updateNavUI();

    // 롤링 문구 (자동 슬라이드)
    const quotes = [
        "디자인은 말보다 크게 말한다",
        "단순함은 궁극의 정교함이다",
        "영감은 일하는 중에 찾아온다",
        "창의성은 즐거움을 느끼는 지성이다",
        "완벽함은 더 이상 뺄 것이 없을 때다"
    ];
    let quoteIdx = 0;
    function updateQuote() {
        if (!quoteSlider) return;
        quoteSlider.style.opacity = '0';
        setTimeout(() => {
            quoteSlider.innerHTML = `<div class="h-14 flex items-center justify-center font-bold text-slate-800 text-lg">${quotes[quoteIdx]}</div>`;
            quoteSlider.style.opacity = '1';
            quoteIdx = (quoteIdx + 1) % quotes.length;
        }, 500);
    }
    updateQuote();
    setInterval(updateQuote, 5000);
});
