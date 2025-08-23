import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";
import { v5 as uuidv5 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type GUID = string;

type StorageCfg = {
    rootGitHub: string;
    rootWebTree: string;
    rawPrefix: string;
    documentsRoot: string;
    cameraRoot: string;
    fileContentPath: string;
    filePath: string;
};

type Config = {
    storage: StorageCfg;
    namespaceUUID: GUID;
    outDir: string;      // relative to docs/palms
    indexHeader: string;
};

type WorkflowState = { id: number; name: string; description: string };

type BaseMeta = {
    type: string;
    id?: GUID;
    name: string;
    slug?: string;
    // optional linking helpers
    gateId?: GUID; gateName?: string;
    lifecycleId?: GUID; lifecycleName?: string;
    phaseId?: GUID; phaseName?: string;
    workflowId?: GUID; workflowName?: string;
    targetPhaseId?: GUID; targetPhaseName?: string;
    targetStepId?: GUID; targetStepName?: string;
};

type PalmFolder = {
    palm: BaseMeta;
    models: (BaseMeta & { workflowStates?: number[] })[];
    lifecycles: (BaseMeta & { modelIds?: GUID[]; modelNames?: string[] })[];
    phases: (BaseMeta & { order: number; lifecycleId?: GUID; lifecycleName?: string })[];
    workflows: (BaseMeta & { phaseId?: GUID; phaseName?: string })[];
    steps: (BaseMeta & { order: number; workflowId?: GUID; workflowName?: string })[];
    gates: (BaseMeta & { anchor?: { phases?: (string | GUID)[], steps?: { step: string | GUID, placement?: string }[] } })[];
    transitions: (BaseMeta & {
        gateId?: GUID; gateName?: string;
        mode: "Absolute" | "Relative";
        relativeKind?: "Next" | "Previous";
        priority?: number; isDefault?: boolean; conditionExpr?: string | null;
    })[];
};

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = ROOT;
const SPECS_DIR = path.join(ROOT, "specs");
const DATA_DIR = path.join(ROOT, "data");

//const ROOT = process.cwd();
//const OUT_DIR = ROOT;
//const SPECS_DIR = path.join(ROOT, "specs");
//const DATA_DIR = path.join(ROOT, "data");

function readJSON<T>(p: string): T {
    return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
}
function loadConfig(): Config {
    return readJSON<Config>(path.join(ROOT, "palms.config.json"));
}
function loadStates(): WorkflowState[] {
    return readJSON<WorkflowState[]>(path.join(DATA_DIR, "workflow-states.json"));
}
function ensureDir(p: string) { fs.mkdirSync(p, { recursive: true }); }
function writeFile(p: string, content: string) { ensureDir(path.dirname(p)); fs.writeFileSync(p, content, "utf-8"); }
function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function fm(meta: Record<string, any>) { return `---\n${JSON.stringify(meta, null, 2)}\n---`; }
function nowIso() { return new Date().toISOString(); }
function detUuid(ns: GUID, ...parts: string[]) { return uuidv5(parts.join("::"), ns); }
function mdTable(headers: string[], rows: (string | number | null)[][]) {
    const head = `| ${headers.join(" | ")} |`;
    const sep = `|${headers.map(() => " --- ").join("|")}|`;
    const body = rows.map(r => `| ${r.map(v => v == null ? "" : String(v)).join(" | ")} |`).join("\n");
    return `${head}\n${sep}\n${body}\n`;
}

function scanPalmFolders(): string[] {
    if (!fs.existsSync(SPECS_DIR)) return [];
    return fs.readdirSync(SPECS_DIR).filter(f => fs.statSync(path.join(SPECS_DIR, f)).isDirectory());
}

function parseFolder(folder: string): PalmFolder {
    const base = path.join(SPECS_DIR, folder);
    const get = (rel: string) => path.join(base, rel);
    const readAll = (dirRel: string) => {
        const dir = get(dirRel);
        if (!fs.existsSync(dir)) return [] as any[];
        return fs.readdirSync(dir)
            .filter(f => f.toLowerCase().endsWith(".md"))
            .map(f => {
                const raw = fs.readFileSync(path.join(dir, f), "utf-8");
                const { data } = matter(raw);
                return data as any;
            });
    };

    const palmFile = fs.readFileSync(get("palm.md"), "utf-8");
    const palm = matter(palmFile).data as BaseMeta;
    const models = readAll("models");
    const lifecycles = readAll("lifecycles");
    const phases = readAll("phases");
    const workflows = readAll("workflows");
    const steps = readAll("steps");
    const gates = readAll("gates");
    const transitions = readAll("transitions");

    return { palm, models, lifecycles, phases, workflows, steps, gates, transitions } as PalmFolder;
}

function applyDeterministicIds(cfg: Config, g: PalmFolder) {
    const ns = cfg.namespaceUUID;
    const fix = (t: string, x: any, parent?: string) => {
        x.slug = x.slug ?? slugify(x.name);
        x.id = x.id ?? detUuid(ns, t, parent ?? "", x.name);
    };

    fix("PaLM", g.palm);

    for (const m of g.models) fix("Model", m, g.palm.id);
    for (const l of g.lifecycles) fix("Lifecycle", l, JSON.stringify(l.modelIds ?? l.modelNames ?? []));
    for (const p of g.phases) fix("LifecyclePhase", p, p.lifecycleId ?? p.lifecycleName ?? "");
    for (const w of g.workflows) fix("Workflow", w, w.phaseId ?? w.phaseName ?? "");
    for (const s of g.steps) fix("WorkflowStep", s, s.workflowId ?? s.workflowName ?? "");
    for (const gt of g.gates) fix("PhaseGate", gt);
    for (const t of g.transitions) fix("GateTransition", t, t.gateId ?? t.gateName ?? "");
}

function resolveNamesToIds(g: PalmFolder) {
    // Build name->ID maps (case-insensitive)
    const mapBy = <T extends { id: GUID; name: string }>(arr: T[]) => {
        const m = new Map<string, GUID>();
        for (const x of arr) m.set(x.name.toLowerCase(), x.id);
        return m;
    };
    const M = mapBy(g.models as any);
    const L = mapBy(g.lifecycles as any);
    const P = mapBy(g.phases as any);
    const W = mapBy(g.workflows as any);
    const S = mapBy(g.steps as any);
    const G = mapBy(g.gates as any);

    // Lifecycle modelIds from modelNames
    for (const l of g.lifecycles) {
        if ((!l.modelIds || !l.modelIds.length) && l.modelNames && l.modelNames.length) {
            l.modelIds = l.modelNames.map(n => {
                const id = M.get(String(n).toLowerCase());
                if (!id) throw new Error(`Lifecycle '${l.name}': modelName '${n}' not found`);
                return id;
            });
        }
    }

    // Phase lifecycleId from lifecycleName
    for (const p of g.phases) {
        if (!p.lifecycleId && p.lifecycleName) {
            const id = L.get(p.lifecycleName.toLowerCase());
            if (!id) throw new Error(`Phase '${p.name}': lifecycleName '${p.lifecycleName}' not found`);
            p.lifecycleId = id;
        }
    }

    // Workflow phaseId
    for (const w of g.workflows) {
        if (!w.phaseId && w.phaseName) {
            const id = P.get(w.phaseName.toLowerCase());
            if (!id) throw new Error(`Workflow '${w.name}': phaseName '${w.phaseName}' not found`);
            w.phaseId = id;
        }
    }

    // Step workflowId
    for (const s of g.steps) {
        if (!s.workflowId && s.workflowName) {
            const id = W.get(s.workflowName.toLowerCase());
            if (!id) throw new Error(`Step '${s.name}': workflowName '${s.workflowName}' not found`);
            s.workflowId = id;
        }
    }

    // Gate anchoring (phase/step names)
    for (const gt of g.gates) {
        if (gt.anchor?.phases) {
            gt.anchor.phases = gt.anchor.phases.map(ph => {
                const s = String(ph);
                const id = P.get(s.toLowerCase());
                return id ?? (s.match(/^[0-9a-f-]{36}$/i) ? s : (() => { throw new Error(`Gate '${gt.name}': phase anchor '${s}' not found`); })());
            });
        }
        if (gt.anchor?.steps) {
            gt.anchor.steps = gt.anchor.steps.map(x => {
                const s = String(x.step);
                const id = S.get(s.toLowerCase());
                return { step: id ?? (s.match(/^[0-9a-f-]{36}$/i) ? s : (() => { throw new Error(`Gate '${gt.name}': step anchor '${s}' not found`); })()), placement: x.placement };
            });
        }
    }

    // Transition gateName/targets
    for (const t of g.transitions) {
        if (!t.gateId && t.gateName) {
            const id = G.get(t.gateName.toLowerCase());
            if (!id) throw new Error(`Transition '${t.name}': gateName '${t.gateName}' not found`);
            t.gateId = id;
        }
        if (t.targetPhaseName) {
            const id = P.get(t.targetPhaseName.toLowerCase());
            if (!id) throw new Error(`Transition '${t.name}': targetPhaseName '${t.targetPhaseName}' not found`);
            t.targetPhaseId = id;
        }
        if (t.targetStepName) {
            const id = S.get(t.targetStepName.toLowerCase());
            if (!id) throw new Error(`Transition '${t.name}': targetStepName '${t.targetStepName}' not found`);
            t.targetStepId = id;
        }
    }
}

function validate(g: PalmFolder, states: WorkflowState[]) {
    const must = (cond: boolean, msg: string) => { if (!cond) throw new Error(`Spec invalid: ${msg}`); };
    const byId = <T extends { id: GUID }>(arr: T[]) => new Set(arr.map(x => x.id));
    const M = byId(g.models as any);
    const L = byId(g.lifecycles as any);
    const P = byId(g.phases as any);
    const W = byId(g.workflows as any);
    const S = byId(g.steps as any);
    const G = byId(g.gates as any);
    const stateIds = new Set(states.map(s => s.id));

    for (const m of g.models) for (const sid of (m.workflowStates ?? [])) must(stateIds.has(sid), `Model '${m.name}' refs missing WorkflowState ${sid}`);

    for (const l of g.lifecycles) {
        must((l.modelIds ?? []).length > 0, `Lifecycle '${l.name}' must link ≥1 model`);
        for (const mid of (l.modelIds ?? [])) must(M.has(mid), `Lifecycle '${l.name}' refs missing Model ${mid}`);
    }

    // Phase orders
    const phasesByLifecycle = new Map<GUID, { order: number, id: GUID }[]>();
    for (const p of g.phases) {
        must(!!p.lifecycleId, `Phase '${p.name}' missing lifecycleId`);
        if (!phasesByLifecycle.has(p.lifecycleId!)) phasesByLifecycle.set(p.lifecycleId!, []);
        phasesByLifecycle.get(p.lifecycleId!)!.push({ order: p.order, id: p.id! });
    }
    for (const [lc, arr] of phasesByLifecycle.entries()) {
        must(arr.length > 0, `Lifecycle ${lc} must have ≥1 phase`);
        const orders = new Set(arr.map(x => x.order));
        must(orders.size === arr.length, `Lifecycle ${lc} has duplicate PhaseOrder`);
        for (const x of arr) must(x.order > 0, `Lifecycle ${lc} has non-positive PhaseOrder`);
    }

    // Workflow 1:1 Phase
    const wfByPhase = new Map<GUID, number>();
    for (const w of g.workflows) {
        must(!!w.phaseId && P.has(w.phaseId!), `Workflow '${w.name}' refs missing Phase`);
        wfByPhase.set(w.phaseId!, (wfByPhase.get(w.phaseId!) ?? 0) + 1);
    }
    for (const [pid, cnt] of wfByPhase.entries()) must(cnt === 1, `Phase ${pid} must have exactly 1 workflow (found ${cnt})`);

    // Steps per workflow: unique order
    const stepsByWf = new Map<GUID, { order: number }[]>();
    for (const st of g.steps) {
        must(!!st.workflowId && W.has(st.workflowId!), `Step '${st.name}' refs missing Workflow`);
        if (!stepsByWf.has(st.workflowId!)) stepsByWf.set(st.workflowId!, []);
        stepsByWf.get(st.workflowId!)!.push({ order: st.order });
    }
    for (const [wf, arr] of stepsByWf.entries()) {
        const orders = new Set(arr.map(x => x.order));
        must(orders.size === arr.length, `Workflow ${wf} has duplicate StepOrder`);
        for (const x of arr) must(x.order > 0, `Workflow ${wf} has non-positive StepOrder`);
    }

    // Gate anchors exist
    for (const gte of g.gates) {
        for (const ph of (gte.anchor?.phases ?? []) as any[]) must(P.has(ph), `Gate '${gte.name}' anchor phase missing: ${ph}`);
        for (const st of (gte.anchor?.steps ?? [])) must(S.has((st as any).step), `Gate '${gte.name}' anchor step missing`);
    }

    // Transitions per gate: ≥1 & exactly one default; absolute vs relative shape
    const transByGate = new Map<GUID, typeof g.transitions>();
    for (const t of g.transitions) {
        must(!!t.gateId && G.has(t.gateId!), `Transition '${t.name}' refs missing Gate`);
        if (!transByGate.has(t.gateId!)) transByGate.set(t.gateId!, []);
        transByGate.get(t.gateId!)!.push(t);
    }
    for (const [gid, arr] of transByGate.entries()) {
        must(arr.length > 0, `Gate ${gid} must have ≥1 transition`);
        const defaults = arr.filter(x => x.isDefault);
        must(defaults.length === 1, `Gate ${gid} must have exactly 1 default transition`);
        for (const t of arr) {
            if (t.mode === "Relative") {
                must(!!t.relativeKind, `Transition '${t.name}' relativeKind required`);
                must(!t.targetPhaseId && !t.targetStepId, `Transition '${t.name}' Relative must not set absolute targets`);
            } else {
                const setCount = Number(!!t.targetPhaseId) + Number(!!t.targetStepId);
                must(setCount === 1, `Transition '${t.name}' Absolute must set exactly one target`);
                if (t.targetPhaseId) must(P.has(t.targetPhaseId), `Transition '${t.name}' targets missing Phase`);
                if (t.targetStepId) must(S.has(t.targetStepId), `Transition '${t.name}' targets missing Step`);
            }
        }
    }
}

function writeDocs(cfg: Config, states: WorkflowState[], folderName: string, g: PalmFolder) {
    const storage = cfg.storage;
    const palmSlug = g.palm.slug ?? slugify(g.palm.name);
    const base = path.join(OUT_DIR, `${palmSlug}-${g.palm.id}`);

    // Index
    const models = g.models.map(m => ({ id: m.id!, name: m.name, slug: m.slug ?? slugify(m.name) }));
    const lifecycles = g.lifecycles.map(l => ({ id: l.id!, name: l.name, slug: l.slug ?? slugify(l.name) }));
    const index = `${cfg.indexHeader}

${fm({ type: "PaLM", id: g.palm.id, name: g.palm.name, slug: palmSlug, storage, generatedAt: nowIso() })}
# ${g.palm.name} (${g.palm.id})

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
${models.map(m => `- [${m.name}](/docs/palms/${palmSlug}-${g.palm.id}/models/${m.slug}-${m.id}.md)`).join("\n") || "_(none)_"}

### Lifecycles
${lifecycles.map(l => `- [${l.name}](/docs/palms/${palmSlug}-${g.palm.id}/lifecycles/${l.slug}-${l.id}.md)`).join("\n") || "_(none)_"}

### Workflow States (snapshot)
See: [/docs/palms/${palmSlug}-${g.palm.id}/tables/workflow-states.md](/docs/palms/${palmSlug}-${g.palm.id}/tables/workflow-states.md)
`;
    writeFile(path.join(base, "README.md"), index);

    // States snapshot
    const wsTable = mdTable(["ID", "Workflow State", "Description"], states.map(s => [s.id, s.name, s.description]));
    writeFile(path.join(base, "tables", "workflow-states.md"), `# Workflow States\n\n${wsTable}`);

    // Helpers
    const page = (meta: any, relations: string[], shorthand: string, children: { label: string; href: string }[]) => `${fm({
        type: meta.type, id: meta.id, name: meta.name, slug: meta.slug ?? slugify(meta.name),
        parentIds: meta.parentIds ?? [], storage, generatedAt: nowIso()
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

    // Write object pages (Models)
    for (const m of g.models) {
        const mSlug = m.slug ?? slugify(m.name);
        const rels = [
            "PaLM{} ↔◼↔ Model  (◼=PaLMModel)",
            `Model ↔◼↔ WorkflowState (◼=ModelWorkflowState): ${(m.workflowStates ?? []).join(", ") || "(none)"}`,
            "Model ↔◼↔ Lifecycle (◼=ModelLifecycle)"
        ];
        const shorthand = `PaLM{} ↔◼↔ Model\nModel ↔◼↔ WorkflowState\nModel ↔◼↔ Lifecycle`;
        const children = g.lifecycles.filter(l => (l.modelIds ?? []).includes(m.id!))
            .map(l => ({ label: `Lifecycle: ${l.name}`, href: `/docs/palms/${palmSlug}-${g.palm.id}/lifecycles/${l.slug ?? slugify(l.name)}-${l.id}.md` }));
        writeFile(path.join(base, "models", `${mSlug}-${m.id}.md`),
            page(m, rels, shorthand, children));
    }

    // Lifecycles
    for (const l of g.lifecycles) {
        const lSlug = l.slug ?? slugify(l.name);
        const phases = g.phases.filter(p => p.lifecycleId === l.id).sort((a, b) => a.order - b.order);
        const rels = [
            "Model ↔◼↔ Lifecycle (◼=ModelLifecycle)",
            `Lifecycle →◼+← LifecyclePhase (◼=LifecycleLifecyclePhase) [orders: ${phases.map(p => p.order).join(", ")}]`
        ];
        const shorthand = `Model ↔◼↔ Lifecycle\nLifecycle →◼+← LifecyclePhase`;
        const children = phases.map(ph => ({
            label: `${String(ph.order).padStart(2, "0")}. ${ph.name}`,
            href: `/docs/palms/${palmSlug}-${g.palm.id}/phases/${String(ph.order).padStart(2, "0")}-${ph.slug ?? slugify(ph.name)}-${ph.id}.md`
        }));
        writeFile(path.join(base, "lifecycles", `${lSlug}-${l.id}.md`),
            page(l, rels, shorthand, children));
    }

    // Phases
    for (const ph of g.phases) {
        const phSlug = ph.slug ?? slugify(ph.name);
        const wf = g.workflows.find(w => w.phaseId === ph.id);
        const phaseGateIds = new Set(
            g.gates.flatMap(gt => (gt.anchor?.phases ?? []) as (GUID[])).filter(x => x === ph.id)
        );
        const gatesAtPhase = g.gates.filter(gt => (gt.anchor?.phases ?? []).includes(ph.id as any));
        const rels = [
            `Lifecycle →◼+← LifecyclePhase (◼=LifecycleLifecyclePhase) [PhaseOrder=${ph.order}]`,
            `LifecyclePhase ↔◼1↔ Workflow (◼=LifecyclePhaseWorkflow) → ${wf?.name ?? "(missing)"}`,
            `LifecyclePhase ↔◼↔ PhaseGate (◼=LifecyclePhaseGate) → ${gatesAtPhase.map(g => g.name).join(", ") || "(none)"}`
        ];
        const shorthand = `Lifecycle →◼+← LifecyclePhase\nLifecyclePhase ↔◼1↔ Workflow\nLifecyclePhase ↔◼↔ PhaseGate`;
        const children = [
            ...(wf ? [{ label: `Workflow: ${wf.name}`, href: `/docs/palms/${palmSlug}-${g.palm.id}/workflows/${wf.slug ?? slugify(wf.name)}-${wf.id}.md` }] : []),
            ...gatesAtPhase.map(gte => ({ label: `Gate: ${gte.name}`, href: `/docs/palms/${palmSlug}-${g.palm.id}/gates/${gte.slug ?? slugify(gte.name)}-${gte.id}.md` }))
        ];
        writeFile(path.join(base, "phases", `${String(ph.order).padStart(2, "0")}-${phSlug}-${ph.id}.md`),
            page(ph, rels, shorthand, children));
    }

    // Workflows
    for (const w of g.workflows) {
        const wSlug = w.slug ?? slugify(w.name);
        const steps = g.steps.filter(s => s.workflowId === w.id).sort((a, b) => a.order - b.order);
        const rels = [
            "LifecyclePhase ↔◼1↔ Workflow (◼=LifecyclePhaseWorkflow)",
            `Workflow →◼+← WorkflowStep (◼=WorkflowWorkflowStep) [orders: ${steps.map(s => s.order).join(", ")}]`
        ];
        const shorthand = `LifecyclePhase ↔◼1↔ Workflow\nWorkflow →◼+← WorkflowStep`;
        const children = steps.map(s => ({
            label: `${String(s.order).padStart(2, "0")}. ${s.name}`,
            href: `/docs/palms/${palmSlug}-${g.palm.id}/steps/${String(s.order).padStart(2, "0")}-${s.slug ?? slugify(s.name)}-${s.id}.md`
        }));
        writeFile(path.join(base, "workflows", `${wSlug}-${w.id}.md`),
            page(w, rels, shorthand, children));
    }

    // Steps
    for (const s of g.steps) {
        const sSlug = s.slug ?? slugify(s.name);
        const stepGates = g.gates.filter(gt => (gt.anchor?.steps ?? []).some(x => (x as any).step === s.id));
        const rels = [
            `Workflow →◼+← WorkflowStep (◼=WorkflowWorkflowStep) [StepOrder=${s.order}]`,
            `WorkflowStep ↔◼↔ PhaseGate (◼=WorkflowStepGate) → ${stepGates.map(gte => gte.name).join(", ") || "(none)"}`
        ];
        const shorthand = `Workflow →◼+← WorkflowStep\nWorkflowStep ↔◼↔ PhaseGate`;
        const children = stepGates.map(gte => ({ label: `Gate: ${gte.name}`, href: `/docs/palms/${palmSlug}-${g.palm.id}/gates/${gte.slug ?? slugify(gte.name)}-${gte.id}.md` }));
        writeFile(path.join(base, "steps", `${String(s.order).padStart(2, "0")}-${sSlug}-${s.id}.md`),
            page(s, rels, shorthand, children));
    }

    // Gates
    for (const gte of g.gates) {
        const gSlug = gte.slug ?? slugify(gte.name);
        const trans = g.transitions.filter(t => t.gateId === gte.id).sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100) || a.name.localeCompare(b.name));
        const rels = [
            "LifecyclePhase ↔◼↔ PhaseGate (◼=LifecyclePhaseGate)",
            "WorkflowStep ↔◼↔ PhaseGate (◼=WorkflowStepGate)",
            `PhaseGate →◼+← GateTransition (◼=PhaseGateTransition) [${trans.length} transitions]`
        ];
        const shorthand = `LifecyclePhase ↔◼↔ PhaseGate\nWorkflowStep ↔◼↔ PhaseGate\nPhaseGate →◼+← GateTransition`;
        const children = trans.map(t => ({ label: `Transition: ${t.name}`, href: `/docs/palms/${palmSlug}-${g.palm.id}/transitions/${t.slug ?? slugify(t.name)}-${t.id}.md` }));
        writeFile(path.join(base, "gates", `${gSlug}-${gte.id}.md`),
            page(gte, rels, shorthand, children));
    }

    // Transitions
    for (const t of g.transitions) {
        const tSlug = t.slug ?? slugify(t.name);
        const modeText = t.mode === "Absolute"
            ? (t.targetStepId ? `→ Step ${t.targetStepId}` : `→ Phase ${t.targetPhaseId}`)
            : (t.relativeKind === "Next" ? "→ Next (relative)" : "→ Previous (relative)");
        const rels = [
            "PhaseGate →◼+← GateTransition (◼=PhaseGateTransition)",
            `Target: ${t.mode} ${modeText}`,
            `Priority: ${t.priority ?? 100}  •  Default: ${t.isDefault ? "Yes" : "No"}${t.conditionExpr ? `  •  When: ${t.conditionExpr}` : ""}`
        ];
        const shorthand = `PhaseGate →◼+← GateTransition`;
        writeFile(path.join(base, "transitions", `${tSlug}-${t.id}.md`),
            page(t, rels, shorthand, []));
    }
}

async function run() {
    const cfg = loadConfig();
    const states = loadStates();
    const folders = scanPalmFolders();
    if (!folders.length) throw new Error(`No folders found under ${SPECS_DIR}`);

    for (const folder of folders) {
        const graph = parseFolder(folder);
        applyDeterministicIds(cfg, graph);
        resolveNamesToIds(graph);
        validate(graph, states);
        writeDocs(cfg, states, folder, graph);
    }
}
run();