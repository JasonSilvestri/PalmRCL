# PLM AI Lifecycle Models™ - PaLMs\{\}™ (v 1.3)

**PLM AI Lifecycle Model** (a.k.a., **PaLM\{\}**) is a structured model for **AI lifecycle design**, focused on clarity, determinism, and reusability.  

---

[`Home`](./README.md)

---


### **Draft Variant:**

> [!WARNING]
> You are currently viewing the **"_Draft_" _Variant_** of this **VengeanceRCL Project** section. More informatioin soon to be expected.

---

## Overview 

**PLM AI Lifecycle Model** (a.k.a., **PaLM\{\}**) is a structured model for **AI lifecycle design**, focused on clarity, determinism, and reusability. It is a proprietary automation process that **Jason** & **Lumina** are perfecting. 

This process leverages old-school PLM (_Product Lifecycle Management_) design patterns to construct new AI-driven Lifecycle Models. **Lumina** and **Jason** are experimenting with these models, turning our common chats into AI-powered collaboration master lifecycles.

We use a collection of PLM design patterns called Lifecycles, Lifecycle Phases, Workflows, Workflow Steps, Workflow States, Phase Gates, and Gate Transitions, to construct relaltional-tranaction-based blocks of strictly formatted Markdown, we are starting to call, _PaLMs\{\}_ (working title), to create a complex PLM designed, AI powered, models that can be organically built through normal chat text based conversations Lumina and Jason have, into more useful-more predictable-accurately crafted, finished tasks.

