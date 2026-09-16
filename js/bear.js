// Whiteout Survivor Bear Trap Math & Native SVG Radar Engine

function calculateBearMarch() {
    const totalCapacity = parseInt(document.getElementById('bearMarchCapacity')?.value || 150000);
    const infRatio = parseInt(document.getElementById('bearInfRatio')?.value || 10) / 100;
    const lanRatio = parseInt(document.getElementById('bearLanRatio')?.value || 30) / 100;
    const markRatio = parseInt(document.getElementById('bearMarkRatio')?.value || 60) / 100;

    // Troop Counts
    const infCount = Math.round(totalCapacity * infRatio);
    const lanCount = Math.round(totalCapacity * lanRatio);
    const markCount = Math.round(totalCapacity * markRatio);

    // Update Numerical Count Displays
    if (document.getElementById('countInfantry')) document.getElementById('countInfantry').textContent = infCount.toLocaleString();
    if (document.getElementById('countLancer')) document.getElementById('countLancer').textContent = lanCount.toLocaleString();
    if (document.getElementById('countMarksman')) document.getElementById('countMarksman').textContent = markCount.toLocaleString();

    // Update Stacked Distribution Bar Widths
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

    // Crowding Engine Calculations: Damage scaling ~ sqrt(Troops)
    const infDmg = Math.sqrt(infCount) * 0.4;
    const lanDmg = Math.sqrt(lanCount) * 1.15;
    const markDmg = Math.sqrt(markCount) * 1.45;
    
    const baseDamageScore = Math.round((infDmg + lanDmg + markDmg) * 100 * finalJoinerMultiplier);

    const totalDmgDisplay = document.getElementById('estimatedBearDamage');
    if (totalDmgDisplay) {
        totalDmgDisplay.textContent = baseDamageScore.toLocaleString();
    }

    // Radar Chart Metric Scaling (0 - 100 scale)
    const lethality = Math.min(100, Math.round((markRatio * 1.2 + lanRatio * 0.8) * 100));
    const attack = Math.min(100, Math.round((markRatio * 1.0 + lanRatio * 0.9 + infRatio * 0.3) * 100));
    const crowding = Math.min(100, Math.round((1 - (infRatio * 0.6)) * 100));
    const frontline = Math.min(100, Math.round((infCount / 5000) * 100));
    const multiplier = Math.min(100, Math.round((finalJoinerMultiplier / 2.0) * 100));

    updateNativeSvgRadar(lethality, attack, crowding, frontline, multiplier);
}

function updateNativeSvgRadar(lethality, attack, crowding, frontline, multiplier) {
    const polygon = document.getElementById('radarPolygon');
    if (!polygon) return;

    const angles = [
        -Math.PI / 2, 
        -Math.PI / 2 + (2 * Math.PI / 5),
        -Math.PI / 2 + (4 * Math.PI / 5),
        -Math.PI / 2 + (6 * Math.PI / 5),
        -Math.PI / 2 + (8 * Math.PI / 5)
    ];

    const center = 100;
    const maxRadius = 75;
    const values = [lethality, attack, crowding, frontline, multiplier];

    const points = values.map((val, idx) => {
        const r = (val / 100) * maxRadius;
        const x = center + r * Math.cos(angles[idx]);
        const y = center + r * Math.sin(angles[idx]);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    polygon.setAttribute('points', points);
}
