// Ministerial SVS Scheduler Engine

/**
 * Calculates competitor yield score based on Furnace/FC level, speedups, and upgrade push flag
 */
function calculateScore(furnace, speedups, fc_level = 0, hasHeavyPush = false) {
    let normalizedFurnace = furnace;
    let normalizedFc = fc_level;
    
    if (furnace > 30) {
        normalizedFc = Math.min(furnace - 30, 10);
        normalizedFurnace = 30;
    }
    
    let weight = 0.4; 
    if (normalizedFc > 0) {
        weight = 1.0 + (normalizedFc * 0.1); 
    } else if (normalizedFurnace === 30) {
        weight = 1.0; 
    } else if (normalizedFurnace >= 28) {
        weight = 0.8; 
    } else if (normalizedFurnace >= 25) {
        weight = 0.6; 
    } else {
        weight = 0.4; 
    }
    
    let baseScore = speedups * weight;
    if (hasHeavyPush) baseScore *= 1.5;
    return parseFloat(baseScore.toFixed(2));
}

/**
 * Gets specific competitor score for an active SvS prep day
 */
function getPlayerScore(p, day) {
    const config = dayConfig[day];
    if (!config) return 0;
    const buffType = config.buff;
    const f = parseInt(p.furnace) || 0;
    const fc_level = parseInt(p.fc_level) || 0;
    const uVal = parseFloat(p.speedups_universal) || 0;
    const hasFc = p.fc_upgrade || false;
    
    let targetSpeedup = 0;
    if (buffType === 'architect') targetSpeedup = parseFloat(p.speedups_build) || 0;
    else if (buffType === 'scientist') targetSpeedup = parseFloat(p.speedups_research) || 0;
    else if (buffType === 'instructor') targetSpeedup = parseFloat(p.speedups_train) || 0;
    else if (buffType === 'universal') targetSpeedup = Math.max(parseFloat(p.speedups_build)||0, parseFloat(p.speedups_research)||0, parseFloat(p.speedups_train)||0);

    return calculateScore(f, targetSpeedup + uVal, fc_level, hasFc);
}

/**
 * Switches the active SVS Prep Day tab
 */
function switchDay(dayId) {
    currentDay = dayId;
    const config = dayConfig[dayId];
    if (!config) return;

    const textHeader = document.getElementById('infoBuffLabel');
    const descHeader = document.getElementById('infoBuffDescription');
    if (textHeader) textHeader.textContent = config.title;
    if (descHeader) descHeader.textContent = config.desc;

    ['day1', 'day2', 'day3', 'day4', 'day5'].forEach(d => {
        const btn = document.getElementById(`btnDay-${d}`);
        if (btn) {
            btn.className = d === dayId 
                ? "px-1.5 sm:px-3 py-1.5 text-[9px] sm:text-xs font-bold rounded-lg transition border bg-brand-accent/20 text-brand-accent border-brand-accent flex-grow animate-pulse" 
                : "px-1.5 sm:px-3 py-1.5 text-[9px] sm:text-xs font-bold rounded-lg transition border bg-slate-800 text-slate-400 border-transparent hover:text-white flex-grow";
        }
    });
    refreshUI();
}

/**
 * Handles adding a new competitor profile
 */
function handleAddPlayer(event) {
    event.preventDefault();
    const nameField = document.getElementById('playerName');
    const furnaceField = document.getElementById('furnaceLevel');
    const sBuild = document.getElementById('speedups_build');
    const sResearch = document.getElementById('speedups_research');
    const sTrain = document.getElementById('speedups_train');
    const sUniversal = document.getElementById('speedups_universal');

    if (!nameField || !furnaceField) return;

    const name = nameField.value.trim();
    let furnace = parseInt(furnaceField.value);
    let fc_level = 0;

    if (furnace > 30) {
        fc_level = Math.min(furnace - 30, 10);
        furnace = 30;
    }

    if (!name || isNaN(furnace)) return;
    if (stateData.players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        showToast("This competitor profile already exists in the State Registry.", "warning");
        return;
    }

    stateData.players.push({
        name, furnace, fc_level,
        speedups_build: sBuild ? parseFloat(sBuild.value) || 0 : 0,
        speedups_research: sResearch ? parseFloat(sResearch.value) || 0 : 0,
        speedups_train: sTrain ? parseFloat(sTrain.value) || 0 : 0,
        speedups_universal: sUniversal ? parseFloat(sUniversal.value) || 0 : 0,
        fc_upgrade: false
    });

    saveCloudData();
    showToast(`Added profile: ${name}`, "success");
    
    nameField.value = ''; 
    furnaceField.value = '';
    if (sBuild) sBuild.value = '';
    if (sResearch) sResearch.value = '';
    if (sTrain) sTrain.value = '';
    if (sUniversal) sUniversal.value = '';
}

