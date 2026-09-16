// js/bear.js - PCB V6a Math Engine & Ratio Controls

/**
 * Main Bear Trap March Calculator & Bar Updater
 */
function calculateBearMarch() {
    const capInput = document.getElementById('bearMarchCapacity');
    const infInput = document.getElementById('bearInfRatio');
    const lanInput = document.getElementById('bearLanRatio');
    const markInput = document.getElementById('bearMarkRatio');

    // Guard clause: Exit safely if inputs aren't in the DOM
    if (!capInput || !infInput || !lanInput || !markInput) return;

    const totalCapacity = parseInt(capInput.value || 150000);
    const infRatio = parseInt(infInput.value || 10) / 100;
    const lanRatio = parseInt(lanInput.value || 30) / 100;
    const markRatio = parseInt(markInput.value || 60) / 100;

    // Calculate Troop Counts
    const infCount = Math.round(totalCapacity * infRatio);
    const lanCount = Math.round(totalCapacity * lanRatio);
    const markCount = Math.round(totalCapacity * markRatio);

    // Update Numerical Count Displays
    if (document.getElementById('countInfantry')) document.getElementById('countInfantry').textContent = infCount.toLocaleString();
    if (document.getElementById('countLancer')) document.getElementById('countLancer').textContent = lanCount.toLocaleString();
    if (document.getElementById('countMarksman')) document.getElementById('countMarksman').textContent = markCount.toLocaleString();

    // Update Stacked Visual Distribution Bar Widths
    if (document.getElementById('barMarksman')) document.getElementById('barMarksman').style.width = `${markRatio * 100}%`;
    if (document.getElementById('barLancer')) document.getElementById('barLancer').style.width = `${lanRatio * 100}%`;
    if (document.getElementById('barInfantry')) document.getElementById('barInfantry').style.width = `${infRatio * 100}%`;

    // Frontline Trigger Requirement Evaluation (~5,000 Infantry baseline)
    const infStatus = document.getElementById('infantryTriggerStatus');
    if (infStatus) {
        if (infCount >= 5000) {
            infStatus.className = "text-xs font-bold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
            infStatus.innerHTML = '<i class="fa-solid fa-circle-check mr-1"></i> Frontline Trigger Met';
        } else {
            infStatus.className = "text-xs font-bold px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20";
            infStatus.innerHTML = '<i class="fa-solid fa-triangle-exclamation mr-1"></i> Below ~5k Baseline';
        }
    }

    // Joiner Skill 1 Stacking Logic (Cap +100%)
    let joinerBonus = 0;
    for (let i = 1; i <= 4; i++) {
        const joinerVal = parseFloat(document.getElementById(`joinerSkill${i}`)?.value || 0);
        joinerBonus += joinerVal;
    }
    const finalJoinerMultiplier = 1 + (Math.min(joinerBonus, 100) / 100);

    const joinerStackDisplay = document.getElementById('joinerStackDisplay');
    if (joinerStackDisplay) {
        joinerStackDisplay.textContent = `+${Math.min(joinerBonus, 100)}% (${finalJoinerMultiplier.toFixed(2)}x)`;
    }

    // PCB Crowding Engine Calculations: Damage scaling ~ sqrt(Troops)
    const infDmg = Math.sqrt(infCount) * 0.4;
    const lanDmg = Math.sqrt(lanCount) * 1.15;
    const markDmg = Math.sqrt(markCount) * 1.45;
    
    const baseDamageScore = Math.round((infDmg + lanDmg + markDmg) * 100 * finalJoinerMultiplier);

    const totalDmgDisplay = document.getElementById('estimatedBearDamage');
    if (totalDmgDisplay) {
        totalDmgDisplay.textContent = baseDamageScore.toLocaleString();
    }
}

/**
 * Preset Buttons Handler (Optimal, Balanced, Heavy Marksman)
 */
function setBearPreset(markPct, lanPct, infPct) {
    const markInput = document.getElementById('bearMarkRatio');
    const lanInput = document.getElementById('bearLanRatio');
    const infInput = document.getElementById('bearInfRatio');

    if (markInput) markInput.value = markPct;
    if (lanInput) lanInput.value = lanPct;
    if (infInput) infInput.value = infPct;

    // Trigger full calculation and visual bar update
    calculateBearMarch();
}
