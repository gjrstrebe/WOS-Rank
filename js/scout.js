// Facility Scout Report Analyzer & AI Vision Integration

/**
 * Handles manual scout report parameter analysis
 */
function handleScoutReportAnalysis(event) {
    if (event) event.preventDefault();
    
    const facility = document.getElementById('scoutFacilityType')?.value || 'stronghold';
    const size = parseInt(document.getElementById('scoutGarrisonSize')?.value || 1000000);
    const inf = parseInt(document.getElementById('scoutInfPercent')?.value || 0);
    const lan = parseInt(document.getElementById('scoutLanPercent')?.value || 0);
    const mark = parseInt(document.getElementById('scoutMarkPercent')?.value || 0);

    if (inf + lan + mark !== 100) {
        showToast("Troop percentages must equal exactly 100%.", "warning");
        return;
    }

    const reportContainer = document.getElementById('scoutAnalysisReport');
    if (!reportContainer) return;

    let threatType = "Balanced Mix";
    let suggestion = "Balanced Layout (33% Inf, 33% Lan, 34% Mark)";
    let threatColor = "text-slate-200";

    if (inf > lan && inf > mark) {
        threatType = "Infantry Core Shields";
        suggestion = "🎯 Heavily stack Marksmen (60% Marksmen, 30% Lancers, 10% Infantry) to pierce their shields instantly.";
        threatColor = "text-sky-400";
    } else if (lan > inf && lan > mark) {
        threatType = "Lancer Heavy Strike Force";
        suggestion = "🛡️ Heavily stack Infantry (60% Infantry, 30% Marksmen, 10% Lancers) to absorb their charge.";
        threatColor = "text-amber-400";
    } else if (mark > inf && mark > lan) {
        threatType = "Marksmen Defense Line";
        suggestion = "🐎 Heavily stack Lancers (60% Lancers, 30% Infantry, 10% Marksmen) to flank their line.";
        threatColor = "text-emerald-400";
    }

    let thresholdMultiplier = 1.0;
    if (facility === 'fortress') thresholdMultiplier = 1.5;
    if (facility === 'castle') thresholdMultiplier = 2.5;

    const estimatedMinRallyPower = Math.round((size * 0.05) * thresholdMultiplier);

    reportContainer.innerHTML = `
        <div class="p-4 rounded-xl bg-slate-900 border border-brand-border space-y-3">
            <div class="flex items-center justify-between">
                <span class="text-xs text-slate-400 uppercase font-bold">Threat Assessment:</span>
                <span class="text-xs font-bold px-2.5 py-0.5 rounded bg-brand-danger/10 text-brand-danger border border-brand-danger/20">Danger Level High</span>
            </div>
            <div class="text-sm font-bold text-white flex items-center gap-2">
                <i class="fa-solid fa-triangle-exclamation text-brand-warning"></i>
                Primary Threat Array: <span class="${threatColor}">${threatType}</span>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed"><strong class="text-brand-success">Recommended Counter Ratio:</strong> <br>${suggestion}</p>
        </div>

        <div class="p-4 rounded-xl bg-slate-900 border border-brand-border space-y-2">
            <span class="text-xs text-slate-400 uppercase font-bold block">Safety Recommendation Formula</span>
            <div class="text-lg font-black text-emerald-400 font-mono">${estimatedMinRallyPower.toLocaleString()}M Total Rally Power</div>
            <p class="text-[10px] text-slate-500">Required safe operational target margin to breach without hitting alliance infantry limits.</p>
        </div>
    `;
    showToast("Scout report evaluated successfully!", "success");
}
