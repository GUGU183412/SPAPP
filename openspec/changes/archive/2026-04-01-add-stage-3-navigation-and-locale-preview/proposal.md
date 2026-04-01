## Why

The current Stage 3 flow is intentionally linear, but it is still missing a safe navigation layer for real product use and stakeholder review. We need to add context-safe return behavior, targeted editing paths, and an English preview mode now so the app can support demos, overseas review, and future internationalization without breaking the low-cognitive-load journey.

## What Changes

- Add a Stage 3 navigation control layer that lets users return home safely and revise previously selected inputs without exposing unrestricted page jumping in the normal user flow.
- Add a hidden preview mode for internal review, QA, and demos that can jump to any major Stage 3 page with seeded state.
- Add a locale preview capability so the UI can switch between Chinese and English without resetting the current page context.
- Refine Stage 3 flow requirements so review and prep screens expose "edit what matters" actions instead of generic backtracking.
- Refine Stage 3 runtime requirements so exit, recovery, and locale-switch behavior remain predictable before, during, and after a session.

## Capabilities

### New Capabilities
- `stage-3-navigation-control-center`: Defines context-safe return home behavior, targeted edit navigation, and a hidden preview-only page switcher for Stage 3.
- `locale-preview-switching`: Defines Chinese and English UI preview behavior, locale persistence, URL overrides, and same-context language switching.

### Modified Capabilities
- `stage-3-frontend-interaction-flow`: Expands return and recovery behavior so users can revise earlier choices from later pages without turning the primary journey into an unrestricted free-jump flow.
- `stage-3-training-session-runtime`: Expands recommendation, prep, runtime, and post-session requirements so navigation exits and locale changes behave consistently across active training surfaces.

## Impact

- Affected code: [index.tsx](/F:/Users/Administrator/Desktop/SPAPP/index.tsx), [docs/design-spec.md](/F:/Users/Administrator/Desktop/SPAPP/docs/design-spec.md)
- Affected product behavior: home return, late-stage editing, preview-only page access, and bilingual UI review
- Affected state model: route-level state retention, preview-mode gating, locale persistence, and locale-aware copy management
- Affected validation: Stage 3 flow checks will need coverage for contextual return paths, hidden preview mode, and Chinese/English switching
