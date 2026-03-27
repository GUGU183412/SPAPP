## Why

Stage 2 already delivers a working public PoC with live flow logic, analytics events, GitHub Pages deployment, and QR access, but the production UI does not match the archived high-fidelity mockups that were approved as the visual baseline. We need to restore visual parity now so the demo can support stakeholder review without regressing the validated business flow.

## What Changes

- Restore the Landing, Step 1, Step 2, Step 3, Feedback, and Unresolved screens to align with the archived high-fidelity HTML mockups under `docs/ui-mockups/`.
- Preserve the existing Stage 2 navigation flow, ASIN-driven entry behavior, unresolved follow-up routing, and analytics event model while rebuilding the screen layouts.
- Remove or relocate temporary PoC-only UI elements that break presentation quality, such as the on-screen event log panel in the main user flow.
- Reuse the current single-page app architecture and deployment setup so the public GitHub Pages demo URL and QR assets remain valid after the visual restoration.

## Capabilities

### New Capabilities
- `stage-2-high-fidelity-ui`: Defines the required visual parity between the Stage 2 React app and the archived high-fidelity screen mockups while preserving the approved Stage 2 flow logic and analytics behavior.

### Modified Capabilities
- None.

## Impact

- Affected code: [index.tsx](/F:/Users/Administrator/Desktop/SPAPP/index.tsx), shared styling in the React entry experience, and any helper structures used to render screen-specific content.
- Reference assets: [docs/ui-mockups/landing-page-v1.html](/F:/Users/Administrator/Desktop/SPAPP/docs/ui-mockups/landing-page-v1.html), [docs/ui-mockups/step1-v2.html](/F:/Users/Administrator/Desktop/SPAPP/docs/ui-mockups/step1-v2.html), [docs/ui-mockups/step2-v1.html](/F:/Users/Administrator/Desktop/SPAPP/docs/ui-mockups/step2-v1.html), [docs/ui-mockups/step3-v2.html](/F:/Users/Administrator/Desktop/SPAPP/docs/ui-mockups/step3-v2.html), [docs/ui-mockups/feedback-v1.html](/F:/Users/Administrator/Desktop/SPAPP/docs/ui-mockups/feedback-v1.html), and [docs/ui-mockups/unresolved-reason-v2.html](/F:/Users/Administrator/Desktop/SPAPP/docs/ui-mockups/unresolved-reason-v2.html).
- Systems preserved: GitHub Pages deployment, `asin` query entry, Stage 2 QR access path, and existing analytics events.
