// Engine tests: node tests.cjs
const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const block = (a, b) => html.slice(html.indexOf(a), html.indexOf(b) + b.length);
const ctx = {};
vm.createContext(ctx);
vm.runInContext(block('/*ENGINE-START*/', '/*ENGINE-END*/') + block('/*CASES-START*/', '/*CASES-END*/') + block('/*DEMO-START*/', '/*DEMO-END*/') + block('/*QUIZ-START*/', '/*QUIZ-END*/') + block('/*MAP-START*/', '/*MAP-END*/') + ';this.VN=VN;this.casesList=casesList;this.DEMO_CASES=DEMO_CASES;this.QUIZ=QUIZ;this.VMAP=VMAP;this.rox=rox;', ctx);
const { VN, casesList, DEMO_CASES, QUIZ, VMAP, rox } = ctx;

let pass = 0, fail = 0;
function ok(cond, name) { if (cond) pass++; else { fail++; console.log('FAIL', name); } }
const near = (a, b, tol = 0.05) => Math.abs(a - b) <= tol;

const base = {
    age: 60, sex: 'male', height: 170, weight: 70, ind: [], cond: [], airway: 'ett',
    niv: { conscious: true, airwayProtect: true, secretionOk: true, hemoStable: true, aspiration: false, facial: false },
    gcs: 15, rass: 0, sedation: 'none', nmba: false, follows: true, drive: 'adequate', rrTotal: 16, rrSet: 12,
    spo2: 97, pao2: 100, fio2: 0.4, peep: 5, infiltrates: false, suspectArds: false, ph: 7.40, paco2: 40, hco3: 24,
    vt: 420, ppeak: 20, pplat: 15, totalPeep: 5, ti: 1, te: 3, flowBaseline: 'yes', sbp: 120, dbp: 70, map: null,
    vasopressor: false, shock: false, rvFailure: false, async: [], spec: [], brand: 'other', currentMode: 'vc_ac'
};
const P = o => Object.assign({}, base, o);
const A = o => VN.analyze(P(o));

// PBW
ok(near(VN.pbw('male', 170), 66.0, 0.05), 'PBW male 170 = 66.0');
ok(near(VN.pbw('female', 160), 52.4, 0.05), 'PBW female 160 = 52.4');
ok(VN.pbw('male', null) === null, 'PBW null height');
ok(VN.pbw('female', 100) === null, 'PBW negative → null');

// PEEP tables (ARDSNet)
let t = VN.peepTable(0.7, 'low'); ok(t.min === 10 && t.max === 14, 'low table FiO2 0.7 → 10–14');
t = VN.peepTable(0.5, 'low'); ok(t.min === 8 && t.max === 10, 'low table FiO2 0.5 → 8–10');
t = VN.peepTable(1.0, 'low'); ok(t.min === 18 && t.max === 24, 'low table FiO2 1.0 → 18–24');
t = VN.peepTable(0.3, 'high'); ok(t.min === 5 && t.max === 14, 'high table FiO2 0.3 → 5–14');
t = VN.peepTable(0.45, 'high'); ok(t.fio2 === 0.4 && t.min === 14 && t.max === 16, 'high table FiO2 0.45 → step 0.4 → 14–16');
t = VN.peepTable(0.7, 'high'); ok(t.min === 20 && t.max === 20, 'high table FiO2 0.7 → 20');
t = VN.peepTable(0.25, 'low'); ok(t.fio2 === 0.3, 'FiO2 below 0.3 uses first step');

// ABG
let g = VN.abg(7.31, 48, 24); ok(g.primary === 'respiratory_acidosis' && g.text.includes('急性'), 'acute resp acidosis');
g = VN.abg(7.35, 60, 32); ok(g.primary === 'compensated', 'pH 7.35 PaCO2 60 → compensated/normal-range');
g = VN.abg(7.30, 60, 29); ok(g.primary === 'respiratory_acidosis' && g.text.includes('慢性'), 'chronic resp acidosis');
g = VN.abg(7.05, 19, 5); ok(g.primary === 'mixed_acidosis' && g.text.includes('代償不足'), 'DKA PaCO2 above Winter → mixed');
g = VN.abg(7.25, 26, 11); ok(g.text.includes('代償適當'), 'Winter appropriate: 1.5*11+8=24.5±2');
g = VN.abg(7.50, 30, 23); ok(g.primary === 'respiratory_alkalosis', 'resp alkalosis');
g = VN.abg(7.40, 40, 15); ok(!g.consistent, 'inconsistent ABG detected');
g = VN.abg(7.20, 60, 22); ok(g.primary === 'mixed_acidosis', 'pH 7.20 PaCO2 60 HCO3 22 → mixed');

