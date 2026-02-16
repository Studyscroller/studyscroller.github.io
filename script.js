import { interests, startTopics, contentCards } from './data.js';

// DOM Elements
const screens = {
    interests: document.getElementById('onboarding-interests'),
    start: document.getElementById('onboarding-start'),
    feed: document.getElementById('main-feed')
};

const containers = {
    interestsGrid: document.getElementById('interests-grid'),
    startList: document.getElementById('start-topics-list'),
    feedTrack: document.getElementById('feed-track'),
    discoverGrid: document.getElementById('discover-grid'),
    libraryList: document.getElementById('library-list')
};

const state = {
    selectedInterests: new Set(),
    startTopic: null
};

// --- Initialization ---
function init() {
    renderInterests();
    renderStartTopics();
    attachEventListeners();

    // Check if onboarding is done (basic check)
    // For now, we always start at onboarding for demo purposes
}

// --- Rendering ---
function renderInterests() {
    const renderChip = (item) => `
        <div class="chip" data-id="${item.id}">
            ${item.text}
        </div>
    `;

    containers.interestsGrid.innerHTML = interests.map(renderChip).join('');

    // Also render discover grid
    if (containers.discoverGrid) {
        containers.discoverGrid.innerHTML = interests.map(renderChip).join('');
    }

    // Chip selection logic
    const toggleChip = (chip) => {
        chip.classList.toggle('selected');
        const id = chip.dataset.id;
        if (state.selectedInterests.has(id)) {
            state.selectedInterests.delete(id);
        } else {
            state.selectedInterests.add(id);
        }
    };

    containers.interestsGrid.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => toggleChip(chip));
    });
}

function renderStartTopics() {
    containers.startList.innerHTML = startTopics.map(item => `
        <button class="list-item" data-id="${item.id}">
            <span class="emoji">${item.icon}</span>
            <span>${item.text}</span>
        </button>
    `).join('');

    // Start topic selection logic
    containers.startList.querySelectorAll('.list-item').forEach(btn => {
        btn.addEventListener('click', () => {
            state.startTopic = btn.dataset.id;
            // SKIP AGE SCREEN -> Go direct to feed
            goToScreen('feed');
        });
    });
}

// --- API Integration (OpenAlex & OpenFDA) ---
async function fetchResearchPapers(topic) {
    const baseUrl = 'https://api.openalex.org/works';
    const query = topic ? topic.toLowerCase() : 'science';
    const url = `${baseUrl}?search=${query}&filter=has_abstract:true&sample=10&select=title,publication_year,abstract_inverted_index,id,primary_location,doi`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.results.map(cleanOpenAlexData);
    } catch (error) {
        console.error("OpenAlex API Error:", error);
        return [];
    }
}

async function fetchDrugData(topic) {
    // Basic mapping of topics to drug conditions or classes
    const drugKeywords = {
        'Psychology': 'antidepressant',
        'Biology': 'antibiotic',
        'Medicine': 'pain',
        'Chemistry': 'chemical',
        'Engineering': 'device'
    };

    const keyword = drugKeywords[topic] || topic || 'health';
    const url = `https://api.fda.gov/drug/label.json?search=indications_and_usage:${keyword}&limit=5`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.results) {
            return data.results.map(cleanOpenFDAData);
        }
        return [];
    } catch (error) {
        // console.error("OpenFDA API Error:", error); 
        // OpenFDA search often 404s on no results, just ignore
        return [];
    }
}

function cleanOpenFDAData(drug) {
    return {
        id: drug.id || Math.random().toString(36),
        category: "Medicine",
        tag: "Drug Info",
        title: drug.openfda?.brand_name?.[0] || drug.openfda?.generic_name?.[0] || "Unknown Drug",
        text: drug.indications_and_usage ? drug.indications_and_usage[0].substring(0, 250) + "..." : "No description available.",
        year: drug.effective_time ? drug.effective_time.substring(0, 4) : "",
        image: null,
        url: `https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=${drug.openfda?.brand_name?.[0]}`,
        type: 'drug'
    };
}

function reconstructAbstract(invertedIndex) {
    if (!invertedIndex) return "No abstract available.";
    const wordList = [];
    Object.entries(invertedIndex).forEach(([word, positions]) => {
        positions.forEach(pos => { wordList[pos] = word; });
    });
    const fullText = wordList.join(' ');
    return fullText.length > 250 ? fullText.substring(0, 250) + "..." : fullText;
}

function cleanOpenAlexData(work) {
    return {
        id: work.id,
        category: work.primary_location?.source?.display_name || "Research",
        tag: "Science Fact",
        title: work.title,
        text: reconstructAbstract(work.abstract_inverted_index),
        year: work.publication_year,
        image: null,
        url: work.doi || null,
        type: 'research'
    };
}

