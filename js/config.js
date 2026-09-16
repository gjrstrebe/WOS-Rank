// Global State Storage Architecture
let stateData = { 
    players: [], 
    schedules: {}, 
    settings: {} 
};

let activeStateId = ''; 
let currentDay = 'day4'; 
let activeDrawerSlot = null;
let localDrawerApplicants = []; 
let syncMode = 'live';
let timeDisplayMode = 'utc';
let isAdmin = false;

// Initialize Schedule Days Baseline
['day1', 'day2', 'day3', 'day4', 'day5'].forEach(d => { 
    stateData.schedules[d] = {}; 
});

// Full 24-Hour UTC Timetable Slots (30-min intervals)
const timeSlots = [
    '00:00 - 00:30', '00:30 - 01:00', '01:00 - 01:30', '01:30 - 02:00',
    '02:00 - 02:30', '02:30 - 03:00', '03:00 - 03:30', '03:30 - 04:00',
    '04:00 - 04:30', '04:30 - 05:00', '05:00 - 05:30', '05:30 - 06:00',
    '06:00 - 06:30', '06:30 - 07:00', '07:00 - 07:30', '07:30 - 08:00',
    '08:00 - 08:30', '08:30 - 09:00', '09:00 - 09:30', '09:30 - 10:00',
    '10:00 - 10:30', '10:30 - 11:00', '11:00 - 11:30', '11:30 - 12:00',
    '12:00 - 12:30', '12:30 - 13:00', '13:00 - 13:30', '13:30 - 14:00',
    '14:00 - 14:30', '14:30 - 15:00', '15:00 - 15:30', '15:30 - 16:00',
    '16:00 - 16:30', '16:30 - 17:00', '17:00 - 17:30', '17:30 - 18:00',
    '18:00 - 18:30', '18:30 - 19:00', '19:00 - 19:30', '19:30 - 20:00',
    '20:00 - 20:30', '20:30 - 21:00', '21:00 - 21:30', '21:30 - 22:00',
    '22:00 - 22:30', '22:30 - 23:00', '23:00 - 23:30', '23:30 - 24:00'
];

// Day Configuration Meta Mapping
const dayConfig = {
    day1: { name: "Construction", buff: "architect", title: "Infrastructure Minister (+20% Build Speed)", desc: "Calculates priority based on Construction speedups + Universal speedups combined with Furnace Level.", icon: "fa-compass-drafting", color: "text-cyan-400" },
    day2: { name: "Basic Skills Up", buff: "scientist", title: "Vice President (+20% Tech)", desc: "Calculates metric prioritization score from combined Tech Research + Universal Speedups inventories.", icon: "fa-microscope", color: "text-violet-400" },
    day3: { name: "Beast Slay", buff: "none", title: "Beast Slay Day (No Buff Required)", desc: "Day 3 focuses entirely on Stamina expenditure hunting monsters. No speedup scheduling required.", icon: "fa-paw", color: "text-emerald-400" },
    day4: { name: "Hero Development", buff: "instructor", title: "Education Minister (+20% Training Speed)", desc: "Day 4 features no native speedup buff. However, the Education Minister is available to help players pre-start/promote high-tier troop batches early.", icon: "fa-shield-halved", color: "text-amber-400" },
    day5: { name: "Power Boost", buff: "instructor", title: "Education Minister (+20% Training Speed)", desc: "Calculates priority ranking metrics for finishing pre-train batches and speeding up new troop squads.", icon: "fa-bolt", color: "text-orange-400" }
};

// Cryptographic Hash Utility for passcodes
async function sha256(message) {
    if (!message) return "";
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Data Normalizer for Backward Compatibility
function normalizeSlotData(rawSlot) {
    if (!rawSlot) return { applicants: [], lockedWinner: null };
    if (Array.isArray(rawSlot)) return { applicants: rawSlot, lockedWinner: null };
    return {
        applicants: Array.isArray(rawSlot.applicants) ? rawSlot.applicants : [],
        lockedWinner: typeof rawSlot.lockedWinner === 'string' ? rawSlot.lockedWinner : null
    };
}
