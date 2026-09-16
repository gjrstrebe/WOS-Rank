// Whiteout Survivor Bear Trap Combat Engine (PCB Model V6a)

// Hero Skill 1 Buff Definitions (Top 4 Joiners Max +25% Each = +100% Capped)
const JOINER_BUFF_VALUES = {
    jessie: 0.25,
    jasser: 0.25,
    patrick: 0.25,
    none: 0.00
};

// Preset Troop Ratio Configurations
const BEAR_PRESETS = {
    optimal: { inf: 10, lan: 40, mar: 50 },  // Standard community optimal (crowding mitigated)
    maxdps:  { inf: 5,  lan: 35, mar: 60 },  // Max Marksmen push with ~5k Inf trigger baseline
    balanced: { inf: 20, lan: 40, mar: 40 }  // Safe balanced spread
};

/**
 * Updates March Ratio Sliders dynamically guaranteeing 100% total sum
 */
function updateBearSliders(changed) {
    const infSlider = document.getElementById('sliderInf');
    const lanSlider = document.getElementById('sliderLan');
    const marSlider = document.getElementById('sliderMar');
    
    if (!infSlider || !lanSlider || !marSlider) return;

    let inf = parseInt(infSlider.value) || 0;
    let lan = parseInt(lanSlider.value) || 0;
    let mar = parseInt(marSlider.value) || 0;

    // Balance remaining percentage to keep sum at 100%
    if (changed === 'inf') {
        let remaining = 100 - inf;
        lan = Math.round(remaining * (lan / (lan + mar || 1)));
        mar = 100 - inf - lan;
    } else if (changed === 'lan') {
        let remaining = 100 - lan;
        inf = Math.round(remaining * (inf / (inf + mar || 1)));
        mar = 100 - lan - inf;
    } else if (changed === 'mar') {
        let remaining = 100 - mar;
        inf = Math.round(remaining * (inf / (inf + lan || 1)));
        lan = 100 - mar - inf;
    }

    // Update input slider values
    infSlider.value = inf;
    lanSlider.value = lan;
    marSlider.value = mar;

    // Update UI text display
    document.getElementById('sliderInfVal').textContent = `${inf}%`;
    document.getElementById('sliderLanVal').textContent = `${lan}%`;
    document.getElementById('sliderMarVal').textContent = `${mar}%`;

    calculateBearMarch();
}

/**
 * Applies a predefined troop ratio preset
 */
function applyBearPreset(presetKey) {
    const preset = BEAR_PRESETS[presetKey];
    if (!preset) return;

    const infSlider = document.getElementById('sliderInf');
    const lanSlider = document.getElementById('sliderLan');
    const marSlider = document.getElementById('sliderMar');

    if (infSlider && lanSlider && marSlider) {
        infSlider.value = preset.inf;
        lanSlider.value = preset.lan;
        marSlider.value = preset.mar;

        document.getElementById('sliderInfVal').textContent = `${preset.inf}%`;
        document.getElementById('sliderLanVal').textContent = `${preset.lan}%`;
        document.getElementById('sliderMarVal').textContent = `${preset.mar}%`;

        calculateBearMarch();
    }
}

/**
 * Primary Calculation Engine: Computes troop counts, Joiner Skill 1 stacking, and visual bar updating
 */
function calculateBearMarch() {
    const capacityEl = document.getElementById('bearMarchCapacity');
    if (!capacityEl) return;

    const totalCapacity = parseInt(capacityEl.value) || 0;

    const infPct = parseInt(document.getElementById('sliderInf')?.value || 10) / 100;
    const lanPct = parseInt(document.getElementById('sliderLan')?.value || 40) / 100;
    const marPct = parseInt(document.getElementById('sliderMar')?.value || 50) / 100;

    // Compute raw unit counts based on capacity
    const infCount = Math.round(totalCapacity * infPct);
    const lanCount = Math.round(totalCapacity * lanPct);
    const marCount = Math.round(totalCapacity * marPct);

    // Update count displays on card
    const displayInf = document.getElementById('bearInfantryCount');
    const displayLan = document.getElementById('bearLancerCount');
    const displayMar = document.getElementById('bearMarksmanCount');

    if (displayInf) displayInf.textContent = infCount.toLocaleString();
    if (displayLan) displayLan.textContent = lanCount.toLocaleString();
    if (displayMar) displayMar.textContent = marCount.toLocaleString();

    // Update dynamic visual bar widths
    const barInf = document.getElementById('barInf');
    const barLan = document.getElementById('barLan');
    const barMar = document.getElementById('barMar');

    if (barInf) {
        barInf.style.width = `${(infPct * 100).toFixed(0)}%`;
        barInf.textContent = `${(infPct * 100).toFixed(0)}%`;
    }
    if (barLan) {
        barLan.style.width = `${(lanPct * 100).toFixed(0)}%`;
        barLan.textContent = `${(lanPct * 100).toFixed(0)}%`;
    }
    if (barMar) {
        barMar.style.width = `${(marPct * 100).toFixed(0)}%`;
        barMar.textContent = `${(marPct * 100).toFixed(0)}%`;
    }

    // Compute Top 4 Joiners Skill 1 Stack (Max +100%)
    const j1 = JOINER_BUFF_VALUES[document.getElementById('joiner1')?.value || 'jessie'] || 0;
    const j2 = JOINER_BUFF_VALUES[document.getElementById('joiner2')?.value || 'jessie'] || 0;
    const j3 = JOINER_BUFF_VALUES[document.getElementById('joiner3')?.value || 'jasser'] || 0;
    const j4 = JOINER_BUFF_VALUES[document.getElementById('joiner4')?.value || 'patrick'] || 0;

    const totalJoinerBoost = Math.min(j1 + j2 + j3 + j4, 1.00); // Capped at +100%
    const totalBoostEl = document.getElementById('joinerBoostTotal');
    
    if (totalBoostEl) {
        totalBoostEl.textContent = `+${(totalJoinerBoost * 100).toFixed(0)}% Boost`;
    }
}
