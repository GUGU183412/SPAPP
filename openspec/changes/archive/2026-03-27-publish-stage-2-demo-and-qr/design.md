## Context

Stage 2 already produced a runnable Vite-based PoC for the first ASIN (`B0BXJLTRSH`) and validated its closed loop locally. The remaining gap is not product logic but presentation readiness: the demo is still tied to a local preview address, there is no canonical public URL, and the QR asset cannot be finalized until that URL exists.

The current codebase is a static front-end app with a `build` script, a manifest, and a query-string driven entry for the first ASIN. This makes GitHub Pages a viable publishing target, but the project needs a stable deployment path, a standard public URL, and a documented QR asset workflow that all point to the same entry.

## Goals / Non-Goals

**Goals:**
- Publish the Stage 2 PoC to a stable GitHub Pages URL.
- Ensure the public demo opens the first-ASIN experience through a single standard entry URL.
- Establish a repeatable QR generation workflow that uses the final public URL and exports reusable image assets.
- Document the deployment and access asset flow so the Stage 2 demo package can be reproduced by the team.

**Non-Goals:**
- Expanding product scope beyond the existing Stage 2 PoC.
- Reworking the Stage 2 flow into a multi-SKU or production-ready hosting architecture.
- Building a full design system or new marketing layer for the public demo.
- Recording or editing a formal demo video in this change.

## Decisions

### Decision: Use GitHub Pages as the public hosting target
GitHub Pages matches the current static front-end architecture and keeps the deployment path lightweight for a Stage 2 demo package.

Alternative considered:
- Use another static host such as Vercel or Cloudflare Pages. Rejected for this change because GitHub Pages is sufficient for a public demo, aligns with the team's current repository workflow, and keeps the additional hosting surface area low.

### Decision: Define a single canonical demo URL for `B0BXJLTRSH`
The deployment will publish one standard public entry URL for the first ASIN. Feishu docs, QR assets, and phone demos will all reference this one URL to avoid drift between assets.

Alternative considered:
- Maintain multiple ad hoc links for boss review, QR use, and phone demos. Rejected because it would fragment the demo package and make QR regeneration error-prone.

### Decision: Generate QR assets from the final public URL, not from interim local or preview URLs
The QR asset workflow will start only after the public GitHub Pages URL is stable. This ensures that every QR image remains aligned with the actual demo entry.

Alternative considered:
- Generate QR assets early from a provisional preview or localhost URL. Rejected because any later URL change would invalidate the assets and force rework.

### Decision: Treat deployment instructions and asset output paths as part of the deliverable
The change will document both the hosting flow and where QR assets are stored so the public demo package is reproducible and auditable.

Alternative considered:
- Keep deployment and asset generation as undocumented manual knowledge. Rejected because it would make Stage 2 handoff and future reuse fragile.

## Risks / Trade-offs

- [Risk] GitHub Pages project-path deployments require correct Vite `base` configuration. -> Mitigation: define the GitHub Pages URL structure up front and explicitly update build configuration to match the chosen repository path.
- [Risk] The public URL may change if the repository or Pages settings change later. -> Mitigation: define one canonical demo URL in docs and regenerate QR assets only after that URL is finalized.
- [Risk] Static hosting may expose rough PoC edges more visibly than a local demo. -> Mitigation: limit this change to stable public access and keep the scope focused on the already-validated Stage 2 flow.
- [Risk] QR asset generation could become a one-off manual step that is hard to repeat. -> Mitigation: document the generation command or workflow and standardize output file names and storage location.

## Migration Plan

1. Prepare the repository for GitHub-hosted publishing and define the final GitHub Pages path strategy.
2. Update build/deployment configuration so the Stage 2 app works correctly under the public GitHub Pages URL.
3. Publish the Stage 2 build to GitHub Pages and verify the standard first-ASIN entry URL.
4. Generate QR image assets from the verified public URL and store them in a documented location.
5. Update Stage 2 docs with the public demo URL, QR asset references, and basic verification notes.

Rollback strategy:

- If GitHub Pages hosting proves unstable or misconfigured, revert to the existing local preview workflow while keeping the deployment and asset docs as draft inputs.
- If the repository path changes after initial setup, regenerate QR assets against the updated canonical public URL before sharing further.

## Open Questions

- Will the project use a GitHub Pages repository subpath (`/<repo>/`) or a root/custom-domain setup?
- Where should QR assets live in the repo: a `docs/stages/stage-2/assets/` folder or a separate demo asset directory?
- Should the final public URL include only `asin=B0BXJLTRSH`, or also preserve a standard tracking parameter such as `src=qr`?
