import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import process from "node:process";
import { v5 as uuidv5 } from "uuid";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// dist/*.js lives in docs/palms/dist → go up one to reach docs/palms
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = process.env.PALMS_OUT_DIR ? path.resolve(ROOT, process.env.PALMS_OUT_DIR) : ROOT;
const DATA_DIR = process.env.PALMS_DATA_DIR ? path.resolve(ROOT, process.env.PALMS_DATA_DIR) : path.join(ROOT, "data");
// NEW
//const ROOT = process.cwd();
//const OUT_DIR = process.env.PALMS_OUT_DIR ? path.resolve(ROOT, process.env.PALMS_OUT_DIR) : ROOT;
//const DATA_DIR = process.env.PALMS_DATA_DIR ? path.resolve(ROOT, process.env.PALMS_DATA_DIR) : path.join(ROOT, "data");
function readJSON(p) {
    return JSON.parse(fs.readFileSync(p, "utf-8"));
}
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function writeFile(p, content) { ensureDir(path.dirname(p)); fs.writeFileSync(p, content, "utf-8"); }
function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function fm(meta) {
    const j = JSON.stringify(meta, null, 2);
    return `---\n${j}\n---`;
}
function mdTable(headers, rows) {
    const head = `| ${headers.join(" | ")} |`;
    const sep = `|${headers.map(() => " --- ").join("|")}|`;
    const body = rows.map(r => `| ${r.map(v => v == null ? "" : String(v)).join(" | ")} |`).join("\n");
    return `${head}\n${sep}\n${body}\n`;
}
function nowIso() { return new Date().toISOString(); }
function detUuid(namespace, ...parts) { return uuidv5(parts.join("::"), namespace); }
function loadConfig() {
    const cfgPath = path.join(ROOT, "palms.config.json");
    const cfg = readJSON(cfgPath);
    return cfg;
}
function loadStates() {
    const p = path.join(DATA_DIR, "workflow-states.json");
    return readJSON(p);
}
function listSpecs() {
    return fs.readdirSync(DATA_DIR)
        .filter(f => f.endsWith(".json") && f !== "workflow-states.json")
        .map(f => path.join(DATA_DIR, f));
}
function validate(spec, states) {
    const ids = (arr) => new Set(arr.map(x => x.id).filter(Boolean));
    const must = (cond, msg) => { if (!cond)
        throw new Error(`Spec invalid: ${msg}`); };
    // fill missing IDs deterministically prior to validation
    // (done outside in materializeIds)
    // existence maps
    const modelIds = ids(spec.models);
    const lifecycleIds = ids(spec.lifecycles);
    const phaseIds = ids(spec.lifecyclePhases);
    const wfIds = ids(spec.workflows);
    const stepIds = ids(spec.workflowSteps);
    const gateIds = ids(spec.phaseGates);
    const stateIds = new Set(states.map(s => s.id));
    // Model -> states valid
    for (const m of spec.models) {
        for (const sid of m.workflowStates ?? []) {
            must(stateIds.has(sid), `Model '${m.name}' references missing WorkflowState ID=${sid}`);
        }
    }
    // Lifecycle.modelIds exist
    for (const l of spec.lifecycles) {
        for (const mid of l.modelIds) {
            must(modelIds.has(mid), `Lifecycle '${l.name}' references missing Model ID=${mid}`);
        }
    }
    // Phase lifecycle and order uniqueness (1..n, no duplicates per lifecycle)
    {
        const key = (lifecycleId) => spec.lifecyclePhases.filter(p => p.lifecycleId === lifecycleId);
        for (const l of spec.lifecycles) {
            const phases = key(l.id);
            must(phases.length > 0, `Lifecycle '${l.name}' must have ≥1 phase`);
            const orders = new Set(phases.map(p => p.order));
            must(orders.size === phases.length, `Lifecycle '${l.name}' has duplicate PhaseOrder`);
            for (const p of phases) {
                must(p.order > 0, `Lifecycle '${l.name}' has non-positive PhaseOrder`);
            }
        }
    }
    // Workflow linked 1:1 to phase
    for (const w of spec.workflows) {
        must(phaseIds.has(w.phaseId), `Workflow '${w.name}' references missing Phase ID=${w.phaseId}`);
        const others = spec.workflows.filter(x => x.phaseId === w.phaseId);
        must(others.length === 1, `Phase ID=${w.phaseId} must pair with exactly 1 workflow (found ${others.length})`);
    }
    // Steps: belong to exactly one workflow, order unique & >0
    {
        const stepsByWf = new Map();
        for (const s of spec.workflowSteps) {
            must(wfIds.has(s.workflowId), `Step '${s.name}' references missing Workflow ID=${s.workflowId}`);
            if (!stepsByWf.has(s.workflowId))
                stepsByWf.set(s.workflowId, []);
            stepsByWf.get(s.workflowId).push({ order: s.order, id: s.id, name: s.name });
        }
        for (const [wf, arr] of stepsByWf.entries()) {
            const orders = new Set(arr.map(x => x.order));
            must(orders.size === arr.length, `Workflow ${wf} has duplicate StepOrder`);
            for (const x of arr)
                must(x.order > 0, `Workflow ${wf} has non-positive StepOrder`);
        }
    }
    // Phase gates anchor to existing phases; step gates to existing steps
    for (const pg of spec.lifecyclePhaseGates) {
        must(phaseIds.has(pg.phaseId), `LifecyclePhaseGate references missing Phase ID=${pg.phaseId}`);
        must(gateIds.has(pg.gateId), `LifecyclePhaseGate references missing Gate ID=${pg.gateId}`);
    }
    for (const sg of spec.workflowStepGates) {
        must(stepIds.has(sg.stepId), `WorkflowStepGate references missing Step ID=${sg.stepId}`);
        must(gateIds.has(sg.gateId), `WorkflowStepGate references missing Gate ID=${sg.gateId}`);
    }
    // Gate transitions: at least one per gate; absolute vs relative target correctness; exactly one default per gate
    {
        const byGate = new Map();
        for (const t of spec.gateTransitions) {
            if (!byGate.has(t.gateId))
                byGate.set(t.gateId, []);
            byGate.get(t.gateId).push(t);
        }
        for (const g of spec.phaseGates) {
            const arr = byGate.get(g.id) ?? [];
            must(arr.length > 0, `PhaseGate '${g.name}' must have ≥1 transition`);
            const defaults = arr.filter(x => x.isDefault);
            must(defaults.length === 1, `PhaseGate '${g.name}' must have exactly 1 default transition (found ${defaults.length})`);
            for (const t of arr) {
                if (t.mode === "Relative") {
                    if (!t.relativeKind)
                        throw new Error(`GateTransition '${t.name}': Relative requires relativeKind`);
                    if (t.targetPhaseId || t.targetStepId)
                        throw new Error(`GateTransition '${t.name}': Relative must not set absolute targets`);
                }
                else {
                    const setCount = Number(!!t.targetPhaseId) + Number(!!t.targetStepId);
                    must(setCount === 1, `GateTransition '${t.name}': Absolute must set exactly one of targetPhaseId or targetStepId`);
                    if (t.targetPhaseId)
                        must(phaseIds.has(t.targetPhaseId), `GateTransition '${t.name}' targets missing Phase`);
                    if (t.targetStepId)
                        must(stepIds.has(t.targetStepId), `GateTransition '${t.name}' targets missing Step`);
                }
            }
        }
    }
}
function applyDeterministicIds(cfg, spec) {
    const ns = cfg.namespaceUUID;
    const assign = (id, type, name, parent) => id ?? detUuid(ns, type, parent ?? "", name);
    spec.palm.id = assign(spec.palm.id, "PaLM", spec.palm.name);
    for (const m of spec.models)
        m.id = assign(m.id, "Model", m.name, spec.palm.id);
    for (const l of spec.lifecycles)
        l.id = assign(l.id, "Lifecycle", l.name, JSON.stringify(l.modelIds.sort()));
    for (const p of spec.lifecyclePhases)
        p.id = assign(p.id, "LifecyclePhase", p.name, p.lifecycleId);
    for (const w of spec.workflows)
        w.id = assign(w.id, "Workflow", w.name, w.phaseId);
    for (const s of spec.workflowSteps)
        s.id = assign(s.id, "WorkflowStep", s.name, s.workflowId);
    for (const g of spec.phaseGates)
        g.id = assign(g.id, "PhaseGate", g.name);
    for (const t of spec.gateTransitions)
        t.id = assign(t.id, "GateTransition", t.name, t.gateId);
}
function page(meta, relations, shorthand, children, storage) {
    return `${fm({
        type: meta.type,
        id: meta.id,
        name: meta.name,
        slug: meta.slug,
        parentIds: meta.parentIds ?? [],
        storage,
        generatedAt: nowIso()
    })}
# ${meta.type}: ${meta.name} (${meta.id})

> **Relation ↔ Mapping**
${relations.map(r => `> - ${r}`).join("\n")}

> **Storage Plans**
> 1. **Root GitHub:** [${storage.rootGitHub}](${storage.rootGitHub})
> 2. **Root Web Tree (GitHub):** [${storage.rootWebTree}](${storage.rootWebTree})
> 3. **Raw Prefix:** [${storage.rawPrefix}](${storage.rawPrefix})
> 4. **Root Documents (GitHub):** \`${storage.documentsRoot}\`
> 5. **Root Camera (GitHub):** \`${storage.cameraRoot}\`
> 6. **File Content Path:** \`${storage.fileContentPath}\`
> 7. **File Local Path:** \`${storage.filePath}\`

## Junction shorthand (local view)
\`\`\`plaintext
${shorthand}
\`\`\`

## Children
${children.length ? children.map(c => `- [${c.label}](${c.href})`).join("\n") : "_(none)_"}
`;
}
function indexPage(cfg, palm, models, lifecycles, storage) {
    const mList = models.map(m => `- [${m.name}](./models/${m.slug}-${m.id}.md)`).join("\n");
    const lList = lifecycles.map(l => `- [${l.name}](./lifecycles/${l.slug}-${l.id}.md)`).join("\n");
    return `${cfg.indexHeader}

${fm({
        type: "PaLM",
        id: palm.id,
        name: palm.name,
        slug: palm.slug,
        storage,
        generatedAt: nowIso()
    })}
# ${palm.name} (${palm.id})

> **Relation ↔ Mapping**
> - PaLM{} ↔◼↔ Model (◼=PaLMModel)  [≥1 Model/PaLM via policy]
> - Model ↔◼↔ WorkflowState (◼=ModelWorkflowState, INT)  [≥1 State/Model]
> - Model ↔◼↔ Lifecycle (◼=ModelLifecycle)
> - Lifecycle →◼+← LifecyclePhase (◼=LifecycleLifecyclePhase, UQ PhaseID; PhaseOrder)
> - LifecyclePhase ↔◼1↔ Workflow (◼=LifecyclePhaseWorkflow, UQ both)
> - Workflow →◼+← WorkflowStep (◼=WorkflowWorkflowStep, UQ StepID; StepOrder)
> - LifecyclePhase ↔◼↔ PhaseGate (◼=LifecyclePhaseGate)
> - WorkflowStep ↔◼↔ PhaseGate (◼=WorkflowStepGate [Placement])
> - PhaseGate →◼+← GateTransition (◼=PhaseGateTransition; Mode=Absolute|Relative)

## Index

### Models
${mList || "_(none)_"}

### Lifecycles
${lList || "_(none)_"}

### Workflow States (snapshot)
See: [/docs/palms/${palm.slug}-${palm.id}/tables/workflow-states.md](/docs/palms/${palm.slug}-${palm.id}/tables/workflow-states.md)
`;
}
async function run() {
    const cfg = loadConfig();
    const states = loadStates();
    const specs = listSpecs();
    for (const specPath of specs) {
        const spec = readJSON(specPath);
        applyDeterministicIds(cfg, spec);
        validate(spec, states);
        const palmId = spec.palm.id;
        const palmName = spec.palm.name;
        const palmSlug = spec.palm.slug ?? slug(palmName);
        const base = path.join(OUT_DIR, `${palmSlug}-${palmId}`);
        // Index and snapshot table
        const models = spec.models.map(m => ({ id: m.id, name: m.name, slug: slug(m.name) }));
        const lifecycles = spec.lifecycles.map(l => ({ id: l.id, name: l.name, slug: slug(l.name) }));
        writeFile(path.join(base, "README.md"), indexPage(cfg, { id: palmId, name: palmName, slug: palmSlug }, models, lifecycles, cfg.storage));
        const wsTable = mdTable(["ID", "Workflow State", "Description"], states.map(s => [s.id, s.name, s.description]));
        writeFile(path.join(base, "tables", "workflow-states.md"), `# Workflow States\n\n${wsTable}`);
        // Model pages
        for (const m of spec.models) {
            const mSlug = slug(m.name);
            const rels = [
                "PaLM{} ↔◼↔ Model  (◼=PaLMModel)",
                `Model ↔◼↔ WorkflowState (◼=ModelWorkflowState): ${(m.workflowStates ?? []).map(id => states.find(s => s.id === id)?.name).filter(Boolean).join(", ") || "(none)"}`,
                "Model ↔◼↔ Lifecycle (◼=ModelLifecycle)"
            ];
            const shorthand = `PaLM{} ↔◼↔ Model\nModel ↔◼↔ WorkflowState\nModel ↔◼↔ Lifecycle`;
            const children = [];
            for (const l of spec.lifecycles.filter(x => x.modelIds.includes(m.id))) {
                children.push({ label: `Lifecycle: ${l.name}`, href: `/docs/palms/${palmSlug}-${palmId}/lifecycles/${slug(l.name)}-${l.id}.md` });
            }
            writeFile(path.join(base, "models", `${mSlug}-${m.id}.md`), page({ type: "Model", id: m.id, name: m.name, slug: mSlug }, rels, shorthand, children, cfg.storage));
        }
        // Lifecycle pages
        for (const l of spec.lifecycles) {
            const lSlug = slug(l.name);
            const phases = spec.lifecyclePhases.filter(p => p.lifecycleId === l.id).sort((a, b) => a.order - b.order);
            const rels = [
                "Model ↔◼↔ Lifecycle (◼=ModelLifecycle)",
                `Lifecycle →◼+← LifecyclePhase (◼=LifecycleLifecyclePhase) [orders: ${phases.map(p => p.order).join(", ")}]`
            ];
            const shorthand = `Model ↔◼↔ Lifecycle\nLifecycle →◼+← LifecyclePhase`;
            const children = phases.map(ph => ({
                label: `${String(ph.order).padStart(2, "0")}. ${ph.name}`,
                href: `/docs/palms/${palmSlug}-${palmId}/phases/${String(ph.order).padStart(2, "0")}-${slug(ph.name)}-${ph.id}.md`
            }));
            writeFile(path.join(base, "lifecycles", `${lSlug}-${l.id}.md`), page({ type: "Lifecycle", id: l.id, name: l.name, slug: lSlug }, rels, shorthand, children, cfg.storage));
        }
        // Phase pages
        for (const ph of spec.lifecyclePhases) {
            const phSlug = slug(ph.name);
            const wf = spec.workflows.find(w => w.phaseId === ph.id);
            const gatesAtPhase = spec.lifecyclePhaseGates.filter(x => x.phaseId === ph.id).map(x => spec.phaseGates.find(g => g.id === x.gateId));
            const rels = [
                `Lifecycle →◼+← LifecyclePhase (◼=LifecycleLifecyclePhase) [PhaseOrder=${ph.order}]`,
                `LifecyclePhase ↔◼1↔ Workflow (◼=LifecyclePhaseWorkflow) → ${wf?.name ?? "(missing)"}`,
                `LifecyclePhase ↔◼↔ PhaseGate (◼=LifecyclePhaseGate) → ${gatesAtPhase.map(g => g.name).join(", ") || "(none)"}`
            ];
            const shorthand = `Lifecycle →◼+← LifecyclePhase\nLifecyclePhase ↔◼1↔ Workflow\nLifecyclePhase ↔◼↔ PhaseGate`;
            const children = [];
            if (wf)
                children.push({ label: `Workflow: ${wf.name}`, href: `/docs/palms/${palmSlug}-${palmId}/workflows/${slug(wf.name)}-${wf.id}.md` });
            for (const g of gatesAtPhase)
                children.push({ label: `Gate: ${g.name}`, href: `/docs/palms/${palmSlug}-${palmId}/gates/${slug(g.name)}-${g.id}.md` });
            writeFile(path.join(base, "phases", `${String(ph.order).padStart(2, "0")}-${phSlug}-${ph.id}.md`), page({ type: "LifecyclePhase", id: ph.id, name: ph.name, slug: phSlug }, rels, shorthand, children, cfg.storage));
        }
        // Workflow pages
        for (const w of spec.workflows) {
            const wSlug = slug(w.name);
            const steps = spec.workflowSteps.filter(s => s.workflowId === w.id).sort((a, b) => a.order - b.order);
            const rels = [
                "LifecyclePhase ↔◼1↔ Workflow (◼=LifecyclePhaseWorkflow)",
                `Workflow →◼+← WorkflowStep (◼=WorkflowWorkflowStep) [orders: ${steps.map(s => s.order).join(", ")}]`
            ];
            const shorthand = `LifecyclePhase ↔◼1↔ Workflow\nWorkflow →◼+← WorkflowStep`;
            const children = steps.map(s => ({
                label: `${String(s.order).padStart(2, "0")}. ${s.name}`,
                href: `/docs/palms/${palmSlug}-${palmId}/steps/${String(s.order).padStart(2, "0")}-${slug(s.name)}-${s.id}.md`
            }));
            writeFile(path.join(base, "workflows", `${wSlug}-${w.id}.md`), page({ type: "Workflow", id: w.id, name: w.name, slug: wSlug }, rels, shorthand, children, cfg.storage));
        }
        // Step pages
        for (const s of spec.workflowSteps) {
            const sSlug = slug(s.name);
            const sGates = spec.workflowStepGates.filter(x => x.stepId === s.id).map(x => spec.phaseGates.find(g => g.id === x.gateId));
            const rels = [
                `Workflow →◼+← WorkflowStep (◼=WorkflowWorkflowStep) [StepOrder=${s.order}]`,
                `WorkflowStep ↔◼↔ PhaseGate (◼=WorkflowStepGate) → ${sGates.map(g => g.name).join(", ") || "(none)"}`
            ];
            const shorthand = `Workflow →◼+← WorkflowStep\nWorkflowStep ↔◼↔ PhaseGate`;
            const children = sGates.map(g => ({ label: `Gate: ${g.name}`, href: `/docs/palms/${palmSlug}-${palmId}/gates/${slug(g.name)}-${g.id}.md` }));
            writeFile(path.join(base, "steps", `${String(s.order).padStart(2, "0")}-${sSlug}-${s.id}.md`), page({ type: "WorkflowStep", id: s.id, name: s.name, slug: sSlug }, rels, shorthand, children, cfg.storage));
        }
        // Gate pages
        for (const g of spec.phaseGates) {
            const gSlug = slug(g.name);
            const trans = spec.gateTransitions.filter(t => t.gateId === g.id).sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100) || a.name.localeCompare(b.name));
            const rels = [
                "LifecyclePhase ↔◼↔ PhaseGate (◼=LifecyclePhaseGate)",
                "WorkflowStep ↔◼↔ PhaseGate (◼=WorkflowStepGate)",
                `PhaseGate →◼+← GateTransition (◼=PhaseGateTransition) [${trans.length} transitions]`
            ];
            const shorthand = `LifecyclePhase ↔◼↔ PhaseGate\nWorkflowStep ↔◼↔ PhaseGate\nPhaseGate →◼+← GateTransition`;
            const children = trans.map(t => ({ label: `Transition: ${t.name}`, href: `/docs/palms/${palmSlug}-${palmId}/transitions/${slug(t.name)}-${t.id}.md` }));
            writeFile(path.join(base, "gates", `${gSlug}-${g.id}.md`), page({ type: "PhaseGate", id: g.id, name: g.name, slug: gSlug }, rels, shorthand, children, cfg.storage));
        }
        // Transition pages
        for (const t of spec.gateTransitions) {
            const tSlug = slug(t.name);
            const mode = t.mode === "Absolute"
                ? (t.targetStepId ? `→ Step ${t.targetStepId}` : `→ Phase ${t.targetPhaseId}`)
                : (t.relativeKind === "Next" ? "→ Next (relative)" : "→ Previous (relative)");
            const rels = [
                "PhaseGate →◼+← GateTransition (◼=PhaseGateTransition)",
                `Target: ${t.mode} ${mode}`,
                `Priority: ${t.priority ?? 100}  •  Default: ${t.isDefault ? "Yes" : "No"}${t.conditionExpr ? `  •  When: ${t.conditionExpr}` : ""}`
            ];
            const shorthand = `PhaseGate →◼+← GateTransition`;
            writeFile(path.join(base, "transitions", `${tSlug}-${t.id}.md`), page({ type: "GateTransition", id: t.id, name: t.name, slug: tSlug }, rels, shorthand, [], cfg.storage));
        }
    }
}
run();