// --- Features: Actions ---
window.saveToLibrary = function (cardId) {
    const allData = window.currentFeedData || [];
    const card = allData.find(c => c.id === cardId);
    if (card) {
        const library = JSON.parse(localStorage.getItem('studyScrollerLib') || '[]');
        if (!library.find(c => c.id === card.id)) {
            library.push(card);
            localStorage.setItem('studyScrollerLib', JSON.stringify(library));
            alert("Saved to Library!");
        } else {
            alert("Already in Library");
        }
    }
};

window.shareContent = async function (title, text) {
    if (navigator.share) {
        try {
            await navigator.share({
                title: title,
                text: text,
                url: window.location.href,
            });
        } catch (error) {
            console.log('Error sharing:', error);
        }
    } else {
        alert("Share not supported on this browser (check context is secure).");
    }
};

window.openLink = function (url) {
    if (url && url !== 'null') window.open(url, '_blank');
    else alert("No external link available for this item.");
};

window.switchTab = function (tabName) {
    // Hide all main sections
    document.getElementById('main-feed').style.display = 'none';
    document.getElementById('section-discover').style.display = 'none';
    document.getElementById('section-library').style.display = 'none';

    // Show active
    if (tabName === 'home') document.getElementById('main-feed').style.display = 'block';
    if (tabName === 'discover') {
        document.getElementById('section-discover').style.display = 'block';
    }
    if (tabName === 'library') {
        document.getElementById('section-library').style.display = 'block';
        renderLibrary();
    }
};

function renderLibrary() {
    const libList = document.getElementById('library-list');
    const library = JSON.parse(localStorage.getItem('studyScrollerLib') || '[]');
    if (library.length === 0) {
        libList.innerHTML = '<p style="color:#aaa">No saved items.</p>';
        return;
    }
    libList.innerHTML = library.map(c => `
        <div class="list-item" onclick="openLink('${c.url}')">
            <div>
                <div style="font-weight:bold; font-size:14px">${c.title}</div>
                <div style="font-size:12px; opacity:0.7">${c.tag}</div>
            </div>
            <button style="background:none; border:none; color:white;">→</button>
        </div>
    `).join('');
}


// --- Feed Logic ---
window.currentFeedData = [];

async function renderFeed() {
    containers.feedTrack.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100%;color:white;">Scanning global databases...</div>';

    // FETCH REAL DATA PARALLEL
    const [papers, drugs] = await Promise.all([
        fetchResearchPapers(state.startTopic),
        fetchDrugData(state.startTopic)
    ]);

    // Interleave data
    const mixedData = [];
    const maxLength = Math.max(papers.length, drugs.length);
    for (let i = 0; i < maxLength; i++) {
        if (papers[i]) mixedData.push(papers[i]);
        if (drugs[i]) mixedData.push(drugs[i]);
    }

    // Fallback
    window.currentFeedData = mixedData.length > 0 ? mixedData : contentCards;

    containers.feedTrack.innerHTML = window.currentFeedData.map((card) => {
        const bgStyle = card.image
            ? `background-image: url('${card.image}'); background-size: cover;`
            : `background: linear-gradient(${Math.random() * 360}deg, #2d3436, #000000);`;

        return `
        <article class="card">
            <!-- Glass Card Content -->
            <div class="card-glass">
                <div class="card-meta">
                    <span class="card-tag">${card.tag || 'Info'}</span>
                    <span class="card-year">${card.year || ''}</span>
                </div>
                
                <h2 class="card-title">${card.title}</h2>
                <p class="card-abstract">${card.text}</p>
                
                <div class="card-actions">
                    <button class="action-btn" onclick="saveToLibrary('${card.id}')" title="Save to Library">🔖</button>
                    <button class="action-btn" onclick="openLink('${card.url}')" title="Read Full Paper">📖</button>
                    <button class="action-btn" onclick="shareContent('${card.title ? card.title.replace(/'/g, "") : "StudyScroller"}', 'Check this out!')" title="Share">📤</button>
                </div>
            </div>
        </article>
    `}).join('');

    containers.feedTrack.scrollTop = 0;
}

// --- Navigation ---
function goToScreen(screenName) {
    const current = document.querySelector('.screen.active');
    const next = screens[screenName] || document.getElementById('main-feed');

    if (current) {
        current.classList.remove('active');
        current.classList.add('prev');
    }

    if (next) {
        next.classList.remove('next'); // ensure clean state
        next.classList.add('active');
    }

    // Lifecycle hooks
    if (screenName === 'feed') {
        renderFeed();
    }
}

function attachEventListeners() {
    // Interest Screen Next Button
    document.getElementById('btn-next-1').addEventListener('click', () => {
        goToScreen('start');
    });

    // Back Buttons (Simulated for single page feeling)
    document.getElementById('btn-back-2').addEventListener('click', () => {
        const current = document.querySelector('.screen.active');
        const prev = screens['interests'];
        current.classList.remove('active');
        prev.classList.remove('prev');
        prev.classList.add('active');
    });
}

// Run init
init();
