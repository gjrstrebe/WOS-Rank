// Firebase Integration & Cloud Database Synchronizer

let appId = 'svs-scheduler-a1919'; 
const urlParams = new URLSearchParams(window.location.search);
const isStagingParam = urlParams.get('env') === 'staging' || urlParams.get('stage') === 'true';
const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '';
const isSandboxFrame = window.location.hostname.includes('null') || window.location.hostname.includes('sandbox') || window.location.pathname.includes('artifacts');

if (isLocalHost || isSandboxFrame || isStagingParam) {
    appId = 'svs-scheduler-a1919-staging'; 
}

let firebaseConfig = {
    apiKey: "AIzaSyDQuzprhL2M3hrR585iyHeLr0BtUTMfCxA",
    authDomain: "svs-scheduler-a1919.firebaseapp.com",
    databaseURL: "https://svs-scheduler-a1919-default-rtdb.firebaseio.com",
    projectId: "svs-scheduler-a1919",
    storageBucket: "svs-scheduler-a1919.firebasestorage.app",
    messagingSenderId: "1070850863206",
    appId: "1:1070850863206:web:a2de4c38691fd0c89ebda7"
};

let db, auth, unsubscribeState = null;
let currentUser = null; 

try {
    const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
    db = app.firestore();
    auth = app.auth();
} catch(e) { 
    console.error("Firebase Initialization Exception: ", e.message);
}

function getCollectionRef() {
    if (!activeStateId || !db) return null;
    return db.collection('artifacts').doc(appId)
             .collection('public').doc('data')
             .collection('states').doc(activeStateId);
}

function subscribeToData() {
    if (!db || !currentUser || syncMode === 'offline' || !activeStateId) return;
    if (unsubscribeState) unsubscribeState();
    
    const currentRef = getCollectionRef();
    if (!currentRef) return;

    unsubscribeState = currentRef.onSnapshot(async doc => {
        if (doc.exists) {
            const data = doc.data();
            stateData.players = data.players || [];
            stateData.settings = data.settings || {};
            const rawSchedules = data.schedules || {};
            
            stateData.schedules = {};
            ['day1', 'day2', 'day3', 'day4', 'day5'].forEach(day => {
                stateData.schedules[day] = {};
            });

            Object.keys(rawSchedules).forEach(dayId => {
                if (['day1', 'day2', 'day3', 'day4', 'day5'].includes(dayId)) {
                    stateData.schedules[dayId] = {};
                    const slots = rawSchedules[dayId] || {};
                    Object.keys(slots).forEach(slot => {
                        stateData.schedules[dayId][slot] = normalizeSlotData(slots[slot]);
                    });
                }
            });
            refreshUI();
        }
    });
}

async function saveCloudData() {
    refreshUI();
    if (syncMode === 'offline') {
        localStorage.setItem(`offline_state_${activeStateId}`, JSON.stringify(stateData));
        return;
    }
    if (!db || !currentUser || syncMode === 'offline' || !activeStateId) return;
    try {
        const serializedPayload = JSON.parse(JSON.stringify({
            players: stateData.players,
            schedules: stateData.schedules,
            settings: stateData.settings || {}
        }));
        const ref = getCollectionRef();
        if (ref) {
            await ref.set(serializedPayload); 
        }
    } catch(e) { 
        console.error("Error saving cloud data: ", e);
    }
}
