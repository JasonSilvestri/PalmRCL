# PLM AI Lifecycle Models™ - PaLMs{}™

---
{
  "type": "PaLM",
  "id": "44b026db-ab7d-46c8-8d54-a2ff2d244c19",
  "name": "PaLM{} Demo",
  "slug": "palm-demo",
  "storage": {
    "rootGitHub": "https://github.com/JasonSilvestri/PalmRCL.git",
    "rootWebTree": "https://github.com/JasonSilvestri/PalmRCL/tree/master/PalmRCL",
    "rawPrefix": "https://raw.githubusercontent.com/JasonSilvestri/PalmRCL/master/PalmRCL",
    "documentsRoot": "PalmRCL/wwwroot/documents",
    "cameraRoot": "PalmRCL/wwwroot/Videos/Camera",
    "fileContentPath": "wwwroot/Project/OurFirstPaLM/README.md",
    "filePath": "PalmRCL/wwwroot/Project/OurFirstPaLM/README.md"
  },
  "generatedAt": "2025-08-24T00:35:33.733Z"
}
---
# PaLM{} Demo (44b026db-ab7d-46c8-8d54-a2ff2d244c19)

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
- [VisionModel v1](/docs/palms/palm-demo-44b026db-ab7d-46c8-8d54-a2ff2d244c19/models/visionmodel-v1-5cb1c603-f88e-4802-ae2f-6ffa29142dc4.md)

### Lifecycles
- [Standard Lifecycle](/docs/palms/palm-demo-44b026db-ab7d-46c8-8d54-a2ff2d244c19/lifecycles/standard-lifecycle-3a4f9a77-3a4c-466f-b03d-0b93df5f17ed.md)

### Workflow States (snapshot)
See: [/docs/palms/palm-demo-44b026db-ab7d-46c8-8d54-a2ff2d244c19/tables/workflow-states.md](/docs/palms/palm-demo-44b026db-ab7d-46c8-8d54-a2ff2d244c19/tables/workflow-states.md)
