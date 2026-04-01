## Context

Shifu's current Stage 3 flow is intentionally linear: users move from entry to recommendation, preparation, runtime, feedback, and next-step guidance with very little branching. That linearity supports the product goal of low cognitive load, but it also leaves three practical gaps that now matter for real review and future rollout:

- users cannot safely return home or revise a specific earlier choice from later pages without repeated backtracking
- internal reviewers and QA do not have a sanctioned way to jump between pages for demos and checks
- overseas review currently requires ad hoc copy changes instead of a real locale-preview layer

The current implementation is concentrated in [index.tsx](/F:/Users/Administrator/Desktop/SPAPP/index.tsx), where route state, screen rendering, and presentation logic live together. That means navigation, preview mode, and locale switching are cross-cutting concerns even if the visible UI remains minimal.

Stakeholders are:

- end users who need guided recovery and edit paths without losing trust in the flow
- product and demo stakeholders who need faster review loops and English presentation
- engineering, which needs a future-safe way to add i18n and preview controls without turning the app into a generic router playground

## Goals / Non-Goals

**Goals:**
- preserve the Stage 3 journey as the canonical user flow while adding safer return and edit affordances
- add a hidden preview-only page switcher for internal review, QA, and demos
- add a Chinese/English locale-preview layer that can switch languages without resetting the current route context
- keep implementation feasible inside the current single-shell architecture
- prepare the codebase for future internationalization by separating UI copy from route logic

**Non-Goals:**
- exposing unrestricted page jumping to normal users as part of the core product journey
- implementing full multi-market content localization beyond Chinese and English UI preview
- redesigning recommendation logic, session logic, or analytics strategy beyond what is needed for navigation and preview correctness
- splitting the app into a fully route-driven multi-file architecture as part of this change

## Decisions

### Decision 1: Keep the canonical user journey linear and move non-linear controls into scoped surfaces

The primary user flow will remain entry -> goal -> equipment -> intake -> recommendation -> preparation -> runtime -> feedback -> next step. Instead of a universal page picker, normal users will see only context-safe actions such as "return home" and "edit goal/equipment/intake" from later pages.

Rationale:
- this preserves the low-friction Stage 3 contract already defined in OpenSpec
- it supports the user's request for flexibility without making the product feel like a debug tool

Alternatives considered:
- expose all routes in a visible step switcher: rejected because it weakens guidance and pollutes the product-facing journey
- keep only back-button behavior: rejected because it makes revision too slow from recommendation and prep screens

### Decision 2: Introduce a lightweight navigation control center instead of scattering controls on every screen

Navigation utilities will be grouped behind a lightweight control surface that can expose:
- return home
- edit goal
- edit equipment
- edit intake
- language toggle
- preview-only page picker when preview mode is enabled

This keeps the visible shell calm while still making advanced navigation available when needed.

Rationale:
- the product direction favors minimal, quiet chrome rather than persistent secondary controls
- the same control surface can host both user-safe actions and internal-only tools with conditional visibility

Alternatives considered:
- add separate buttons for every action directly in page headers: rejected because it increases clutter
- hide everything behind browser history only: rejected because the app needs product-aware return semantics

### Decision 3: Gate preview mode explicitly and treat it as a non-canonical review environment

Preview navigation will only appear when a dedicated flag such as `?preview=1` is present. In preview mode, the app may seed missing state and expose a page picker for major Stage 3 screens, but it must remain visually distinct from the default user experience and must not redefine the canonical flow contract.

Rationale:
- internal demos and QA need speed
- production users should not accidentally enter an unrestricted flow mode

Alternatives considered:
- always expose page jumping in a hidden footer gesture: rejected because it is harder to document and test
- build a separate admin shell: rejected because it adds structural cost before the feature set justifies it

### Decision 4: Resolve locale from URL override, then persisted preference, then default locale

Locale resolution order will be:
1. `lang` query parameter
2. persisted local preference
3. default Chinese locale

Changing locale from inside the app must keep the current route, current selection state, and current preview/home-edit context intact.

Rationale:
- URL control is useful for demos, QA, and stakeholder review
- persistence improves repeat review without requiring repeated manual switching
- preserving context keeps language preview from becoming disruptive

Alternatives considered:
- local toggle only with no URL support: rejected because review links are valuable
- URL-only locale with no persistence: rejected because it is inconvenient for repeated checks

### Decision 5: Start internationalization by centralizing user-facing copy into locale dictionaries

The implementation should move route labels, CTA text, helper text, and control labels into locale dictionaries keyed by locale and semantic message ids. This change does not need a full translation platform, but it should avoid sprinkling bilingual conditionals directly throughout the render tree.

Rationale:
- future English and other market work will be cheaper if copy is centralized now
- switching locale safely requires one source of truth for screen strings

Alternatives considered:
- temporary inline English substitutions: rejected because they create debt immediately
- full i18n library adoption now: rejected because the current app scope does not require that overhead yet

## Risks / Trade-offs

- [A new control surface could make the shell feel busier] -> Keep it lightweight, secondary, and hidden until invoked
- [Preview mode could leak into normal user behavior] -> Gate it behind an explicit preview flag and hide all page-jump actions otherwise
- [Locale switching could reset or corrupt in-progress state] -> Treat locale as presentation state only and preserve route/session selections across switches
- [Centralized copy refactoring could touch many screens at once] -> Start with Stage 3 shell strings and keep message ids aligned to existing route structure
- [Return-home semantics during active runtime may be ambiguous] -> Require explicit confirmation whenever leaving an active session or unresolved post-session state

## Migration Plan

1. Add the OpenSpec delta specs and tasks for navigation control and locale preview
2. Introduce shared state helpers for locale resolution, preview-mode detection, and contextual edit targets
3. Move Stage 3 shell strings into locale dictionaries for Chinese and English
4. Add the lightweight control center and page-level edit/home actions
5. Validate normal-user flow, preview flow, and locale switching on phone-sized screens

## Open Questions

- Should preview mode suppress analytics entirely, or should it tag events with a preview flag so review usage remains inspectable?
- Should the language toggle live only inside the control center, or should it also appear on the landing screen for first-impression overseas demos?
- When a user exits during active runtime, should the app retain a resumable draft later, or only preserve pre-runtime selections for a fresh restart?
