## Context

Stage 2 currently runs as a single-file React application in [index.tsx](/F:/Users/Administrator/Desktop/SPAPP/index.tsx). The app already preserves the critical business flow: QR or direct entry by `asin`, landing-to-step navigation, feedback submission, unresolved reason routing, analytics event logging, and GitHub Pages deployment.

The current implementation intentionally simplified the UI into a generic PoC visual shell. That simplification created a mismatch with the archived high-fidelity mockups under [docs/ui-mockups](/F:/Users/Administrator/Desktop/SPAPP/docs/ui-mockups), especially for Landing, Step 1, Step 2, Step 3, Feedback, and Unresolved screens. Stakeholder review now depends on restoring those screens to the approved visual baseline without regressing the validated Stage 2 logic.

Constraints:
- Keep the public demo route shape and `asin` query behavior unchanged.
- Preserve all currently implemented analytics events and event timing semantics.
- Avoid introducing deployment changes that would invalidate the existing GitHub Pages or QR setup.
- Keep the app maintainable; avoid hardcoding six fully separate static pages with duplicated flow logic.

## Goals / Non-Goals

**Goals:**
- Rebuild the Stage 2 screen presentation so the React app visually aligns with the archived mockups for Landing, Step 1, Step 2, Step 3, Feedback, and Unresolved follow-up.
- Preserve the existing user flow, branching logic, and analytics behavior while replacing only the presentation layer where possible.
- Remove presentation-breaking PoC-only UI from the primary user experience, especially the visible event log panel.
- Keep the current single-page app deployment model intact so the public Pages URL and QR assets remain valid.

**Non-Goals:**
- Changing the Stage 2 information architecture, navigation order, or unresolved reason mapping.
- Introducing new analytics events or replacing the current tracking model.
- Reworking hosting, routing, or QR generation infrastructure.
- Building a generic design system or page builder beyond what is needed to restore the six approved screens.

## Decisions

### Decision 1: Preserve the existing flow state machine and replace the screen rendering layer

The current app already encodes the approved Stage 2 business logic in one place: current step state, ASIN resolution, step completion, feedback submission, unresolved routing, and analytics triggers. Replacing that logic would create unnecessary risk.

We will keep the existing flow state model and event triggers, but rework each screen’s JSX structure and CSS so the visible layout matches the approved mockups. This separates logic safety from visual restoration.

Alternatives considered:
- Rewrite the app from archived HTML verbatim: rejected because it would duplicate state logic and likely break analytics wiring.
- Keep the current structure and only patch a few CSS rules: rejected because the current implementation is structurally different from the mockups, not just stylistically different.

### Decision 2: Introduce screen-specific presentation components or render helpers inside the current app

The current single render block mixes flow logic and simplified UI. To restore fidelity without creating six unrelated pages, each main screen should render through a screen-specific component or helper with its own layout structure.

This allows:
- Landing to regain the hero image, overlay, CTA section, and fixed footer.
- Step pages to regain their unique editorial structure instead of sharing one generic step card.
- Feedback and Unresolved pages to regain their page-specific layouts without duplicating navigation logic.

Alternatives considered:
- Keep a single generic `step` renderer: rejected because Step 1, 2, and 3 each require distinct visual hierarchy and media treatment.
- Split into separate route files: rejected because current deployment and state handling do not require multi-route complexity.

### Decision 3: Use the archived mockups as the canonical visual contract

The mockups in [docs/ui-mockups](/F:/Users/Administrator/Desktop/SPAPP/docs/ui-mockups) will be treated as the baseline source of truth for layout hierarchy, page-specific copy emphasis, hero media treatment, fixed navigation structure, and support affordances.

Where mockups differ slightly across variants already archived, implementation will follow the latest approved version used during the Stage 2 review:
- Landing: `landing-page-v1.html`
- Step 1: `step1-v2.html`
- Step 2: `step2-v1.html`
- Step 3: `step3-v2.html`
- Feedback: `feedback-v1.html`
- Unresolved: `unresolved-reason-v2.html`

Alternatives considered:
- Infer a new unified visual language from the current React implementation: rejected because the current mismatch is the problem we are correcting.

### Decision 4: Remove the visible event log from the user-facing viewport while retaining local tracking behavior

The floating PoC event console is useful for debugging but breaks mobile presentation quality and is not part of the approved UI. The event tracker itself should remain unchanged, but the visible console should be removed from the default demo experience.

If future debugging needs remain, a separate non-default debug mode can be introduced later, but that is outside this change.

Alternatives considered:
- Keep the event console visible for stakeholder demos: rejected because it undermines the presentation quality we are restoring.
- Delete tracking storage entirely: rejected because analytics continuity is part of the preserved business behavior.

### Decision 5: Keep image assets and visual treatments source-compatible with current deployment

The mockups reference remote image URLs and existing font imports. The implementation should preserve working asset loading under GitHub Pages and avoid introducing path-sensitive local media changes unless strictly necessary.

This keeps the visual restoration compatible with the current Pages build and avoids reopening deployment risk.

Alternatives considered:
- Migrate all media to bundled local assets immediately: rejected for this change because it increases scope and deployment surface.

## Risks / Trade-offs

- [Visual parity may still drift if mockup structure is only approximated] → Use the archived mockup files as the implementation baseline and validate screen-by-screen against them during implementation.
- [Preserved logic may constrain exact mockup interaction behavior] → Prioritize visual fidelity while keeping current successful flow semantics; only adapt interactions where the mockup structure can coexist with existing logic.
- [Single-file implementation may become harder to read] → Extract page-level render helpers or components to keep logic and presentation separated even if the app remains single-entry.
- [Remote image dependencies may fail or change outside the repo] → Keep the current URLs for scope control, but note this as a later hardening opportunity if the demo needs more control.

## Migration Plan

1. Keep the current public URL, QR assets, and deployment workflow unchanged.
2. Refactor the React entry app so each Stage 2 screen renders its approved high-fidelity layout while preserving existing state and tracking.
3. Remove the visible PoC event console from the default user-facing view.
4. Run a production build and verify the public demo still supports the same `asin` entry path and flow completion behavior.
5. Re-compare the restored screens against the archived mockups before closing the change.

Rollback strategy:
- Revert the UI restoration commit set while keeping the already archived Stage 2 publishing and QR changes intact.

## Open Questions

- None for artifact creation. The visual baseline and scope are now sufficiently defined by the archived mockups and the current Stage 2 business behavior.
