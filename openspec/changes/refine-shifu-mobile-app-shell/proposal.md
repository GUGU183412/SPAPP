## Why

The current Stage 3 front-end shell still behaves like a desktop demo or explanatory landing page instead of a clean iPhone-friendly app flow. Users scanning on iOS still see the old Stage 2 product identity and too much non-essential content before they can begin training.

## What Changes

- Replace the remaining desktop/demo-shell patterns with a mobile-first single-column interaction flow.
- Simplify the entry screen so it behaves like an app start page instead of a concept or presentation page.
- Remove internal, explanatory, or non-user-facing information from the in-product UI.
- Update the web title, manifest identity, and PWA-facing naming to `Shifu`.
- Tighten Stage 3 runtime screens so prep, session, feedback, and next-step pages read as task pages rather than information panels.

## Capabilities

### New Capabilities
- `pwa-app-identity`: Defines the browser title, manifest name, short name, and app-facing descriptive identity for the Shifu product shell.

### Modified Capabilities
- `stage-3-frontend-interaction-flow`: Refines the Stage 3 flow so each page is mobile-first, single-column, and focused on one user action at a time.
- `stage-3-training-session-runtime`: Refines prep, session, feedback, and next-step behavior so runtime pages fit an iPhone app shell without desktop-style side content.

## Impact

- Affected code: [index.tsx](/F:/Users/Administrator/Desktop/SPAPP/index.tsx), [index.html](/F:/Users/Administrator/Desktop/SPAPP/index.html), [manifest.webmanifest](/F:/Users/Administrator/Desktop/SPAPP/manifest.webmanifest)
- Affected specs: Stage 3 interaction flow, Stage 3 runtime, and a new PWA identity capability
- Affected UX: iPhone scan-entry experience, browser title, PWA installation identity, and page-level content hierarchy
