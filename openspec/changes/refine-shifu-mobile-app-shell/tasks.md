## 1. Identity Cleanup

- [x] 1.1 Update `index.html` so the browser title and meta description identify the product as `Shifu`
- [x] 1.2 Update `manifest.webmanifest` so the PWA `name`, `short_name`, and description no longer expose the legacy Door Anchor identity

## 2. Entry And Shell Cleanup

- [x] 2.1 Refactor the Stage 3 shell in `index.tsx` into a phone-width, single-column layout with no side panel
- [x] 2.2 Simplify the entry page so it contains only essential start content and no presentation-style explanation cards
- [x] 2.3 Remove internal, project-facing, or non-user-facing information from user-visible pages

## 3. Runtime Mobile Tightening

- [x] 3.1 Tighten prep, session, feedback, and next-step pages so they behave like compact mobile task pages
- [x] 3.2 Ensure primary CTA hierarchy remains obvious on iPhone across onboarding and runtime
- [x] 3.3 Keep mirror preview and other optional runtime support secondary to the main training controls

## 4. Validation

- [x] 4.1 Run production build and verify no regressions in routing or event collection
- [x] 4.2 Validate the updated shell on iPhone scan-entry and confirm the browser title shows `Shifu`
