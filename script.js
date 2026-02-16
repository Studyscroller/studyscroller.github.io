import { interestsData, startTopics, contentCards } from './appData.js';

// ... (DOM Elements and State remain same)

// --- Rendering ---
function renderInterests() {
    // Get interests based on selected start topic, or default
    const currentInterests = interestsData[state.startTopic] || interestsData['default'] || [];

    const renderChip = (item) => `
        <div class="chip" data-id="${item.id}">
            ${item.text}
        </div>
    `;

    containers.interestsGrid.innerHTML = currentInterests.map(renderChip).join('');

    // Also render discover grid (using default or combined)
    if (containers.discoverGrid) {
        // Show a mix for discover
        const mix = [...(interestsData['psychology'] || []), ...(interestsData['engineering'] || [])];
        containers.discoverGrid.innerHTML = mix.slice(0, 8).map(renderChip).join('');
    }

    // Chip selection logic (same as before)
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
            // Need to re-render interests based on choice
            renderInterests();
            goToScreen('interests');
        });
    });
}

// ... (API Fetching functions remain same)

// --- Features: Actions ---
window.saveToLibrary = function (cardId) {
    const allData = window.currentFeedData || [];
    // FIX: Ensure ID comparison is string-safe
    const card = allData.find(c => String(c.id) === String(cardId));
    const btn = document.getElementById(`save-${cardId}`);

    if (card) {
        const library = JSON.parse(localStorage.getItem('studyScrollerLib') || '[]');
        if (!library.find(c => String(c.id) === String(card.id))) {
            library.push(card);
            localStorage.setItem('studyScrollerLib', JSON.stringify(library));
            if (btn) btn.classList.add('saved');
            // alert("Saved!"); // Removed alert for smoother UX, visual cue is enough
        } else {
            // Already saved
            if (btn) btn.classList.add('saved');
        }
    } else {
        console.error("Card not found for saving:", cardId);
    }
};

window.shareContent = async function (title, url) {
    const safeUrl = url && url !== 'null' ? url : window.location.href;
    const shareData = {
        title: title,
        text: `Check out this article: "${title}" \nRead more here: ${safeUrl}`,
        url: safeUrl,
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (error) {
            console.log('Error sharing:', error);
        }
    } else {
        // Fallback: Copy to clipboard
        try {
            await navigator.clipboard.writeText(`${shareData.text}`);
            alert("Link copied to clipboard!");
        } catch (err) {
            alert("Share not supported.");
        }
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
                    <button class="action-btn" onclick="shareContent('${card.title ? card.title.replace(/'/g, "") : "StudyScroller"}', '${card.url}')" title="Share">📤</button>
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
    // 1. Finish Onboarding (Interests -> Feed)
    const finishBtn = document.getElementById('btn-finish-onboarding');
    if (finishBtn) {
        finishBtn.addEventListener('click', () => {
            goToScreen('feed');
        });
    }

    // 2. Back Button (Interests -> Start)
    const backBtn = document.getElementById('btn-back-interests');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            // Basic manual toggle back
            const current = document.querySelector('.screen.active');
            const prev = screens['start'];
            current.classList.remove('active');
            prev.classList.remove('prev');
            prev.classList.add('active');
        });
    }
}

// Run init
init();
