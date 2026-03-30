# Stage 3 MVP Overall Architecture

## Journey View

```mermaid
flowchart LR
    A["Entry"] --> B["Goal"]
    B --> C["Equipment"]
    C --> D["Quick Intake"]
    D --> E["Recommendation"]
    E --> F["Preparation"]
    F --> G["Session Runtime"]
    G --> H["Feedback"]
    H --> I["Next Step"]

    C --> J["Yoga Ball"]
    C --> K["Other Equipment"]
    C --> L["No Equipment"]

    J --> E
    K --> E
    L --> E

    G --> M["Exit / Recovery"]
    H --> M
    M --> E
    M --> F
    M --> I
```

## Layer View

```mermaid
flowchart TD
    A["Acquisition Layer\nQR / Direct Open"] --> B["Intent Layer\nGoal + Equipment + Intake"]
    B --> C["Decision Layer\nRecommendation + Why This Plan"]
    C --> D["Execution Layer\nPrep + Runtime + Timers + Voice"]
    D --> E["Outcome Layer\nFeedback + Next Step"]

    F["Content Layer\nYoga Ball Templates First\nOther Equipment Templates\nNo Equipment Templates"] --> C
    F --> D

    G["Analytics Layer\nEntry / Goal / Equipment / Plan / Session / Feedback"] --> B
    G --> C
    G --> D
    G --> E

    H["Governance Layer\n3-day Feedback\nKey Result Review\nPM Confirmation"] --> A
    H --> E
```

## Page Responsibility Summary

| Page | Main job | Minimum output |
|---|---|---|
| Entry | Start the MVP with confidence | User chooses to begin |
| Goal | Capture training intent | One selected goal |
| Equipment | Capture available setup | One or more equipment selections, including yoga ball / other / none |
| Quick Intake | Capture minimum context | Experience, time, restriction, intensity preference |
| Recommendation | Present suggested session | Start decision |
| Preparation | Prepare user and runtime options | Ready-to-start state |
| Session Runtime | Guide execution | Step progression and completion/exit state |
| Feedback | Capture result | Session outcome |
| Next Step | Route forward | Repeat / continue / prep review / support |
