## Why

Stage 3 is ready to move from a tutorial-style PoC into a real MVP build, but the repository still lacks an implementation-ready contract for the new front-end experience. We need to freeze the goal-driven interaction flow, page responsibilities, and runtime shell now so development can start quickly without drifting away from the updated product direction.

## What Changes

- Define the Stage 3 front-end interaction flow as the new primary product journey, replacing the Stage 2 tutorial sequence as the main shell.
- Define the required page sequence, branching logic, CTA behavior, and recovery paths for the MVP journey.
- Define the Stage 3 session runtime shell covering recommendation, prep, follow-along execution, timer support, voice support, and feedback capture.
- Prioritize yoga-ball training template integration for the first content library while preserving multi-equipment and no-equipment selection in onboarding.
- Add a visual overall MVP architecture view so product, engineering, and operations can align on the same implementation model.
- Add delivery guidance for a compressed 2-3 week build window with progress feedback every 3 days and at each key result checkpoint.

## Capabilities

### New Capabilities
- `stage-3-frontend-interaction-flow`: Defines the Stage 3 page sequence, branching rules, entry behavior, exit handling, and page-level functional responsibilities for the goal-driven MVP.
- `stage-3-training-session-runtime`: Defines the recommendation, preparation, follow-along, timer, voice, feedback, and next-step behaviors required by the Stage 3 runtime shell.

### Modified Capabilities
- `poc-analytics-tracking`: Expands the tracked funnel from the Stage 2 tutorial flow to the Stage 3 goal, equipment, recommendation, runtime, and session feedback flow.

## Impact

- Affected code: [index.tsx](/F:/Users/Administrator/Desktop/SPAPP/index.tsx), the current front-end shell, routing/state model, and Stage 3 screen implementation files that will replace the tutorial-first flow.
- Affected content model: yoga-ball-first template seeding, recommendation inputs, prep content mapping, and runtime step definitions.
- Affected analytics: event naming and placement for onboarding, recommendation, session runtime, exit, and feedback.
- Affected delivery workflow: the Stage 3 team needs a short-cycle checkpoint rhythm every 3 days plus milestone reviews with项目经理田楚.
