// Whiteout Survivor Bear Trap Math & Radar Chart Engine

let bearRadarChart = null;

/**
 * Main Bear Trap March & Stat Calculator
 */
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
    const lethalityMetric = Math.min(100, Math.round((markRatio * 1.2 + lanRatio * 0.8) * 100));
    const attackMetric = Math.min(100, Math.round((markRatio * 1.0 + lanRatio * 0.9 + infRatio * 0.3) * 100));
    const crowdingEfficiency = Math.min(100, Math.round((1 - (infRatio * 0.6)) * 100));
    const frontlineScore = Math.min(100, Math.round((infCount / 5000) * 100));
    const damageMultiplierScore = Math.min(100, Math.round((finalJoinerMultiplier / 2.0) * 100));

    updateBearRadarChart([lethalityMetric, attackMetric, crowdingEfficiency, frontlineScore, damageMultiplierScore]);
}

/**
 * Initializes and updates the Chart.js Radar Chart
 */
function updateBearRadarChart(dataPoints) {
    const canvas = document.getElementById('bearRadarCanvas');
    if (!canvas) return;

    if (!bearRadarChart) {
        const ctx = canvas.getContext('2d');
        bearRadarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Lethality', 'Attack', 'Crowding Efficiency', 'Frontline Triggering', 'Damage Multiplier'],
                datasets: [{
                    label: 'Tactical Deployment Rating',
                    data: dataPoints,
                    backgroundColor: 'rgba(56, 189, 248, 0.2)',
                    borderColor: '#38bdf8',
                    pointBackgroundColor: '#38bdf8',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#38bdf8',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: {
                            color: '#94a3b8',
                            font: { size: 10, weight: 'bold' }
                        },
                        ticks: { display: false, max: 100, min: 0 }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    } else {
        bearRadarChart.data.datasets[0].data = dataPoints;
        bearRadarChart.update();
    }
}