// Derived
let d = VN.derive(P({ pplat: 28, totalPeep: 10, vt: 420 }));
ok(d.dp === 18 && near(d.cstat, 23.3, 0.05), 'ΔP 18, Cstat 23.3');
d = VN.derive(P({ totalPeep: null, peep: 8, pplat: 25 }));
ok(d.dp === 17 && d.peepMeasured === false, 'ΔP falls back to set PEEP');
d = VN.derive(P({ peep: 5, totalPeep: 17 })); ok(d.autoPeep === 12, 'auto-PEEP = total − set');
d = VN.derive(P({ fio2: 70, pao2: 70 })); ok(near(d.pf, 100), 'FiO2 entered as % accepted');
d = VN.derive(P({ sbp: 120, dbp: 60, map: null })); ok(near(d.map, 80), 'MAP estimated');
d = VN.derive(P({ spo2: 99 })); ok(d.sf === null, 'S/F only when SpO2 ≤ 97');
d = VN.derive(P({ rrTotal: 24, rrSet: 16 })); ok(d.rrSpon === 8, 'spontaneous RR derived');

// ARDS classification
let r = A({ cond: ['ards'], infiltrates: true, pao2: 65, fio2: 0.7, peep: 10, totalPeep: 10, pplat: 28 });
ok(r.phenotype.ards && r.phenotype.ardsSeverity === 'severe', 'P/F 93 → severe ARDS');
r = A({ cond: ['ards'], infiltrates: true, pao2: 75, fio2: 0.5 });
ok(r.phenotype.ardsSeverity === 'moderate', 'P/F 150 → moderate');
r = A({ cond: ['ards'], infiltrates: true, pao2: 120, fio2: 0.5 });
ok(r.phenotype.ardsSeverity === 'mild', 'P/F 240 → mild');
r = A({ cond: ['ards'], infiltrates: false, pao2: 65, fio2: 0.7 });
ok(!r.phenotype.ards && r.alerts.some(a => a.title.includes('尚未符合')), 'ARDS without infiltrates not classified, flagged');
r = A({ cond: ['ards'], infiltrates: true, pao2: null, spo2: 90, fio2: 0.6 });
ok(r.phenotype.ardsSeverity === 'severe' || r.phenotype.ardsSeverity === 'moderate', 'S/F used when no PaO2 (S/F 150 → moderate)');
ok(r.phenotype.ardsSeverity === 'moderate', 'S/F 150 → moderate');

// Mode selection
r = A({ drive: 'none', sedation: 'deep', rass: -5 }); ok(r.mode.key === 'vc_ac', 'apneic → VC-A/C');
ok(r.lessSuitable.some(x => x.key === 'psv'), 'apneic → PSV less suitable');
r = A({ nmba: true }); ok(r.mode.key === 'vc_ac', 'NMBA → controlled');
r = A({}); ok(r.mode.key === 'psv' && r.phenotype.sbtReady, 'stable adequate drive → PSV/SBT');
r = A({ fio2: 0.6, pao2: 120 }); ok(r.mode.key !== 'psv' && r.phenotype.sbtBlockers.some(b => b.includes('FiO₂')), 'FiO2 0.6 blocks SBT');
r = A({ vasopressor: true }); ok(!r.phenotype.sbtReady, 'vasopressor blocks SBT');
r = A({ drive: 'weak' }); ok(r.mode.key === 'prvc' || r.mode.key === 'vc_ac', 'weak drive → A/C');
ok(r.lessSuitable.some(x => x.key === 'psv'), 'weak drive → PSV less suitable');
r = A({ drive: 'excessive', cond: ['ards'], infiltrates: true, pao2: 80, fio2: 0.5 });
ok(r.mode.key === 'pc_ac' && r.alerts.some(a => a.title.includes('P-SILI')), 'high drive ARDS → PC-A/C + P-SILI alert');
r = A({ cond: ['copd_exacerbation'], peep: 5, totalPeep: 15, flowBaseline: 'no', ph: 7.28, paco2: 65, hco3: 30 });
ok(r.mode.key === 'vc_ac' && r.phenotype.hyperinflation, 'COPD auto-PEEP → VC-A/C');
ok(r.lessSuitable.some(x => x.key === 'aprv'), 'COPD → APRV less suitable');
const rrRow = r.params.find(x => x[0].startsWith('Respiratory Rate'));
ok(rrRow && rrRow[1].startsWith('10–14'), 'COPD RR 10–14 (not 20–24)');
const peepRow = r.params.find(x => x[0] === 'PEEP');
ok(peepRow && peepRow[1].includes('8 cmH₂O'), 'COPD PEEP up to 80% of auto-PEEP (10 → 8)');
r = A({ cond: ['severe_asthma'], drive: 'none', sedation: 'deep' });
ok(r.params.find(x => x[0].startsWith('Respiratory Rate'))[1].startsWith('8–12'), 'asthma RR 8–12');
ok(r.params.find(x => x[0].startsWith('Inspiratory Flow'))[1].includes('1:4'), 'asthma I:E 1:4');

