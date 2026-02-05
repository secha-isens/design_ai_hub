import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------------
    // 1. UI Elements & State
    // ---------------------------------------------------------
    const addToolBtn = document.getElementById('add-tool-btn');
    const modal = document.getElementById('add-tool-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const addToolForm = document.getElementById('add-tool-form');
    const toolGrid = document.getElementById('tool-grid');
    const searchInput = document.getElementById('search-input');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const navHomeBtn = document.getElementById('nav-home-btn');
    const navFavoritesBtn = document.getElementById('nav-favorites-btn');
    const aiEnhanceBtn = document.getElementById('ai-enhance-btn');
    const descriptionInput = document.getElementById('tool-description');

    const TOOLS_STORAGE_KEY = 'ai-design-hub-tools';
    const FAVORITES_STORAGE_KEY = 'ai-design-hub-favorites';

    let currentCategory = "전체";
    let currentView = 'all'; // 'all' or 'favorites'
    let favorites = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)) || [];
    const CATEGORIES = ["무료 외부 추천 툴", "우리 직원이 직접 만든 툴"];

    // ---------------------------------------------------------
    // 2. Sidebar & Navigation
    // ---------------------------------------------------------
    function toggleSidebar() {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            const isClosed = sidebar.classList.contains('-translate-x-full');
            if (isClosed) {
                sidebar.classList.remove('-translate-x-full');
                sidebarOverlay.classList.remove('hidden');
                setTimeout(() => sidebarOverlay.classList.remove('opacity-0'), 10);
            } else {
                sidebar.classList.add('-translate-x-full');
                sidebarOverlay.classList.add('opacity-0');
                setTimeout(() => sidebarOverlay.classList.add('hidden'), 300);
            }
        } else {
            sidebar.classList.toggle('md:w-0');
            sidebar.classList.toggle('md:border-none');
        }
    }

    if (sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', toggleSidebar);

    function updateSidebarUI() {
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
        updateSidebarUI();
        renderCategoryTabs();
        filterTools();
    });

    navFavoritesBtn.addEventListener('click', () => {
        currentView = 'favorites';
        updateSidebarUI();
        filterTools();
    });

    // ---------------------------------------------------------
    // 3. Category & Tool Rendering
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
                updateSidebarUI();
                filterTools();
            };
            tabsContainer.appendChild(btn);
        });
    }

    function renderToolCard(tool) {
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
                <h3 class="mb-2 text-lg font-bold text-slate-800">${name}</h3>
                <p class="text-sm text-slate-500 leading-relaxed mb-4">${description}</p>
                <p class="text-xs text-slate-400">제작: ${creator || '익명'}</p>
            </div>
            <div class="mt-6 pt-4 border-t border-slate-100">
                <a href="${url || '#'}" target="_blank" class="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-slate-500 bg-slate-50 rounded-lg group-hover:bg-brand-500 group-hover:text-white transition-all">
                    <span>바로가기</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </a>
            </div>
        `;
        toolGrid.appendChild(card);
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
    // 4. Interaction Logic
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
            filterTools(); // Refresh view
            // Update individual UI
            const svg = btn.querySelector('svg');
            const isNowFav = favorites.includes(id);
            svg.classList.toggle('active', isNowFav);
            svg.setAttribute('fill', isNowFav ? 'currentColor' : 'none');
        }
    });

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
        renderToolCard(newTool);
        addToolForm.reset();
        modal.classList.add('hidden');
        filterTools();
    });

    if (aiEnhanceBtn) {
        aiEnhanceBtn.addEventListener('click', async () => {
            const currentText = descriptionInput.value.trim();
            if (!currentText) return;
            aiEnhanceBtn.disabled = true;
            aiEnhanceBtn.textContent = "생성 중...";
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: `디자인 업무 자동화 툴의 설명을 한 줄의 임팩트 있는 대표 문구로 다듬어줘. 결과만 짧게 출력해. 원문: ${currentText}`,
                });
                if (response.text) descriptionInput.value = response.text.trim();
            } catch (e) {
                console.error(e);
            } finally {
                aiEnhanceBtn.disabled = false;
                aiEnhanceBtn.textContent = "AI로 다듬기";
            }
        });
    }

    searchInput.addEventListener('input', filterTools);

    // ---------------------------------------------------------
    // 5. Initial Load
    // ---------------------------------------------------------
    const storedTools = JSON.parse(localStorage.getItem(TOOLS_STORAGE_KEY)) || [];
    storedTools.forEach(renderToolCard);
    renderCategoryTabs();
    updateSidebarUI();

    // Random Quote Logic
    const quotes = ["디자인은 말보다 크게 말한다", "단순함은 궁극의 정교함이다", "영감은 일하는 중에 찾아온다"];
    const slider = document.getElementById('quote-slider');
    if (slider) {
        slider.innerHTML = `<div class="h-14 flex items-center justify-center font-bold text-slate-800">${quotes[Math.floor(Math.random() * quotes.length)]}</div>`;
    }
});
