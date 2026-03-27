## Context

Stage 1 has already defined the first ASIN (`B0BXJLTRSH`), the primary user groups, the 3-step installation flow, and the minimum analytics plan. The Stage 2 PoC needs to convert those artifacts into a working PWA experience that can be opened from a scan entry, render the tutorial flow for the first SKU, collect feedback, and return enough data to evaluate completion and unresolved reasons.

The current repository contains planning documents and HTML mockups, but it does not yet contain a runnable front-end implementation for the PoC flow. This change therefore spans multiple concerns at once: app shell setup, route-level page implementation, structured content data, and analytics instrumentation.

## Goals / Non-Goals

**Goals:**
- Implement a runnable PWA-style front-end closed loop for the first SKU.
- Keep tutorial content structured so copy and assets can be changed without rewriting page logic.
- Instrument the minimum event set needed for Stage 2 validation and Stage 4 review.
- Preserve the page roles and flow defined in Stage 1 artifacts and UI mockups.

**Non-Goals:**
- Building a full CMS or account system.
- Supporting multiple SKUs beyond the first PoC target.
- Implementing AI diagnosis, community features, or advanced personalization.
- Solving production-grade analytics governance beyond the minimum PoC event structure.

## Decisions

### Decision: Implement the PoC as a route-driven single-page web app
The PoC will use a route-driven front-end with dedicated pages for Landing, Step 1, Step 2, Step 3, Feedback, and Unresolved Reason. This keeps the flow easy to validate, easy to instrument, and aligned with the Stage 1 IA.

Alternative considered:
- A single long scroll page with in-page sections. Rejected because step-level completion, dropout, and recovery paths would be harder to reason about and instrument cleanly.

### Decision: Drive content from a structured data module for the first ASIN
The first SKU content will live in a structured data source keyed by ASIN. Page components will read titles, copy, and step metadata from that object.

Alternative considered:
- Hard-code each page. Rejected because Stage 2 needs to prove that the content model can support later SKU expansion with minimal page rewrites.

### Decision: Keep analytics provider wiring behind a lightweight tracking abstraction
The implementation should expose a small tracking layer that can map to PostHog, GA4, or a temporary logging/export mechanism. Event names and payloads should follow the Stage 1 tracking plan and stay stable across later phases.

Alternative considered:
- Wire analytics calls inline in each page component. Rejected because it would make provider changes and payload consistency harder during MVP evolution.

### Decision: Treat unresolved reasons as both analytics input and recovery routing input
The unresolved reason page will not only submit feedback but also determine the recommended review target (`step_1`, `step_2`, `step_3`, or `support`). This preserves the Stage 1 requirement that unresolved feedback supports both learning and immediate recovery.

Alternative considered:
- Collect unresolved reasons without any recommended next step. Rejected because it weakens the user-facing value of the PoC and reduces the chance of recovering unresolved users.

## Risks / Trade-offs

- [Risk] Mockup fidelity may slow down PoC delivery if implemented too literally. → Mitigation: prioritize functional parity with the IA and user outcomes over pixel-perfect reproduction.
- [Risk] Analytics provider integration may block early testing. → Mitigation: implement a provider-agnostic tracking wrapper and allow a fallback logging/export mode for PoC validation.
- [Risk] Stage 1 copy includes some strong safety language that may not be suitable for final release. → Mitigation: keep content configurable and isolate copy in structured content definitions for easy revision.
- [Risk] Single-SKU data structures may become too custom. → Mitigation: use ASIN-keyed content models from the start, even if only one SKU is populated.

## Migration Plan

1. Scaffold the front-end app shell and routes for the Stage 2 flow.
2. Implement the first SKU content model and bind the pages to that data.
3. Add the tracking abstraction and fire the minimum analytics events.
4. Deploy to a public environment and validate mobile scan entry.
5. Record the PoC demo, review event outputs, and convert findings into the MVP backlog.

Rollback strategy:

- If a public analytics integration blocks delivery, keep the flow running with local logging or export-friendly event capture until provider wiring is stabilized.
- If mockup complexity delays the PoC, simplify the visuals while preserving page roles, copy hierarchy, and tracking behavior.

## Open Questions

- Which analytics target will be used first for Stage 2 validation: PostHog, GA4, or a temporary export path?
- Which implementation stack from the archived app skeleton should be adopted as the canonical PoC codebase?
- What public deployment target will be used first: Vercel, Cloudflare Pages, or another lightweight option?
