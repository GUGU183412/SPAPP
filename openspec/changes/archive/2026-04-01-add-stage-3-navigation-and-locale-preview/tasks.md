## 1. Shared State Foundation

- [x] 1.1 Add shared helpers for preview-mode detection, locale resolution, and persisted locale preference in [index.tsx](/F:/Users/Administrator/Desktop/SPAPP/index.tsx) or an extracted helper module
- [x] 1.2 Move Stage 3 shell copy, CTA labels, and control labels into Chinese and English locale dictionaries with safe fallback behavior
- [x] 1.3 Add seeded-state helpers so preview mode can render recommendation, preparation, runtime, feedback, and next-step screens without requiring a full linear walkthrough

## 2. Navigation Control Center

- [x] 2.1 Add a lightweight navigation control surface that can expose return-home, language toggle, and context-aware edit actions without increasing shell clutter
- [x] 2.2 Implement context-safe return-home behavior, including draft preservation before runtime and explicit confirmation during active or unresolved session states
- [x] 2.3 Add targeted edit actions from recommendation and preparation back to goal, equipment, and intake steps with downstream session recomputation

## 3. Preview And Locale Behavior

- [x] 3.1 Implement a hidden `?preview=1` mode that exposes an internal page switcher for major Stage 3 screens and hides itself from the normal user journey
- [x] 3.2 Implement `?lang=` locale override plus persisted Chinese/English preference without resetting the current page
- [x] 3.3 Ensure locale switching preserves route context, selected inputs, support toggles, runtime progress, and post-session state across Stage 3 surfaces
- [x] 3.4 Update [docs/design-spec.md](/F:/Users/Administrator/Desktop/SPAPP/docs/design-spec.md) so control-center behavior, preview gating, and bilingual review rules are documented for future UI work

## 4. Validation

- [x] 4.1 Run a production build and manually validate normal flow, return-home behavior, edit navigation, preview gating, and locale switching on phone-sized screens
- [x] 4.2 Add or update automated Stage 3 verification coverage so preview-only navigation and Chinese/English switching are checked alongside the current journey
