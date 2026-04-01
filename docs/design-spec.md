# Design System Specification: Clinical Precision & Kinetic Flow

## 0. Scope

This document defines the visual and interaction design system for the PWA product tutorial and troubleshooting assistant described in [project-background.md](/F:/Users/Administrator/Desktop/SPAPP/docs/project-background.md).

It should be used as the baseline reference for:

- Visual design and UI implementation
- Component styling and layout decisions
- Interaction patterns for tutorial, feedback, and troubleshooting flows
- Future design QA and consistency reviews

## 1. Overview & Creative North Star

This design system is built for an environment where precision is a safety requirement and clarity is a form of empathy. We are moving away from the "generic fitness tracker" aesthetic toward a **High-End Editorial** experience that mirrors the quality of professional medical equipment and premium architectural spaces.

The intended quality bar is **Apple-inspired restraint**, not Apple imitation. We should borrow the discipline of calm surfaces, dominant typography, muted chrome, and native-feeling focus, while preserving Shifu's own product identity, green safety semantics, and rehabilitation-oriented clarity.

**Creative North Star: The Kinetic Sanctuary**

The interface should feel like a high-end rehabilitation clinic: silent, spacious, and undeniably authoritative. We break the "template" look by utilizing extreme typographic scales and intentional asymmetry. By favoring generous white space (the "Sanctuary") over crowded grids, we ensure that users in rehabilitation or high-intensity installation environments are never overwhelmed. Every element must feel heavy, grounded, and deliberate.

### Minimal Discipline: Subtraction Before Decoration

This product should not become "beautiful by accumulation." Its elegance must come from restraint, hierarchy, and confidence.

- **One focal action per screen**: Each screen should present a single dominant next step. Secondary actions must stay visually quiet.
- **One primary surface per viewport**: Above the fold, there should usually be one main card, decision cluster, or timer surface doing the heavy lifting, not several competing panels.
- **Three visual weights max**: Large command typography, calm body copy, and quiet metadata. If a fourth emphasis level appears, something should be removed.
- **Short-copy bias**: Headlines should be decisive, support copy should be brief, and tertiary explanations should be delayed until they are needed.
- **Whitespace is functional**: Empty space is not decorative padding. It is how we reduce fear, increase scan speed, and make movement-oriented tasks feel safe.
- **Metadata must whisper**: Step counts, status chips, badges, and helper labels should support orientation without competing with the main decision.
- **Remove before adding**: If a screen feels busy, first remove a panel, badge, sentence, divider, or icon before inventing a new style treatment.

## 2. Colors: Achromatic Rigor & Functional High-Contrast

Our palette is rooted in absolute clarity. We use deep blacks and stark whites to establish a "clinical" foundation, punctuated by high-chroma functional colors for safety and success.

### Tonal Foundation

- **Primary (`#000000`)**: Used for primary actions and "Command Typography." It represents stability and the finality of an action.
- **Surface (`#f8f9fa`)**: Our canvas. It must feel like a clean, well-lit room.
- **Secondary/Success (`#006e24`)**: A sophisticated forest green for "Go" states, paired with the vibrant **Secondary Container (`#50ff71`)** for high-visibility success backgrounds.
- **Error/Alert (`#ba1a1a`)**: A sharp, unmistakable red for warnings and critical safety stops.

### The "No-Line" Rule

To maintain a premium, architectural feel, **1px solid borders are strictly prohibited for sectioning.** We define boundaries through background color shifts.

- To separate a section, transition from `surface` to `surface-container-low`.
- To highlight an interactive element, nest a `surface-container-lowest` card inside a `surface-container` section.

### Glass & Gradient Soul

While the system is minimalist, it must not feel flat.

- **Floating Elements**: Use semi-transparent surface colors with a `backdrop-blur` (20px-40px) to create "frosted glass" overlays for modals or sticky headers.
- **Visual Depth**: Apply subtle linear gradients to main CTAs, such as `primary` to `primary-container`, to provide a "machined" feel that implies quality and tactile response.
- **Platform Reference, Not Replica**: Use blur, tonal layering, and calm depth to reach an Apple-grade level of polish, but do not reproduce Apple system components, icons, or layout patterns verbatim.

## 3. Typography: The Editorial Voice

We utilize two distinct typefaces to balance clinical precision with modern accessibility.

- **Display & Headlines (Lexend)**: A geometric sans-serif designed for maximum legibility. Use `display-lg` (3.5rem) for workout titles or safety headers to create an authoritative, "monumental" feel.
- **Body & Labels (Public Sans)**: A neutral, strong typeface that excels in small-to-medium sizes.
- **Hierarchy as Brand**: Use extreme contrast between `display-lg` and `label-md`. Large, bold headers provide the "What," while clean, medium-weight body text provides the "How." For rehabilitation users, never drop below `body-lg` (1rem) for instructional content.

