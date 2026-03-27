## Why

Stage 1 has already narrowed the product to a single high-priority ASIN (`B0BXJLTRSH`), a single high-value scenario, and a clear 3-step installation tutorial with feedback collection. Stage 2 needs a working PWA proof of concept that validates whether this guided flow can actually reduce confusion, collect resolution outcomes, and return actionable unresolved reasons.

## What Changes

- Build a stage-2 PWA proof of concept for the first ASIN with a runnable closed-loop flow from landing page through tutorial completion.
- Implement the guided installation experience across Landing, Step 1, Step 2, Step 3, Feedback, and Unresolved Reason pages.
- Add structured content support so the first SKU can be rendered from data rather than hard-coded page logic.
- Add minimal analytics instrumentation for entry, tutorial progress, resolution status, unresolved reasons, and dropout behavior.
- Prepare the implementation for mobile scan entry, lightweight deployment, and stage-2 validation demos.

## Capabilities

### New Capabilities
- `guided-installation-flow`: Deliver the stage-2 PWA closed-loop flow for the first door anchor strap SKU, including landing, the 3 tutorial steps, and navigation between them.
- `resolution-feedback-loop`: Collect resolved vs unresolved outcomes, capture unresolved reasons, and guide users back to the most relevant recovery step.
- `poc-analytics-tracking`: Record the minimum event set needed to evaluate scan entry, tutorial completion, safety proof engagement, unresolved reasons, and funnel drop-off.

### Modified Capabilities
- None.

## Impact

- Affected code: front-end app shell, routes, page components, content data structures, and event tracking integration.
- Affected systems: stage-2 PoC analytics setup and deployment target.
- Dependencies: PWA configuration, lightweight content source, and analytics provider or export mechanism for validation.
