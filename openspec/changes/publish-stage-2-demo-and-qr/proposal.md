## Why

Stage 2 has already validated the first-ASIN installation PoC, but the demo still depends on a local preview URL. To support boss review, on-site phone demos, and scan-based sharing, the project now needs a stable public demo URL and a QR code asset tied to that final URL.

## What Changes

- Publish the existing Stage 2 PoC to a stable public static hosting target using GitHub Pages.
- Define a single standard demo URL for the first ASIN (`B0BXJLTRSH`) that can be reused in Feishu docs, QR assets, and phone demos.
- Add a repeatable QR generation path so the final public URL can be turned into shareable PNG/SVG assets.
- Document the deployment flow, public entry URL, and QR asset output so the Stage 2 demo package is reproducible.

## Capabilities

### New Capabilities
- `stage-2-demo-publishing`: Covers building and publishing the Stage 2 PoC to a public GitHub Pages URL with a stable first-ASIN entry.
- `stage-2-demo-access-assets`: Covers generating and documenting QR assets that point to the final public Stage 2 demo URL.

### Modified Capabilities
- None.

## Impact

- Affected code: Vite deployment configuration, repository publishing workflow, and documentation for public demo access.
- Affected systems: GitHub repository setup, GitHub Pages hosting, and QR asset generation workflow.
- Dependencies: stable GitHub repository, final public URL choice, and an agreed output location for QR assets.