## 4. Elevation & Depth: Tonal Layering

In this system, depth is not "added"; it is "carved" through the hierarchy of surface tokens.

- **The Layering Principle**: Treat the UI as stacked sheets of fine material.
- **Level 0**: `surface` (Base)
- **Level 1**: `surface-container-low` (Sub-sections)
- **Level 2**: `surface-container-lowest` (Interactive Cards/Primary Focus)
- **Ambient Shadows**: Shadows should only be used when an element is "floating" such as a critical safety alert. Use a 32px blur with 6% opacity, tinted with the `on-surface` (`#191c1d`) color to simulate natural light rather than a digital drop shadow.
- **The "Ghost Border" Fallback**: If accessibility requirements demand a container edge, use the `outline-variant` token at **15% opacity**. It should be felt, not seen.

## 5. Components: Tactile Authority

Every component must be "oversized" to accommodate varying degrees of motor control and the urgency of safety installations.

### Buttons: The Command Centers

- **Primary**: Solid `primary` (`#000000`) with `on-primary` text. Use `xl` (0.75rem) roundedness for a modern, "pebble" feel. Min-height: `10` (3.5rem).
- **Secondary**: `surface-container-highest` background. This allows the button to feel part of the interface rather than an interruption.

### Mobile App Shell: Phone-First by Default

- The production experience should render as a **single-column mobile app shell** first, not as a desktop landing page.
- The active content width should target the **390px-430px phone range**. Wider screens may add outer breathing room, but must not introduce sidebars, floating report panels, or presentation-style blocks into the in-app flow.
- Sticky top and bottom bars must respect safe areas and feel like native iPhone/PWA chrome rather than website navigation.
- Boss-report materials, architecture diagrams, delivery summaries, and other documentation artifacts belong in docs, not inside the app UI.

### Control Center: Quiet Utility, Not Persistent Clutter

- Global utilities such as **return home**, **language switching**, and **targeted edit actions** should live inside a lightweight control center rather than as always-visible header chrome.
- The control center must feel secondary: compact, calm, and hidden until invoked.
- Do not expose unrestricted page jumping in the normal user flow. User-facing navigation flexibility should be framed as **edit what matters**, not **jump anywhere**.
- If a control can interrupt an active session, it must require explicit confirmation before abandoning the current training state.

### Bilingual Review & Preview Gating

- Chinese remains the default product locale unless a supported locale override is present.
- English switching is a **review and future-internationalization capability**, so the app must keep the current page context intact while copy changes.
- Locale changes must not reset selected goal, equipment, intake choices, runtime support toggles, timer state, or post-session choices.
- Any unrestricted page-switching UI belongs to a hidden **preview mode** for demo, QA, and internal review only. It must never appear in the default user journey.

### First-Screen Density: Calm Before Depth

- The first screen must answer only three things: **what this app helps with, what the user should choose next, and the primary action path**.
- Avoid stacking long explanatory paragraphs, multiple hero zones, system-status blocks, or non-essential metadata above the fold.
- On a typical iPhone viewport, the first screen should ideally contain **one headline, one short support paragraph, and one focused decision area or CTA**.
- If a screen starts to feel like a slide deck, spec sheet, or internal demo page, it has exceeded the allowed density.
- Each additional card above the fold must justify itself as either orientation, decision, or execution. If it is merely informative, it should move down or disappear.

### Cards & Lists: The No-Divider Rule

- **Cards**: Forbid the use of divider lines. Separate content using the `spacing-6` (2rem) scale.
- **Interaction**: Use `surface-container-lowest` for the card body to make it "pop" off the `surface-container` background.
- **Safety Indicators**: Use the `secondary` (Green Check) and `error` (Red X) icons at a minimum size of 32px to ensure they are the first thing a user sees.
- **Card Austerity**: Cards should not stack metadata, tags, descriptions, and controls unless all four are necessary. Prefer title + one support cue + one affordance.

### Selection States: One Visual Grammar

- All selectable units must follow the same state language across the app: **soft green wash, green ring, stronger icon emphasis, and a visible confirmation check**.
- This rule applies equally to goal cards, equipment cards, intake pills, toggle cards, feedback cards, and next-step cards.
- Do not invent a new selected style for each module. A user should understand "this is selected" without relearning the interface on every page.
- Selected typography may gain emphasis, but the primary signal must still come from the container state, not text color alone.

### Semantic Cards: Preserve Meaning, Keep Selection Consistent

- Cards with semantic tone such as success, warning, or caution may keep their tonal background.
- However, their **selected state must still use the same green selection ring and confirmation behavior** as neutral cards.
- Semantic tone is for meaning. Selection treatment is for interaction. These two layers must coexist rather than replace one another.