This includes everything from complex lifecycle legal documentation creation and management lifecycles, like the `MasterLifecyclePacket` lifecycle we use for the **[Scott Hall Case](#https://chatgpt.com/g/g-p-686fb9f7adf481919ef8d095cfc06fb6-scott-hall-case/project)** project, to more creative design-charged lifecycles, such as the `UltimateStoryBoard` lifecycle, currently used by **[The Official Bigfoot Blog](#https://chatgpt.com/g/g-p-6869a4d4502c8191a3334e6be4e25f29-the-official-bigfoot-vlog/project)** project, to manufacture amazing storyboards that can transform traditional scenes into AI-generated video clips for Veo Prompts not even done before. 

And guess what? Here is what changes... Everything... The **[Scott Hall Case](#https://chatgpt.com/g/g-p-686fb9f7adf481919ef8d095cfc06fb6-scott-hall-case/project)** project soon requires the same benefit from a `UltimateStoryBoard` lifecycle for their video needs. Using the same lifecycle model for both legal and creative projects is a game-changer.

The possibilities are endless!

---

# Table of Contents

- [PLM AI Lifecycle Models™ - PaLMs{}™ (v 1.3)](#plm-ai-lifecycle-models---palms-v-13)
  - [Draft Variant](#draft-variant)
  - [Overview](#overview)
  - [Prerequisites](#prerequisites)
  - [PaLM\{\} Autonomy](#palm-autonomy)
  - [Workflow States](#-workflow-states)
  - [Junction Rules (Enforced)](#-junction-rules-enforced)
  - [Model Objects](#model-objects)
    - [Models](#models)
    - [Lifecycles](#lifecycles)
    - [Lifecycle Phases](#lifecycle-phases)
    - [Workflows](#workflows)
    - [Workflow Steps](#workflow-steps)
    - [Phase Gates](#phase-gates)
    - [Gate Transitions](#gate-transitions)
  - [Windows 10 Constraints](#-windows-10-constraints)
  - [Expanding Lifecycles](#expanding-lifecycles)
  - [Current File Structure Tree](#current-file-structure-tree)
  - [PaLM v1.3 Seed — Current Baseline](#-palm-v13-seed--current-baseline)
    - [Repo Path](#repo-path)
    - [Generators in Place](#generators-in-place)
  - [Static Web Assets Hygiene](#static-web-assets-hygiene)
  - [Troubleshooting](#troubleshooting)
  - [Current Status](#-current-status)
  - [Next Steps (v1.3 direction)](#-next-steps-v13-direction)

---

## **Prerequisites**

Before you can get started with the **PaLM\{\}** PLM AI Lifecycle Models, you need to ensure you have the following prerequisites installed and configured on your system:

- [Visual Studio (v 17.14.8)](https://github.com/JasonSilvestri/JSopX.BridgeTooFar/tree/master/JSopX.BridgeTooFar/DocsOpenX/Technologies/#visual-studio)
- [.NET Framework (v 9.0.1)](https://github.com/JasonSilvestri/JSopX.BridgeTooFar/tree/master/JSopX.BridgeTooFar/DocsOpenX/Technologies/#net-framework)
- [ASP.NET Core (v 9.0.1)](https://github.com/JasonSilvestri/JSopX.BridgeTooFar/tree/master/JSopX.BridgeTooFar/DocsOpenX/Technologies/#aspnet-core)
- [Node.js (v 20.14.0)](https://github.com/JasonSilvestri/JSopX.BridgeTooFar/tree/master/JSopX.BridgeTooFar/DocsOpenX/Technologies/#node)
- [npm (v 10.8.1)](https://github.com/JasonSilvestri/JSopX.BridgeTooFar/tree/master/JSopX.BridgeTooFar/DocsOpenX/Technologies/#npm)
- [Python (v 3.12.3)](https://github.com/JasonSilvestri/JSopX.BridgeTooFar/tree/master/JSopX.BridgeTooFar/DocsOpenX/Technologies/#python)

[`⇧ Back to Top`](#table-of-contents)  

---

## PaLM\{\} Autonomy

The **PaLMs\{\}** system is designed to be highly autonomous. Once a lifecycle is defined and validated, it can manage its own state transitions based on predefined rules and conditions. This allows for dynamic adaptation to changing requirements and scenarios.

> PaLM{} ↔◼↔ Model (◼=PaLMModel) [≥1 Model/PaLM via policy] > - Model ↔◼↔ WorkflowState (◼=ModelWorkflowState, INT) [≥1 State/Model] > - Model ↔◼↔ Lifecycle (◼=ModelLifecycle) > - Lifecycle →◼+← LifecyclePhase (◼=LifecycleLifecyclePhase, UQ PhaseID; PhaseOrder) > - LifecyclePhase ↔◼1↔ Workflow (◼=LifecyclePhaseWorkflow, UQ both) > - Workflow →◼+← WorkflowStep (◼=WorkflowWorkflowStep, UQ StepID; StepOrder) > - LifecyclePhase ↔◼↔ PhaseGate (◼=LifecyclePhaseGate) > - WorkflowStep ↔◼↔ PhaseGate (◼=WorkflowStepGate [Placement]) > - PhaseGate →◼+← GateTransition (◼=PhaseGateTransition; Mode=Absolute|Relative)

[`⇧ Back to Top`](#table-of-contents)  

---


## 📜 Workflow States

* **1–17 (INT IDs, reserved)** = deterministic, fixed baseline (e.g. Started=1, Skipped=2, … Completed=8, etc.)
* GUIDs = everything else (Models, Lifecycles, Workflows, Steps, Gates, Transitions)

[`⇧ Back to Top`](#table-of-contents)  

---


## 🔗 Junction Rules (Enforced)

* PaLM{} ↔◼↔ Model
* Model ↔◼↔ WorkflowState
* Model ↔◼↔ Lifecycle
* Lifecycle →◼+← LifecyclePhase
* LifecyclePhase ↔◼1↔ Workflow
* Workflow →◼+← WorkflowStep
* LifecyclePhase ↔◼↔ PhaseGate
* WorkflowStep ↔◼↔ PhaseGate
* PhaseGate →◼+← GateTransition

**Rules:**

* Gates anchor only at **phases or steps**
* Transitions must be **Absolute (targetPhase / targetStep)** or **Relative (Next / Previous)**
* Exactly **one default per gate** (auto-normalized if missing)

[`⇧ Back to Top`](#table-of-contents)  

---

## Model Objects

### Models
- Represent AI models (e.g. `visionmodel-v1`).

### Lifecycles
- Top-level containers of the process.
- Each lifecycle has a deterministic UUID and a set of Phases.

### Lifecycle Phases
- Ordered segments of a Lifecycle.
- Each Phase can anchor **Workflows** and **Phase Gates**.

### Workflows
- Define process sequences within a Phase.
- Junction-linked to **Workflow Steps**.

### Workflow Steps
- Atomic actions or states within a Workflow.
- May connect to Phase Gates.

### Phase Gates
- Anchored at either a Phase or a Step.
- Govern allowed transitions between Phases/Steps.

### Gate Transitions
- Each Gate has multiple transitions, one of which is default.
- Support both **absolute targeting** (specific phase/step) and **relative targeting** (Next/Previous).

[`⇧ Back to Top`](#table-of-contents)  

---


## 🖥️ Windows 10 Constraints

* All scripts run in **Node.js v20.14.0** on **Windows 10**
* CRLF enforced by `tools/normalize-eol.ps1`
* `npm run palms:roundtrip:win` pipeline works end-to-end:

  * Normalize → Copy latest → Build → Gen\:md → Normalize

[`⇧ Back to Top`](#table-of-contents)  

---


## Expanding Lifecycles

To create or extend a lifecycle:

1. **Add JSON Spec**
   - Define new Lifecycle, Phases, Workflows, etc.
   - Ensure UUIDs are deterministic.

2. **Run Generators**
   ```powershell
   npm run palms:gen:md
   npm run palms:gen:json
   npm run palms:roundtrip:win
   ```

3. **Export Round-Trip**
   ```powershell
   npm run palms:export
   ```

4. **Verify SQL Seed**
   - Check `out/sql/*.seed.sql` for correct inserts.
   - Confirm one default transition per Gate.

5. **Commit & Push**
   - Generated docs (`docs/palms/**`) and outputs (`out/**`).

[`⇧ Back to Top`](#table-of-contents)  

---

## Current File Structure Tree

The current file structure of the **PaLM\{\}** project is organized as follows:

```text

PalmRCL
│   PalmRCL.sln
│
└───Solution Items  # These are technically in root. Visual Studio stores added existing items from root in this folder.
│     package.json
│     README.md
│
└───tools
│     Copy-PalmBundleLatest.ps1
│     normalize-eol.ps1
│
└───PalmRCL
    │   Component1.razor
    │   Component1.razor.css
    │   ExampleJsInterop.cs
    │   PalmRCL.csproj
    │   _Imports.razor
    └───wwwroot
        │   background.png
        │   exampleJsInterop.js
        │
        └───docs
            └───palms
                │   package-lock.json
                │   package.json
                │   palm-demo-44b026db-ab7d-46c8-8d54-a2ff2d244c19.bundle.json
                │   palm-demo-44b026db-ab7d-46c8-8d54-a2ff2d244c19.seed.sql
                │   palm-demo-97d170e1.bundle.json
                │   palm-demo-97d170e1.seed.sql
                │   palms.config.json
                │   tsconfig.json
                │
                ├───data
                │       palm-demo-rt.json
                │       palm-demo.json
                │       workflow-states.json
                │
                ├───dist
                │       export-roundtrip.js
                │       fs-utils.js
                │       generate-md.js
                │       generate-offline.js
                │
                ├───node_modules  # There are many more modules in the project
                │   │   .package-lock.json
                │   │
                │   ├───.bin
                │   │       acorn
                │   │       acorn.cmd
                │   │       acorn.ps1
                │   │       eslint
                │   │       eslint.cmd
                │   │       eslint.ps1
                │   │       esparse
                │   │       esparse.cmd
                │   │       esparse.ps1
                │   │       esvalidate
                │   │       esvalidate.cmd
                │   │       esvalidate.ps1
                │   │       js-yaml
                │   │       js-yaml.cmd
                │   │       js-yaml.ps1
                │   │       node-which
                │   │       node-which.cmd
                │   │       node-which.ps1
                │   │       tsc
                │   │       tsc.cmd
                │   │       tsc.ps1
                │   │       tsserver
                │   │       tsserver.cmd
                │   │       tsserver.ps1
                │   │       uuid
                │   │       uuid.cmd
                │   │       uuid.ps1
                │   │
                │   ├───@eslint
                │
                ├───out
                │   ├───bundles
                │   │       palm-demo-44b026db-ab7d-46c8-8d54-a2ff2d244c19.bundle.json
                │   │       palm-demo-97d170e1.bundle.json
                │   │
                │   └───sql
                │           palm-demo-44b026db-ab7d-46c8-8d54-a2ff2d244c19.seed.sql
                │           palm-demo-97d170e1.seed.sql
                │
                ├───palm-demo-44b026db-ab7d-46c8-8d54-a2ff2d244c19
                │   │   README.md
                │   │
                │   ├───gates
                │   │       gate-after-training-step-a010f2b2-3452-41b9-ad4f-240e2b71c0c7.md
                │   │       gate-phase-1-exit-0f3a6ec3-74c1-4c32-ae3f-1a2f0a4a31e8.md
                │   │
                │   ├───lifecycles
                │   │       standard-lifecycle-3a4f9a77-3a4c-466f-b03d-0b93df5f17ed.md
                │   │
                │   ├───models
                │   │       visionmodel-v1-5cb1c603-f88e-4802-ae2f-6ffa29142dc4.md
                │   │
                │   ├───phases
                │   │       01-phase-1-inception-6b9d7cbe-1d2e-4a34-acab-4da793e9f1a1.md
                │   │       02-phase-2-training-c3bd46b1-8c3f-4f11-9ab5-1324b62b1d9f.md
                │   │
                │   ├───steps
                │   │       01-collect-inputs-4d7f865e-8f8d-4fc7-a1bf-988c5550a1e0.md
                │   │       01-evaluate-model-e5c01c9f-4d7e-4caa-bbd5-71c69a9bc63b.md
                │   │       02-train-model-2f4b1de2-7c9a-4a9e-9b8a-1345b7a8e909.md
                │   │
                │   ├───tables
                │   │       workflow-states.md
                │   │
                │   ├───transitions
                │   │       next-3c5d7e9f-1a2b-4c3d-8e4f-5a6b7c8d9e0f.md
                │   │       next-4492aa32-3d94-5e1e-818d-e3240ae36a5b.md
                │   │       pass-to-phase-2-1a3b5c7d-9e0f-4a1b-8c2d-3e4f5a6b7c8d.md
                │   │       pass-to-phase-2-eac873ea-bc29-5787-8c1c-27180cdebd18.md
                │   │       proceed-to-evaluate-2b72d082-2451-540a-84a6-a55c55091f74.md
                │   │       proceed-to-evaluate-4d6e8f0a-2b3c-4d5e-9f6a-7b8c9d0e1f2a.md
                │   │       rework-previous-2b4c6d8e-0f1a-4b2c-9d3e-4f5a6b7c8d9e.md
                │   │       rework-previous-6754bcd5-3938-53fd-a5ae-d56ec13c1bb7.md
                │   │
                │   └───workflows
                │           wf-inception-0b5c2a1d-5e64-4b7e-b2ae-0d12a65b94fb.md
                │           wf-training-f9a5c3b1-4c5e-4a6f-9a97-9f0f11dc1a2e.md
                │
                ├───schemas
                │       exporter-bundle.v1.json
                │
                ├───scripts
                │       export-roundtrip.ts
                │       fs-utils.ts
                │       generate-md.ts
                │       generate-offline.ts
                │
                └───specs
                    └───palm-demo
                        │   palm.md
                        │
                        ├───gates
                        │       gate-after-training-step.md
                        │       gate-phase-1-exit.md
                        │
                        ├───lifecycles
                        │       standard-lifecycle.md
                        │
                        ├───models
                        │       visionmodel-v1.md
                        │
                        ├───phases
                        │       01-phase-1-inception.md
                        │       02-phase-2-training.md
                        │
                        ├───steps
                        │       01-collect-inputs.md
                        │       01-evaluate-model.md
                        │       02-train-model.md
                        │
                        ├───transitions
                        │       next.md
                        │       pass-to-phase-2.md
                        │       proceed-to-evaluate.md
                        │       rework-previous.md
                        │
                        └───workflows
                                wf-inception.md
                                wf-training.md

```

[`⇧ Back to Top`](#table-of-contents)  

---


# ✅ PaLM v1.3 Seed — Current Baseline

## 📂 Repo Path

```
{VisualStudioSolution}/{VisualStudioProject}/wwwroot/docs/palms
```

[`⇧ Back to Top`](#table-of-contents)  

---


## ⚙️ Generators in Place

Located in: `{VisualStudioSolution}/{VisualStudioProject}/wwwroot/docs/palms`

- **Generators**
  - `generate-offline.ts` → Produces JSON spec
  - `generate-md.ts` → Produces Markdown docs
- **Exporter**
  - `export-roundtrip.ts` → Consolidates into:
    - `out/bundles/*.bundle.json`
    - `out/sql/*.seed.sql`

[`⇧ Back to Top`](#table-of-contents)  

---

### Root Scripts (Windows-first)
```json
{
  "scripts": {
    "palms:roundtrip:win": "npm run palms:eol:docs && npm run palms:copy:latest && npm run palms:build && npm run palms:gen:md && npm run palms:export && npm run palms:eol:docs"
  }
}
```

1. **`generate-offline.ts`**

   * Converts JSON spec → docs
   * Ensures deterministic UUIDs (namespace in `palms.config.json`)
   * Normalizes gates (1 default transition per gate auto-enforced)

2. **`generate-md.ts`**

   * Converts JSON spec → Markdown
   * Proper YAML front-matter (quotes where needed, e.g. values with `:`)
   * Windows 10 safe (UTF-8 + CRLF)

3. **`export-roundtrip.ts`**

   * Consolidates Markdown → JSON bundle + SQL seed
   * SQL format = clean insert-ready with workflow states, lifecycles, gates, transitions

 4. **`normalize-eol.ps1`**
    * Ensures all files are UTF-8 + CRLF (Windows 10 safe)
    * Removes stray commas, BOM, hidden chars

 5. **`Copy-PalmBundleLatest.ps1`**
    * Copies latest bundle from `out/bundles` → `data/` for round-trip testing

6. **`palms.config.json`**
   * Configuration (e.g. UUID namespace)

7. **`workflow-states.json`**
   * Baseline workflow states (IDs 1–17 reserved)

8. **`palm-demo.json`**
   * Sample lifecycle spec (used for testing)
 
9. **`palm-demo-rt.json`**
   * Sample lifecycle spec (used for round-trip testing)

10. **`exporter-bundle.v1.json`**
    * JSON schema for bundle export validation

11. **`package.json`**
    * Node.js project config + dependencies

12. **`tsconfig.json`**
    * TypeScript compiler config

13. **`package-lock.json`**
    * Auto-generated lockfile for npm dependencies

14. **`node_modules/`**
    * Auto-generated npm dependencies (do not edit)

15. **`.eslintrc.cjs`** (optional)
    * ESLint config (if you want linting; see below for options)

16. **`.vscode/settings.json`** (optional)
    * VS Code settings (if you want to disable ESLint in workspace; see below for options)

17. **`.gitignore`**
    * Git ignore rules (e.g. `node_modules`, `out`, etc.)

18. **`.gitattributes`**
    * Git attributes (e.g. enforce CRLF on `.md` files)

19. **`README.md`**
    * This file (overview + instructions)

20. **`PalmRCL.sln`**
    * Visual Studio solution file

[`⇧ Back to Top`](#table-of-contents)  

---


## Static Web Assets Hygiene

Because Visual Studio runs `DefineStaticWebAssets` over `wwwroot/**`, we enforce:

- **Line endings**: CRLF (normalized by `tools/normalize-eol.ps1`)
- **Encoding**: UTF-8 without BOM
- **.gitattributes**: enforce CRLF, protect binaries
- **Validators**: PowerShell scripts to scan `wwwroot` and `obj/**` for illegal names or corrupted metadata

[`⇧ Back to Top`](#table-of-contents)  

---


## Troubleshooting

**Error: `Illegal characters in path` (DefineStaticWebAssets)**

1. Scan `wwwroot` for illegal filenames:
   ```powershell
   npm run palms:scan:badfiles
   ```
2. Purge caches:
   ```powershell
   dotnet clean
   rd /s /q PalmRCL\obj
   rd /s /q PalmRCL\bin
   ```
3. Regenerate docs and rebuild solution.

**Error: `Copy-Item cannot overwrite the item with itself`**
- Update to the latest `Copy-PalmBundleLatest.ps1` (includes skip logic).

**TypeScript complains about `readJson` or `__dirname`**
- You’re on an old exporter. The current exporter is **self-contained** (no external helpers) and ESM-safe.

[`⇧ Back to Top`](#table-of-contents)  

---


## 🚦 Current Status

* ✅ JSON generator working
* ✅ Markdown generator working
* ✅ SQL exporter working
* ✅ Deterministic UUID + normalization in place
* ⚠️ Visual Studio crash risk from hidden characters if not normalized properly

[`⇧ Back to Top`](#table-of-contents)  

---


## 🎯 Next Steps (v1.3 direction)

1. Fix `normalize-eol.ps1` → ensure no stray commas/args at char 466.
2. Harden SQL exporter (handle quoted strings, null vs empty).
3. Add round-trip validator: after export, re-import JSON bundle and diff against input.
4. Enhance logging (console + optional file logs for debug).
5. Prepare first **demo lifecycle spec** (`palm-demo`) with full phase/step/gate/transition coverage.

[`⇧ Back to Top`](#table-of-contents)  

---

## Option A — Disable ESLint in the IDE (quickest)

* **Visual Studio 2022**:
  `Tools → Options → Text Editor → JavaScript/TypeScript → Linting` → uncheck **Enable ESLint** → OK.
* **VS Code** (if that’s what you’re in):
  Command Palette → “**ESLint: Disable ESLint**” (choose **Workspace**),
  or create `.vscode/settings.json` under `wwwroot/docs/palms/`:

  ```json
  { "eslint.enable": false }
  ```

## Option B — Install a tiny ESLint setup (silences the banner; doesn’t change runtime)

From `wwwroot/docs/palms`:

```bash
npm i -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

`.eslintrc.cjs`:

```js
/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: { node: true, es2022: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { sourceType: 'module', ecmaVersion: 'latest' },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  ignorePatterns: ['dist/**', 'node_modules/**', '*.md'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off'
  }
};
```

(Optional) add a script:

```json
"scripts": {
  "lint": "eslint scripts --ext .ts"
}
```

## Option C — File-level silence (surgical)

At the very top of each generator (`generate-offline.ts`, `generate-md.ts`):

```ts
/* eslint-disable */
```

---

[`Home`](./README.md) · · [`⇧ Back to Top`](#table-of-contents)  

---

###### Copyright © 2025 - All Rights Reserved by Jason Silvestri


---

# PLM AI Lifecycle Models™ - PaLMs\{\}™ (v 1.3) - README.md (v2)

This is the latest version Lumina helped me create. I want to review before replacing the above.

# PLM AI Lifecycle Models™ — PaLMs{}™ (v1.3)

**PLM AI Lifecycle Model** (a.k.a. **PaLM\{\}**) is a structured model for **AI lifecycle design**, focused on clarity, determinism, and reusability.  

It provides a framework to define lifecycles, phases, workflows, steps, gates, and transitions, with generators and exporters to produce Markdown, JSON, and SQL artifacts. All operations are **Windows-first** to maintain Visual Studio stability and avoid `DefineStaticWebAssets` crashes.

---

[`Home`](./README.md)

---

## Draft Variant
> [!WARNING]  
> You are currently viewing the **Draft Variant** of this project section. Information will continue to evolve.

---

## Overview

The **PaLM\{\}** process leverages classic PLM (Product Lifecycle Management) design patterns to construct new AI-driven Lifecycle Models.  

These models are:
- Deterministic (UUID v5, reserved Workflow States),
- Relational (junction rules enforced),
- Expandable through Markdown + JSON specs,
- Exportable to SQL seeds for integration.

PaLM\{\} lifecycles have already been applied to:
- **Scott Hall Case** (legal lifecycles, e.g. `MasterLifecyclePacket`),
- **Official Bigfoot Vlog** (creative storyboarding lifecycle, e.g. `UltimateStoryBoard`),
- Cross-domain reuse (legal + creative lifecycles unified).

---

# Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [PaLM\{\} Autonomy](#palm-autonomy)
- [Workflow States](#workflow-states)
- [Junction Rules](#junction-rules)
- [PaLM\{\} Formula (Cheat-Sheet)](#palm-formula-cheat-sheet)
- [Model Objects](#model-objects)
- [Windows 10 Constraints](#windows-10-constraints)
- [Expanding Lifecycles](#expanding-lifecycles)
- [Rapid Add-a-Phase Recipe](#rapid-add-a-phase-recipe)
- [File Structure](#file-structure)
- [PaLM v1.3 Seed — Baseline](#palm-v13-seed--baseline)
- [Generators in Place](#generators-in-place)
- [Static Web Assets Hygiene](#static-web-assets-hygiene)
- [Troubleshooting](#troubleshooting)
- [Current Status](#current-status)
- [Next Steps (v1.3)](#next-steps-v13)
- [ESLint Options](#eslint-options)
- [License](#license)

---

## Prerequisites

- Visual Studio **17.14.8**
- .NET Framework **9.0.1**
- ASP.NET Core **9.0.1**
- Node.js **20.14.0**
- npm **10.8.1**
- Python **3.12.3**

---

## PaLM\{\} Autonomy

Once defined and validated, lifecycles can manage their own state transitions based on enforced rules. This allows PaLM\{\} to dynamically adapt to both **legal** and **creative** project contexts.

---

## 📜 Workflow States
- **IDs 1–17 (INT)** → reserved, deterministic baseline (Started, Skipped, Completed, etc.)  
- **GUIDs** → everything else (Models, Lifecycles, Workflows, Steps, Gates, Transitions)

---

## 🔗 Junction Rules
- PaLM\{\} ↔◼↔ Model  
- Model ↔◼↔ WorkflowState  
- Model ↔◼↔ Lifecycle  
- Lifecycle →◼+← LifecyclePhase  
- LifecyclePhase ↔◼1↔ Workflow  
- Workflow →◼+← WorkflowStep  
- LifecyclePhase ↔◼↔ PhaseGate  
- WorkflowStep ↔◼↔ PhaseGate  
- PhaseGate →◼+← GateTransition  

**Rules:**  
- Gates anchor at **phases or steps**.  
- Transitions: **Absolute** (targetPhase / targetStep) or **Relative** (Next / Previous).  
- Exactly **one default per gate** (auto-normalized).

---

## 📐 PaLM\{\} Formula (Cheat-Sheet)

- **Model** ↔ **WorkflowState** (1..17 INT)  
- **Model** ↔ **Lifecycle**  
- **Lifecycle** → **LifecyclePhase** (ordered)  
- **LifecyclePhase** ↔ **Workflow** (unique per phase)  
- **Workflow** → **WorkflowStep** (ordered)  
- **LifecyclePhase** ↔ **PhaseGate**; **WorkflowStep** ↔ **PhaseGate**  
- **PhaseGate** → **GateTransition** (≥1; one default)  
- Transitions: **Absolute** (targetPhase/targetStep) or **Relative** (Next/Previous)  
- IDs: deterministic UUIDv5 (namespace in `palms.config.json`); states are fixed INTs  

---

## Model Objects

### Models
- Represent AI models (e.g. `visionmodel-v1`).

### Lifecycles
- Top-level containers of process.  
- Deterministic UUID + ordered phases.

### Lifecycle Phases
- Ordered segments; anchor Workflows + Gates.

### Workflows
- Define process sequences within phases.  
- Linked to Workflow Steps.

### Workflow Steps
- Atomic actions/states inside Workflows.  
- Can connect to Gates.

### Phase Gates
- Anchored at Phase or Step.  
- Govern allowed transitions.

### Gate Transitions
- Multiple per Gate; one must be default.  
- Absolute vs. Relative targeting.

---

## 🖥️ Windows 10 Constraints
- All scripts run on **Windows 10 + Node.js 20.14**  
- **CRLF** enforced by `tools/normalize-eol.ps1`  
- **UTF-8 without BOM** encoding enforced  
- Pipeline:
  ```
  Normalize → Copy latest → Build (tsc) → Gen:md → Export → Normalize
  ```

---

## Expanding Lifecycles

1. Add JSON spec (`specs/<lifecycle>/*.md`).  
2. Run generators:  
   ```powershell
   npm run palms:gen:md
   npm run palms:gen:json
   npm run palms:roundtrip:win
   ```  
3. Export round-trip:  
   ```powershell
   npm run palms:export
   ```  
4. Verify SQL seed (`out/sql/*.seed.sql`).  
5. Commit + push docs + outputs.

---

## 🚀 Rapid Add-a-Phase Recipe
1. Create `specs/<model>/phases/XX-new-phase.md`.  
2. Link a workflow (`workflows/wf-*.md`) and steps (`steps/*.md`).  
3. Add gates + transitions (`gates/*.md`, `transitions/*.md`), enforce one default.  
4. Run:
   ```powershell
   npm run palms:gen:md
   npm run palms:export
   npm run palms:eol:docs
   ```  
5. Rebuild solution:
   ```powershell
   dotnet build
   ```

---

## File Structure
*(simplified for clarity)*

```
PalmRCL
│   PalmRCL.sln
│   package.json
│   README.md
│
└── tools/
│    Copy-PalmBundleLatest.ps1
│    normalize-eol.ps1
│    Validate-StaticWebAssets.ps1
│
└── PalmRCL/
    PalmRCL.csproj
    wwwroot/
      docs/
        palms/
          package.json
          palms.config.json
          workflow-states.json
          scripts/
            generate-offline.ts
            generate-md.ts
            export-roundtrip.ts
          dist/
          out/bundles/
          out/sql/
          specs/
```

---

## ✅ PaLM v1.3 Seed — Baseline

Repo path:  
```
{Solution}/{Project}/wwwroot/docs/palms
```

---

## ⚙️ Generators in Place
- **generate-offline.ts** → JSON spec → docs  
- **generate-md.ts** → JSON spec → Markdown  
- **export-roundtrip.ts** → Markdown → bundle + SQL  
- **normalize-eol.ps1** → CRLF + UTF-8 (no BOM)  
- **Copy-PalmBundleLatest.ps1** → safe copy (skip if dest=src)  
- **Validate-StaticWebAssets.ps1** → scans wwwroot + obj  

Root script:  
```json
{
  "scripts": {
    "palms:roundtrip:win": "npm run palms:eol:docs && npm run palms:copy:latest && npm run palms:build && npm run palms:gen:md && npm run palms:export && npm run palms:eol:docs"
  }
}
```

---

## Static Web Assets Hygiene
- `.gitattributes`: enforce CRLF, mark binaries.  
- Always run:
  ```powershell
  npm run palms:eol:docs
  ```
- Validate:
  ```powershell
  npm run palms:scan:static
  ```

---

## Troubleshooting

**Illegal characters in path (DefineStaticWebAssets)**  
1. Run `npm run palms:scan:static`.  
2. If hits: fix filenames or purge `obj/bin`.  
3. Clean + rebuild.

**Copy-Item overwrite error**  
- Use updated `Copy-PalmBundleLatest.ps1` (with skip logic).

**TypeScript errors (`readJson`, `__dirname`)**  
- Ensure exporter = self-contained version (ESM-safe).

---

## 🚦 Current Status
- ✅ JSON generator works  
- ✅ Markdown generator works  
- ✅ SQL exporter works  
- ✅ Deterministic UUID + normalization in place  
- ⚠️ Visual Studio may crash if metadata caches (`obj/**`) not cleaned/validated  

---

## 🎯 Next Steps (v1.3)
1. Harden `normalize-eol.ps1` (no stray commas).  
2. Harden SQL exporter (quote handling).  
3. Add round-trip validator (diff input vs export).  
4. Enhance logging (console + file).  
5. Demo lifecycle spec with full phase/step/gate/transition coverage.

---

## ESLint Options
- **Disable in IDE** (quick)  
- **Install local ESLint** (`npm i -D eslint …`)  
- **File-level silence** (`/* eslint-disable */`)  

---

## License
MIT

---

###### Copyright © 2025 — All Rights Reserved by Jason Silvestri

---

Third version of README.md complete.

# PLM AI Lifecycle Models™ (PaLMs{}™) — PalmRCL (v1.3 Seed)

> **Status:** ✅ Visual Studio solution builds clean with **zero compile errors** because **generators/exporters have NOT been run** (by design).  
> **OS Target:** Windows 10  
> **IDE:** Visual Studio 2022 (17.14.x)  
> **.NET:** 9.0.1 (ASP.NET Core 9.0.1 / Blazor 9.0.1)  
> **Node:** 20.14.0 • **npm:** 10.8.1

---

## What’s New in v1.3

- Solidified **offline docgen** architecture: **JSON → Markdown → SQL** flows
- Scripts (TypeScript, ES Modules):  
  - `scripts/generate-offline.ts` (JSON → docs)  
  - `scripts/generate-md.ts` (MD-spec → docs)  
  - `scripts/export-roundtrip.ts` (MD → consolidated JSON bundle + SQL-ready seed)
- Deterministic **UUID v5** namespace: `6f0e5f9f-7f3a-41bf-b969-9e2b7d2f9b21`
- Canonical **17 Workflow States**
- **Normalization rules**: exactly one default transition per gate (auto-enforced in gen/export)
- **Windows-only EOL normalization** to avoid VS crashes from hidden chars: `tools/normalize-eol.ps1`

---

## Golden Restore Points (Read First)

1) **Attached ZIP (Baseline Snapshot)**  
   The attached ZIP in this repo/distribution contains the absolute latest files, and the Visual Studio project builds with **no compile errors** because **no generators/exporters have been run** yet (by design). This ZIP is a clean baseline.

2) **Public GitHub Mirror (Baseline)**  
   Repo: `https://github.com/JasonSilvestri/PalmRCL` (public for now).  
   This is the **same baseline** as the attached ZIP: the project builds with **no compile errors** in Visual Studio because **no generators/exporters have been run** (by design).  
   Use this as a stable checkpoint to **revert after any tests** from this point forward.

> **Recommendation:** Tag this baseline in Git (`v1.3-baseline`) so it’s one command to restore:
> ```bash
> git tag v1.3-baseline
> git push origin v1.3-baseline
> ```

---

## Repository Layout (Key Paths)

> The uploaded ZIP includes a full working tree including `PalmRCL/PalmRCL/wwwroot/docs/palms` and Node workspace files. If you need a quick glance at structure, check `PalmRCLv1.3-zip-summary.txt` (shallow tree + notable files).

- `PalmRCL.sln` — Solution  
- `PalmRCL/` — Web project (ASP.NET Core)  
  - `wwwroot/docs/palms/` — offline docs workspace (Node project)  
    - `package.json` / `tsconfig.json` / `node_modules/`  
    - `scripts/` — `generate-offline.ts`, `generate-md.ts`, `export-roundtrip.ts`  
    - `data/` — seeds/specs (JSON/MD)  
    - `docs/` — generated outputs  
- `tools/`  
  - `normalize-eol.ps1` — **Windows** line-ending normalizer (prevents VS hidden-char crashes)

---

## Requirements

- **Windows 10**
- **Visual Studio 2022** 17.14.x (with .NET 9 workload)
- **.NET 9.0.1 SDK**
- **Node.js 20.14.0** and **npm 10.8.1**
- PowerShell 7.x+ recommended for scripts

> If your environment differs, lock to these versions while validating v1.3 seed.

---

## Setup (Safe Mode — No Generators)

1. **Clone the baseline** (GitHub mirror of the ZIP):
   ```bash
   git clone https://github.com/JasonSilvestri/PalmRCL.git
   cd PalmRCL
   ```
2. **Open in Visual Studio** and build the solution.  
   Expected: **0 compile errors** (because generators/exporters not yet invoked).
3. Optional (**Strongly Recommended**): Create a tag before any experiments:
   ```bash
   git tag v1.3-baseline
   git push origin v1.3-baseline
   ```

---

## Revert / Restore Strategy

- **From Git tag**:
  ```bash
  git fetch --all --tags
  git checkout v1.3-baseline
  ```
- **From the attached ZIP**:
  1. Backup current working directory.  
  2. Extract the ZIP over the repo root (or into a fresh folder).
  3. Open the solution in Visual Studio and build (should be clean again).

> Keep the attached ZIP and the Git tag as **immutable baselines**. Any test that mutates generated assets can be undone by re‑checking out the tag or re‑extracting the ZIP.

---

## NPM Workflows (Windows)

All commands below presume you’re inside `PalmRCL/PalmRCL/wwwroot/docs/palms`.

> **Safety tip:** Run these only when you’re **ready to generate** artifacts.

- **Install**:
  ```bash
  npm ci
  ```

- **Normalize EOL (Windows only)**:
  ```bash
  # from repo root
  powershell -ExecutionPolicy Bypass -File tools/normalize-eol.ps1 -Root PalmRCL/PalmRCL/wwwroot/docs/palms
  ```

- **Build TypeScript**:
  ```bash
  npm run build
  ```

- **Generate Markdown from JSON**:
  ```bash
  npm run gen:offline     # wraps scripts/generate-offline.ts
  ```

- **Generate Markdown from MD-spec**:
  ```bash
  npm run gen:md          # wraps scripts/generate-md.ts
  ```

- **Export Roundtrip (MD → JSON bundle + SQL)**:
  ```bash
  npm run roundtrip       # wraps scripts/export-roundtrip.ts
  ```

> Your root `package.json` may also provide convenience metas (e.g., `palms:roundtrip:win`) chaining **EOL → copy → build → gen:md → EOL**. Use the **Windows** one only.

---

## Known Stability Practices

- **EOL normalization first** (Windows-only). Prevents “hidden-char” issues that can crash Visual Studio or corrupt files.
- **Run Windows-specific scripts only on Windows** (avoid mixed shell runs).
- **Don’t commit transient generated outputs** until you’re satisfied with diff and integrity.
- **One default transition per gate** is auto-normalized—don’t hand-edit to add multiple defaults.

---

## Troubleshooting

- **Visual Studio crashes or odd diffs after gen/export**
  - Run `tools/normalize-eol.ps1` against the docs folder.
  - Close VS, delete `.vs/`, `bin/`, `obj/`, re-open and rebuild.

- **Generators fail after a clean baseline**
  - Ensure `npm ci` ran in `wwwroot/docs/palms/`.
  - Confirm Node 20.14.0 and npm 10.8.1.
  - Re-check paths for `data/` and `docs/` in scripts.

- **SQL bundle looks off**
  - Re-run roundtrip exporter and verify that the MD sources follow the spec (front-matter quoting for values with colons, etc.).
  - Confirm single default gate transition is present after normalization.

---

## Design Rules (Authoritative)

- **UUID v5** deterministic IDs for non-INT entities (namespace above)
- **Workflow States**: fixed 1–17 (INT)
- **Gate transitions**: exactly one default per gate (exporter will enforce)
- **YAML front‑matter**: quote values containing colons or special characters
- **Windows line endings** in generated assets (normalize as needed)

---

## Roadmap

- Harden `palms:roundtrip:win` metascript and logs
- Add **git guardrails** (pre‑commit hook to prevent accidental commit of unstable gens)
- Auto‑tag stable outputs (`v1.3-gen-ok`, etc.)
- CI job for **Windows** runner that validates the sequence (optional)

---

## License / Status

- Internal development under the **PaLMs{}™** effort.  
- GitHub mirror currently **public** for testing/logistics; will be privatized later.

---

###### Copyright © 2025 — All Rights Reserved by Jason Silvestri