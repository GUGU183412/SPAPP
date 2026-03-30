## Context

The Stage 3 implementation successfully moved the product away from the Stage 2 tutorial route map, but the current UI shell still carries the wrong delivery shape. On iPhone, users encounter a browser page with an outdated title, a mixed product identity, and an entry layout that still behaves like a presentation screen instead of an app task flow.

The current code also has two practical constraints:

- The interface is implemented in a single [index.tsx](/F:/Users/Administrator/Desktop/SPAPP/index.tsx) shell, so content hierarchy and layout changes are cross-cutting.
- The file contains historical encoding pollution in some copy, so UX cleanup must favor stable, narrow edits and predictable text replacement.

Stakeholders are:

- End users scanning on iPhone and expecting a clean app-like flow
- Product stakeholders validating whether Stage 3 feels like a real MVP rather than a concept demo
- Engineering, which needs a stable mobile-first shell before deeper content and session work continues

## Goals / Non-Goals

**Goals:**
- Present the Stage 3 experience as a mobile-first, single-column app flow on iPhone
- Remove non-essential explanatory content from user-facing pages
- Keep each page focused on one primary job and one primary CTA
- Rename the web and PWA identity to `Shifu`
- Preserve the existing Stage 3 route model and business logic while correcting the shell

**Non-Goals:**
- Rewriting recommendation logic or session data models
- Adding native iOS behavior beyond what the PWA shell supports
- Solving all legacy copy/encoding issues in one pass if they are not blocking the app shell correction
- Redesigning the Stage 3 product direction again

## Decisions

### Decision 1: Treat the entire shell as a phone screen, even on wider viewports

The app shell should render within a constrained phone-width column and should not use side panels or dashboard layouts.

Rationale:
- The validation target is scan-entry on iPhone
- A constrained shell prevents desktop-style information creep

Alternatives considered:
- Keep a responsive desktop/tablet dual layout: rejected because it keeps the wrong mental model alive
- Hide side panels only on mobile breakpoints: rejected because the implementation still grows around desktop assumptions

### Decision 2: Make entry a task page, not a product explanation page

The entry screen should contain only:

- a short title
- a short supporting sentence
- one primary CTA
- minimal context if truly needed

Rationale:
- The current long explanatory content delays the first action
- Stage 3 is intended to validate direct value, not teach the product concept

Alternatives considered:
- Keep informational cards below the fold: rejected because they still dominate the entry page hierarchy

### Decision 3: Remove all internal or project-facing content from in-product screens

The in-app UI must not include:

- architecture diagrams
- project phase framing
- review cadence
- implementation focus lists
- meta explanations about MVP or stage delivery

Rationale:
- These belong in docs, not in user-facing product flow
- Their presence makes the product feel like a prototype deck

### Decision 4: Update browser and PWA identity as part of the same correction

The browser title, manifest `name`, manifest `short_name`, and descriptive metadata should be updated to `Shifu`.

Rationale:
- iPhone scan-entry currently exposes the old Stage 2 identity immediately
- Identity correction is part of the shell fix, not a separate branding pass

Alternatives considered:
- Delay naming cleanup until later: rejected because the title is already user-visible and undermines the new flow

### Decision 5: Keep runtime pages dense in function, but sparse in explanation

Prep, session, feedback, and next-step screens should remain operationally rich, but supporting copy must be brief and subordinate to controls.

Rationale:
- Users need real actions in runtime
- They do not need explanatory framing during the session

## Risks / Trade-offs

- [Aggressive shell cleanup may remove context users still need] → Keep one short line of support copy per page, not multiple stacked explanation blocks
- [Single-file editing may accidentally disturb business logic] → Limit changes to layout, identity, and page-level content hierarchy
- [Encoding pollution may make copy replacement brittle] → Prefer stable replacements and defer full copy cleanup if not required for shell correction
- [Phone-only composition may look sparse on desktop] → Accept this trade-off because iPhone scan-entry is the primary validation environment

## Migration Plan

1. Update app identity files (`index.html`, `manifest.webmanifest`) to `Shifu`
2. Refactor the Stage 3 shell into a phone-width, single-column container
3. Remove side panels and entry-page explanation cards
4. Compress page copy so each screen supports one main action
5. Rebuild and redeploy to GitHub Pages
6. Validate on iPhone scan-entry and in installed PWA mode

## Open Questions

- Should the first user-facing page still show the ASIN context, or should product context stay fully implicit?
- Should the iPhone shell preserve a sticky bottom CTA on every page, or only on decision pages before runtime starts?
- Should the first public-facing label remain `Shifu`, or should a more descriptive sub-label appear under the product name later?