### Feedback & Next-Step Cards: Same Interaction Grammar

- Feedback cards and next-step action cards must use the same structural rhythm: **leading semantic icon, primary copy block, trailing confirmation affordance**.
- Recommendation tags such as "Recommended" or "Review" should be supportive metadata only. They must never overpower the main selection state.
- These screens should feel like decision screens inside one app, not like a separate survey module or support microsite.

### Selection Cards: Prefer Decision Over Explanation

- Goal selection, equipment selection, and similar choice screens should behave like **fast decision surfaces**, not mini information sheets.
- For first-order choices, prefer **title + short secondary cue** over title + paragraph + supporting paragraph.
- Equipment selection may use **two-column rounded-square cards** on mobile when that improves scan speed and tap confidence.
- Explanatory copy belongs in recommendation, prep, or support screens. It should not overload the selection moment itself.
- Do not let badges, decorative icons, or long helper text fragment the scan path. A user should identify the difference between options within one second.

### Input Fields: The Precision Tool

- **State**: Active inputs should use a `primary` "Ghost Border" (2px at 20% opacity) and a subtle `surface-tint` to draw the eye without cluttering the screen.
- **Labels**: Always use `label-md` in `on-surface-variant`. Never hide labels behind "floating label" animations; keep them static and legible.

### Minimal QA Checklist

Before shipping a screen, verify:

- There is only one visually dominant CTA.
- The first screenful does not contain more than one explanatory paragraph.
- Decorative treatment is quieter than functional treatment.
- Status, progress, and metadata remain readable but secondary.
- Cards feel calm when squinting at the layout from a distance.
- Removing one visible element would make the screen worse, not better.
- The control center stays quieter than the primary task and does not read like a toolbar.
- Locale switching keeps the current route and current state intact.
- Preview-only page controls are hidden unless preview mode is explicitly enabled.

### Custom Component: The "Progress Monolith"

For fitness and installation tracking, use a large, vertical progress bar that spans the height of the screen using `secondary_container`. It acts as a structural element of the layout, not just a small widget.

## 6. Do's and Don'ts

### Do

- **DO** use the `spacing-12` (4rem) or `spacing-16` (5.5rem) scales for top-level margins to create a "gallery" feel.
- **DO** use high-contrast `on-error` white text on `error` red backgrounds for safety warnings.
- **DO** leverage `lexend` at large weights to guide the user's eye through the installation flow.
- **DO** reference Apple-quality restraint, hierarchy, and material polish as a benchmark for finish.
- **DO** keep all choice controls inside one shared selection language so the app feels coherent from page to page.
- **DO** treat the shipped interface as a mobile product first, even when reviewing on desktop.
- **DO** prefer fewer, larger, calmer surfaces over many small informative ones.
- **DO** treat every extra word, badge, and icon as a cost against clarity.

### Don't

- **DON'T** use 1px solid dividers or borders to separate list items; use white space.
- **DON'T** use generic "Material Design Blue." If it isn't black, white, green, or red, it shouldn't be in the core functional UI.
- **DON'T** use small tap targets. Every interactive element must be at least 48dp x 48dp, but aim for 64dp for rehabilitation safety.
- **DON'T** use harsh 100% black shadows. Always tint shadows with the surface color to maintain the "Kinetic Sanctuary" atmosphere.
- **DON'T** mix report content, architecture diagrams, or internal delivery notes into the in-app interaction flow.
- **DON'T** let warning/success color treatments create a second selection system that conflicts with the base interaction language.
- **DON'T** clone iOS system screens or treat Apple UI as a component library to copy from.
- **DON'T** fill empty space just because it exists.
- **DON'T** allow helper labels, pills, or badges to become louder than the action they support.

## 7. Project Usage Notes

For this project, the above system should be applied with the following implementation priorities:

- Tutorial and troubleshooting pages should prioritize clarity, large typography, and highly legible action hierarchy.
- Safety-related content should visually stand out through contrast and spacing rather than decorative treatments.
- SKU landing pages should feel editorial and calm, not dashboard-like or app-store-like.
- Interactive flows should preserve large tap targets and low cognitive load for first-time users scanning from packaging or manuals.
- The current `Shifu` MVP should be reviewed as a **mobile PWA app flow**, not as a presentation page or marketing site.
- Any visual asset used for boss reporting, roadmap explanation, or MVP architecture should be delivered as a document artifact outside the live app.
- Visual QA should explicitly verify that all selected states, feedback actions, and next-step actions obey the same interaction grammar before release.

## 8. Relationship to Other Documents

This file should be read alongside:

- [project-background.md](/F:/Users/Administrator/Desktop/SPAPP/docs/project-background.md)

Future related documents may include:

- `operations-guide.md`
- `tracking-plan.md`
- `content-model.md`