/**
 * Removes a player profile from state roster
 */
function removePlayer(name) {
    stateData.players = stateData.players.filter(p => p.name !== name);
    Object.keys(stateData.schedules).forEach(day => {
        Object.keys(stateData.schedules[day] || {}).forEach(slot => {
            let sData = stateData.schedules[day][slot];
            if (sData && typeof sData === 'object') {
                sData.applicants = (sData.applicants || []).filter(n => n !== name);
                if (sData.lockedWinner === name) sData.lockedWinner = null;
            }
        });
    });
    saveCloudData();
    showToast(`Removed entry: ${name}`, "info");
}

/**
 * Renders state player roster
 */
function renderPlayers() {
    const container = document.getElementById('playerList');
    if (!container) return;
    
    if (stateData.players.length === 0) {
        container.innerHTML = `<div class="text-center py-6 text-slate-500 text-xs">No entries available in State Roster yet.</div>`;
        return;
    }

    container.innerHTML = '';
    [...stateData.players].sort((a,b) => getPlayerScore(b, currentDay) - getPlayerScore(a, currentDay)).forEach(p => {
        let sc = getPlayerScore(p, currentDay);
        let isFc = parseInt(p.fc_level) > 0;
        let lvlDisplay = isFc ? `FC${p.fc_level}` : `F${p.furnace}`;
        container.innerHTML += `
            <div class="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-brand-border text-xs mb-1.5">
                <div class="flex items-center gap-1.5 font-bold text-white">
                    <span class="px-1.5 py-0.5 bg-slate-800 text-[10px] rounded text-slate-400 font-mono">${lvlDisplay}</span>
                    <span>${p.name}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="font-mono text-emerald-400 font-bold">${sc.toFixed(2)}</span>
                    <button onclick="removePlayer('${p.name}')" class="text-rose-400 hover:bg-rose-500/20 p-1 rounded" title="Remove"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`;
    });
}

/**
 * Renders 24-hour timetable slots schedule
 */
function renderSchedule() {
    const container = document.getElementById('scheduleContainer');
    if (!container) return;
    container.innerHTML = '';
    const activeDaySched = stateData.schedules[currentDay] || {};

    timeSlots.forEach(slot => {
        let sData = normalizeSlotData(activeDaySched[slot]);
        let apps = sData.applicants || [];
        let winner = sData.lockedWinner || null;
        let maxScore = -1;

        if (!winner) {
            apps.forEach(n => {
                let p = stateData.players.find(pl => pl.name === n);
                if (p && getPlayerScore(p, currentDay) > maxScore) { winner = n; maxScore = getPlayerScore(p, currentDay); }
            });
        } else {
            let p = stateData.players.find(pl => pl.name === winner);
            if (p) maxScore = getPlayerScore(p, currentDay);
        }

        let statusBadge = !winner ? `<span class="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">Vacant</span>`
            : (sData.lockedWinner ? `<span class="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">🔒 Locked: ${winner} (${maxScore.toFixed(2)})</span>`
            : `<span class="text-[10px] bg-brand-accent/10 text-brand-accent border border-brand-accent/20 px-2 py-0.5 rounded-full font-bold">Secured: ${winner} (${maxScore.toFixed(2)})</span>`);

        container.innerHTML += `
            <div class="p-3 bg-slate-900/40 border border-brand-border rounded-xl flex items-center justify-between hover:border-slate-800 transition">
                <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-white font-mono">${slot} UTC</span>
                    ${statusBadge}
                </div>
            </div>`;
    });
}