// Non-invasive
r = A({ airway: 'niv_mask', cond: ['cardiogenic_edema'] }); ok(r.mode.key === 'niv', 'edema on NIV → NIV');
r = A({ airway: 'niv_mask', cond: ['copd_exacerbation'], ph: 7.28, paco2: 65, hco3: 30 }); ok(r.mode.key === 'niv', 'hypercapnic COPD → NIV');
r = A({ airway: 'hfnc', pao2: 70, fio2: 0.6 }); ok(r.mode.key === 'hfnc', 'hypoxemic non-hypercapnic → HFNC');
r = A({ airway: 'niv_mask', niv: { conscious: false, airwayProtect: true, secretionOk: true, hemoStable: true } });
ok(r.mode.key === 'intubate' && r.alerts[0].level === 'danger', 'NIV contraindication → intubate');
r = A({ airway: 'hfnc', shock: true }); ok(r.mode.key === 'intubate', 'shock non-invasive → intubate');
r = A({ airway: 'none', gcs: 7 }); ok(r.mode.key === 'intubate', 'GCS 7 not intubated → intubate');

// Metabolic acidosis
r = A({ ph: 7.05, paco2: 19, hco3: 5, drive: 'none', sedation: 'deep' });
ok(r.phenotype.metAcidosis, 'severe metabolic acidosis detected');
ok(r.alerts.some(a => a.title.includes('勿降低分鐘通氣量')), 'acidosis alert');
ok(r.params.find(x => x[0].startsWith('Respiratory Rate'))[1].startsWith('24–35'), 'acidosis RR 24–35');
ok(r.modules.some(m => m.title.includes('代謝性酸中毒')), 'acidosis module');

// Alerts & dashboard
r = A({ pplat: 32, totalPeep: 10 }); ok(r.alerts.some(a => a.title.includes('平台壓')) && r.alerts.some(a => a.title.includes('驅動壓')), 'Pplat>30 and ΔP>14 alerts');
ok(r.alerts[0].level === 'danger', 'danger alerts sorted first');
r = A({ vt: 600, cond: ['ards'], infiltrates: true, pao2: 120, fio2: 0.5 }); ok(r.alerts.some(a => a.title.includes('潮氣量偏高') && a.level === 'danger'), 'VT 9 mL/kg in ARDS → danger');
r = A({ ppeak: 42, pplat: 20 }); ok(r.alerts.some(a => a.title.includes('氣道阻力')), 'Ppeak−Pplat 22 → resistance alert');
r = A({ ppeak: 20, pplat: 25 }); ok(r.alerts.some(a => a.title.includes('P<sub>plat</sub> > P<sub>peak</sub>')), 'Pplat > Ppeak data check');
r = A({ peep: 5, totalPeep: 15, flowBaseline: 'no', shock: true, sbp: 80, dbp: 45 });
ok(r.alerts.some(a => a.title.includes('動態過度充氣') && a.level === 'danger'), 'hyperinflation + shock → danger (disconnect)');
r = A({ spec: ['tbi'], paco2: 30, ph: 7.48, hco3: 22 }); ok(r.alerts.some(a => a.title.includes('顱腦損傷')), 'TBI PaCO2 30 alert');
r = A({ spec: ['ecmo'], pplat: 27, totalPeep: 12 }); ok(r.mode.key === 'pc_ac' && r.alerts.some(a => a.title.includes('> 25')), 'ECMO Pplat >25 alert');
r = A({ spec: ['pneumothorax'] }); ok(r.alerts.some(a => a.title === '氣胸'), 'pneumothorax alert');
r = A({});
ok(r.dashboard.length === 8, 'dashboard has 8 cards');
ok(r.dashboard.find(c => c.label.includes('plat')).value === '15 cmH₂O', 'dashboard Pplat uses input (not hardcoded 28)');
r = A({ pplat: null }); ok(r.dashboard.find(c => c.label.includes('plat')).level === 'na', 'missing Pplat → N/A');

