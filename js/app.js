// Main Application Controller & Event Listener Orchestrator

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

    if (tabId === 'bear' && typeof calculateBearMarch === 'function') {
        calculateBearMarch();
    }
}

function refreshUI() { 
    if (typeof renderPlayers === 'function') renderPlayers(); 
    if (typeof renderSchedule === 'function') renderSchedule(); 
    if (typeof calculateBearMarch === 'function') calculateBearMarch();
    if (typeof updateHeaderStatusPill === 'function') updateHeaderStatusPill();
}

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

// ==========================================
// Launch Pad & State Selection Controllers
// ==========================================

function resetPortalState() {
    document.getElementById('stateLookupForm')?.classList.remove('hidden');
    document.getElementById('stateLoginForm')?.classList.add('hidden');
    document.getElementById('stateRegistrationForm')?.classList.add('hidden');

    // Unlock button and replace spinner with "Next"
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

function routeToLaunchPad() {
    document.getElementById('mainDashboardApp')?.classList.add('hidden');
    document.getElementById('mainAppHeader')?.classList.add('hidden');
    document.getElementById('daySelectorTabs')?.classList.add('hidden');
    document.getElementById('launchPadPortal')?.classList.remove('hidden');

    resetPortalState();
}


async function handleStateLookup(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('targetStateInput');
    if (!input || !input.value.trim()) return;

    const selectedId = input.value.trim();
    if (typeof setActiveState === 'function') {
        setActiveState(selectedId);
    } else {
        activeStateId = selectedId;
        localStorage.setItem('svs_active_state', activeStateId);
    }
    bypassLaunchPadDirect();
}

function bypassLaunchPadDirect() {
    if (activeStateId) {
        localStorage.setItem('svs_active_state', activeStateId);
    }
    
    document.getElementById('mainDashboardApp')?.classList.remove('hidden');
    document.getElementById('mainAppHeader')?.classList.remove('hidden');
    document.getElementById('launchPadPortal')?.classList.add('hidden');

    showTab('scheduler');
    if (typeof subscribeToData === 'function') subscribeToData();
}

async function handleStateLogin(event) {
    if (event) event.preventDefault();
    bypassLaunchPadDirect();
}

async function handleStateRegistration(event) {
    if (event) event.preventDefault();
    bypassLaunchPadDirect();
}

// ==========================================
// Presidency / Admin Modal Handlers
// ==========================================

function openAdminModal() {
    const modal = document.getElementById('adminModal') || document.getElementById('presidencyModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeAdminModal() {
    const modal = document.getElementById('adminModal') || document.getElementById('presidencyModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

async function verifyAdminPasscode(passcode) {
    if (!passcode) return false;
    const inputHash = await sha256(passcode);
    const storedHash = stateData.settings?.adminHash || "";
    
    // Default fallback passcode check if not explicitly set
    if (!storedHash && (passcode === "1234" || passcode === "admin")) {
        isAdmin = true;
        showToast("Presidency Admin Access Granted", "success");
        closeAdminModal();
        refreshUI();
        return true;
    }

    if (storedHash && inputHash === storedHash) {
        isAdmin = true;
        showToast("Presidency Admin Access Granted", "success");
        closeAdminModal();
        refreshUI();
        return true;
    }

    showToast("Invalid Passcode", "error");
    return false;
}

// ==========================================
// Schedule Slot & Applicant Drawer Handlers
// ==========================================

function openSlotDrawer(slotTime) {
    activeDrawerSlot = slotTime;
    const drawer = document.getElementById('applicantDrawer') || document.getElementById('slotDrawer');
    if (drawer) {
        drawer.classList.remove('hidden');
        drawer.classList.add('flex');
    }
    if (typeof renderDrawerApplicants === 'function') renderDrawerApplicants();
}

function closeDrawer() {
    activeDrawerSlot = null;
    const drawer = document.getElementById('applicantDrawer') || document.getElementById('slotDrawer');
    if (drawer) {
        drawer.classList.add('hidden');
        drawer.classList.remove('flex');
    }
}

function assignPlayerToSlot(playerName) {
    if (!currentDay || !activeDrawerSlot) return;

    if (!stateData.schedules[currentDay]) stateData.schedules[currentDay] = {};
    const slotObj = normalizeSlotData(stateData.schedules[currentDay][activeDrawerSlot]);

    // Toggle assign/unassign
    if (slotObj.lockedWinner === playerName) {
        slotObj.lockedWinner = null;
        showToast(`Removed ${playerName} from ${activeDrawerSlot}`, "info");
    } else {
        slotObj.lockedWinner = playerName;
        showToast(`Assigned ${playerName} to ${activeDrawerSlot}`, "success");
    }

    stateData.schedules[currentDay][activeDrawerSlot] = slotObj;
    
    if (typeof saveCloudData === 'function') saveCloudData();
    closeDrawer();
}

// ==========================================
// Initialization & Event Binding
// ==========================================

window.addEventListener('DOMContentLoaded', () => {
    if (typeof initFirebase === 'function') {
        initFirebase();
    }
    
    if (typeof switchDay === 'function') {
        switchDay('day4'); 
    }

    const cachedState = localStorage.getItem('svs_active_state');
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
            runDiagnostics.auth = 'success';
            if (user && activeStateId && typeof subscribeToData === 'function') {
                subscribeToData();
            }
            refreshUI();
        });
        auth.signInAnonymously().catch(e => {
            console.error("Auth Exception: ", e);
            runDiagnostics.auth = 'failed';
            refreshUI();
        });
    }
});
