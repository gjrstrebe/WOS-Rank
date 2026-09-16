// Main Application Controller & Event Listener Orchestrator

/**
 * Tab switching controller
 */
function showTab(tabId) {
    ['scheduler', 'bear', 'scout'].forEach(id => {
        const view = document.getElementById(`view-${id}`);
        const btn = document.getElementById(`tabBtn-${id}`);
        if (view) {
            if (id === tabId) {
                view.classList.remove('hidden');
                if (btn) {
                    btn.className = "flex-grow sm:flex-initial text-center px-4 py-2.5 text-xs font-black rounded-lg transition bg-brand-accent/20 text-brand-accent flex items-center justify-center gap-1.5";
                }
            } else {
                view.classList.add('hidden');
                if (btn) {
                    btn.className = "flex-grow sm:flex-initial text-center px-4 py-2.5 text-xs font-black rounded-lg transition text-slate-400 hover:text-white flex items-center justify-center gap-1.5";
                }
            }
        }
    });

    const dayBar = document.getElementById('daySelectorTabs');
    if (dayBar) {
        if (tabId === 'scheduler') dayBar.classList.remove('hidden');
        else dayBar.classList.add('hidden');
    }

    if (tabId === 'bear') {
        calculateBearMarch();
    }
}

/**
 * Refreshes all active UI components
 */
function refreshUI() { 
    renderPlayers(); 
    renderSchedule(); 
    calculateBearMarch();
}

/**
 * System Toast Notification Display
 */
function showToast(message, type = "info") {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `p-3 text-xs font-bold border rounded-lg shadow-xl bg-slate-800 border-slate-700 text-slate-200 transition duration-300 opacity-0 transform translate-y-2`;
    
    if (type === "success") toast.className = "p-3 text-xs font-bold border rounded-lg shadow-xl bg-emerald-950 border-emerald-500 text-emerald-200";
    if (type === "danger" || type === "error") toast.className = "p-3 text-xs font-bold border rounded-lg shadow-xl bg-rose-950 border-rose-500 text-rose-200";
    if (type === "warning") toast.className = "p-3 text-xs font-bold border rounded-lg shadow-xl bg-amber-950 border-amber-500 text-amber-200";
    
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.remove('opacity-0', 'translate-y-2'), 20);
    setTimeout(() => { 
        toast.classList.add('opacity-0'); 
        setTimeout(() => toast.remove(), 300); 
    }, 4000);
}

// Portal Navigation Routines
function routeToLaunchPad() {
    document.getElementById('mainDashboardApp')?.classList.add('hidden');
    document.getElementById('mainAppHeader')?.classList.add('hidden');
    document.getElementById('daySelectorTabs')?.classList.add('hidden');
    document.getElementById('launchPadPortal')?.classList.remove('hidden');
}

function resetPortalState() {
    document.getElementById('stateLookupForm')?.classList.remove('hidden');
    document.getElementById('stateLoginForm')?.classList.add('hidden');
    document.getElementById('stateRegistrationForm')?.classList.add('hidden');
}

async function handleStateLookup(event) {
    event.preventDefault();
    const input = document.getElementById('targetStateInput');
    if (!input || !input.value.trim()) return;

    activeStateId = input.value.trim();
    bypassLaunchPadDirect();
}

function bypassLaunchPadDirect() {
    localStorage.setItem('active_state_v2', activeStateId);
    
    document.getElementById('mainDashboardApp')?.classList.remove('hidden');
    document.getElementById('mainAppHeader')?.classList.remove('hidden');
    document.getElementById('launchPadPortal')?.classList.add('hidden');

    showTab('scheduler');
    if (typeof subscribeToData === 'function') subscribeToData();
}

async function handleStateLogin(event) {
    event.preventDefault();
    bypassLaunchPadDirect();
}

async function handleStateRegistration(event) {
    event.preventDefault();
    bypassLaunchPadDirect();
}

// Global Initialization Lifecycle
window.addEventListener('DOMContentLoaded', () => {
    switchDay('day4'); 

    // Auto-login to cached server if available
    const cachedState = localStorage.getItem('active_state_v2');
    if (cachedState) {
        activeStateId = cachedState;
        const targetInput = document.getElementById('targetStateInput');
        if (targetInput) targetInput.value = cachedState;
        bypassLaunchPadDirect();
    } else {
        const btn = document.getElementById('lookupSubmitBtn');
        const text = document.getElementById('lookupBtnText');
        const spin = document.getElementById('lookupSpinIcon');
        
        if (btn) {
            btn.disabled = false;
            btn.className = "w-full py-3 px-4 bg-brand-accent hover:bg-sky-400 text-brand-dark font-black rounded-lg text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer";
        }
        if (text) text.textContent = "Next";
        if (spin) spin.style.display = "none";
    }

    if (typeof auth !== 'undefined' && auth) {
        auth.onAuthStateChanged(user => {
            currentUser = user;
            if (user && activeStateId && typeof subscribeToData === 'function') {
                subscribeToData();
            }
        });
        auth.signInAnonymously().catch(e => console.error("Auth Exception: ", e));
    }
});