// ARDS params
r = A({ cond: ['ards'], infiltrates: true, pao2: 65, fio2: 0.7, peep: 10, totalPeep: 10, pplat: 28, drive: 'none', sedation: 'deep' });
const ardsPeep = r.params.find(x => x[0] === 'PEEP');
ok(ardsPeep[1].includes('20') && ardsPeep[1].includes('Higher'), 'severe ARDS FiO2 0.7 → Higher PEEP table 20');
ok(r.params.find(x => x[0] === 'V<sub>T</sub>')[1].includes('396 mL'), 'VT 6 mL/kg = 396 mL');
ok(r.modules.some(m => m.title.includes('ARDS') && m.items.some(i => i.includes('俯臥'))), 'ARDS module recommends prone');
r = A({ cond: ['ards'], infiltrates: true, pao2: 120, fio2: 0.5 });
ok(r.params.find(x => x[0] === 'PEEP')[1].includes('Lower'), 'mild ARDS → Lower PEEP table');

// Summary / trace never empty
r = A({});
ok(r.trace.length === 5 && r.trace.every(x => x.text), 'trace has 5 steps');
ok(r.summary.problem && r.summary.text, 'summary filled');
ok(VN.analyze(P({ height: 170, weight: null, pao2: null, fio2: null, ph: null, paco2: null, hco3: null, vt: null, ppeak: null, pplat: null, totalPeep: null })).dashboard.length === 8, 'sparse input does not throw');

// Teaching cases: engine recommendation must be best or acceptable
casesList.forEach(c => {
    const res = VN.analyze(P(c.inputs));
    ok(c.best.concat(c.ok).includes(res.mode.key), `${c.title}: engine ${res.mode.key} ∈ best/ok`);
    ok(VN.abg(c.inputs.ph, c.inputs.paco2, c.inputs.hco3).consistent, `${c.title}: ABG internally consistent`);
});
const c6 = VN.analyze(P(casesList[5].inputs)); ok(c6.alerts.some(a => a.title.includes('代謝性酸中毒')), 'Case 6 acidosis alert');
const c9 = VN.analyze(P(casesList[8].inputs)); ok(c9.alerts.some(a => a.title.includes('氣道阻力')), 'Case 9 resistance alert');
const c4 = VN.analyze(P(casesList[3].inputs)); ok(c4.modules.some(m => m.title.includes('SBT')), 'Case 4 SBT module');

// Demo cases: every stage goes through the engine
ok(DEMO_CASES.length === 6, '6 demo cases');
DEMO_CASES.forEach(c => {
    ok(c.stages.length >= 2 && c.trap.length && c.src, `${c.title}: has stages, traps, sources`);
    c.stages.forEach((s, i) => {
        const res = VN.analyze(s.inputs);
        ok(res.mode.key === s.expect, `${c.title} stage ${i + 1}: engine ${res.mode.key} = ${s.expect}`);
        ok(VN.abg(s.inputs.ph, s.inputs.paco2, s.inputs.hco3).consistent, `${c.title} stage ${i + 1}: ABG consistent`);
        ok(s.steps.length >= 3, `${c.title} stage ${i + 1}: has steps`);
    });
});
const dS = (c, s) => VN.analyze(DEMO_CASES[c - 1].stages[s - 1].inputs);
// Numbers quoted in the case text
ok(near(rox(93, 0.6, 30), 5.17, 0.01) && near(rox(90, 0.8, 36), 3.13, 0.01), 'ROX 5.17 and 3.13');
ok(near(dS(1, 1).derived.pbw, 64.2, 0.05) && Math.round(dS(1, 1).derived.pbw * 6) === 385, 'Case 1 PBW 64, 6 mL/kg = 385');
{ const w = VN.abg(7.30, 38, 18); ok(w.winter[0] === 33 && w.winter[1] === 37 && w.primary === 'mixed_acidosis', "Case 1 Winter's 33–37, PaCO2 38 above it"); }
ok(dS(2, 3).derived.autoPeep === 7 && dS(2, 3).alerts.some(a => a.title.includes('動態過度充氣') && a.level === 'danger'), 'Case 2 Auto-PEEP 7 + hypotension → danger');
ok(near(dS(3, 1).derived.vtPbw, 9.5, 0.05) && near(500 / 118, 4.2, 0.05), 'Case 3 V_T 500 = 9.5 PBW, 4.2 actual');
ok(Math.round(dS(3, 1).derived.pbw * 6) === 314, 'Case 3 6 mL/kg = 314');
ok(dS(3, 2).derived.dp === 15 && near(dS(3, 2).derived.pf, 140, 0.01), 'Case 3 ΔP 15, P/F 140');
ok(dS(4, 1).alerts.some(a => a.title.includes('顱腦損傷')) && !dS(4, 2).alerts.some(a => a.title.includes('顱腦損傷')), 'Case 4 TBI alert clears at PaCO2 42');
ok(dS(4, 2).derived.vtPbw.toFixed(1) === '6.5', 'Case 4 V_T 6.5 mL/kg');
ok(near(dS(5, 1).derived.vtPbw, 10.4, 0.05) && dS(5, 1).derived.autoPeep === 6, 'Case 5 V_T 10.4, Auto-PEEP 6');
ok(dS(5, 1).alternatives.some(x => x.key === 'psv'), 'Case 5 PSV listed as alternative');
ok(near(dS(5, 2).derived.vtPbw, 6.5, 0.05) && dS(5, 2).phenotype.sbtReady, 'Case 5 V_T 6.5, SBT ready');
ok(dS(6, 1).params.find(x => x[0] === 'PEEP')[1].includes('20–22'), 'Case 6 Higher PEEP table FiO2 0.8 → 20–22');
ok(near(dS(6, 2).derived.pf, 70, 0.01), 'Case 6 P/F 70');
ok(near(dS(6, 3).derived.vtPbw, 3.3, 0.05) && near(dS(6, 3).derived.pf, 195, 0.01), 'Case 6 V_T 3.3, P/F 195');

// Quiz structure
ok(QUIZ.length === 20 && QUIZ.filter(q => q.l === 'basic').length === 10 && QUIZ.filter(q => q.l === 'adv').length === 10, '20 questions, 10 + 10');
[0, 1, 2, 3].forEach(k => ok(QUIZ.filter(q => q.a === k).length === 5, `answer ${'ABCD'[k]} used 5 times`));
QUIZ.forEach((q, i) => ok(q.o.length === 4 && new Set(q.o).size === 4 && q.a >= 0 && q.a < 4 && q.x && q.src, `Q${i + 1} well-formed`));
// Quiz calculations
ok(Math.round(VN.pbw('male', 175) * 6) === 423, 'Q1 PBW 175 cm → 423 mL');
{ const d = VN.derive(P({ vt: 420, pplat: 28, totalPeep: 10 })); ok(d.dp === 18 && near(d.cstat, 23.3, 0.05), 'Q3 ΔP 18, Cstat 23'); }
ok(near(rox(90, 0.8, 36), 3.13, 0.01), 'Q9 ROX 3.13');
ok(VN.derive(P({ peep: 5, totalPeep: 15 })).autoPeep === 10, 'Q10 Auto-PEEP 10');
ok(near(0.75 * 15, 11.25) && near((20 - 8) + (2 / 3) * 15, 22), 'Q11 Pmus 11.25, ΔPL,dyn 22');
ok(32 - 22 === 10 && 12 - 18 === -6, 'Q14 PL 10 and −6');
{ const vt = VN.pbw('male', 175) * 8; ok(Math.round(vt) === 565 && Math.round(18000 / vt) === 32, 'Q17 V_T 565, RR 32');
  const w = VN.abg(7.05, 19, 5).winter; ok(w[0] === 13.5 && w[1] === 17.5, "Q17 Winter's 13.5–17.5"); }
{ const te = (rr, lps) => 60 / rr - 0.45 / lps; ok(near(te(20, 100 / 60) - te(20, 1), 0.18, 0.005) && near(te(14, 1) - te(20, 1), 1.29, 0.005), 'Q18 Te gain +0.18 vs +1.29'); }

// ROX cutoffs in the engine's HFNC row match Roca 2019 and the teaching tabs
{ const row = A({ airway: 'hfnc', pao2: 70, fio2: 0.6 }).params.find(x => x[0].startsWith('FiO₂')); ok(row[2].includes('< 2.85、< 3.47、< 3.85') && row[2].includes('≥ 4.88'), 'HFNC row ROX cutoffs'); }

// Mind map
ok(VMAP.dx.length === 6 && VMAP.tx.length === 7 && VMAP.dx.concat(VMAP.tx).every(b => b.t && b.s && b.l.length >= 3), 'map branches complete');

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
