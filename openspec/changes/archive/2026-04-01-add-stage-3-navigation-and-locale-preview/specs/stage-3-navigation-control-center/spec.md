## ADDED Requirements

### Requirement: Stage 3 SHALL provide a context-safe return-home action
The system SHALL provide a return-home action across Stage 3 that behaves according to the user's current journey state instead of acting like a raw browser back command.

#### Scenario: User returns home before session start
- **WHEN** the user selects the return-home action on entry, goal, equipment, intake, recommendation, or preparation
- **THEN** the system routes the user to the Stage 3 home or entry screen
- **AND** previously selected goal, equipment, and intake data remain available as a draft unless the user explicitly resets them

#### Scenario: User attempts to return home during active training
- **WHEN** the user selects the return-home action during an active session or unresolved post-session state
- **THEN** the system requires explicit confirmation before leaving the current session surface
- **AND** the system does not abandon the in-progress experience silently

### Requirement: Stage 3 SHALL allow targeted revision of earlier inputs from later pre-session screens
The system SHALL let users revise specific earlier decisions from recommendation and preparation surfaces without exposing unrestricted page jumping in the default user journey.

#### Scenario: User edits goal, equipment, or intake from recommendation
- **WHEN** the user selects an edit action for goal, equipment, or intake on the recommendation screen
- **THEN** the system routes the user to the corresponding earlier step
- **AND** the system preserves other compatible selections until the edited step changes downstream recommendations

#### Scenario: User edits setup context from preparation
- **WHEN** the user selects an edit action for goal, equipment, or intake on the preparation screen
- **THEN** the system routes the user to the corresponding earlier step
- **AND** the system preserves existing support-toggle choices until the user confirms a new session path

### Requirement: Stage 3 SHALL provide a hidden preview-only page switcher for internal review
The system SHALL support a preview mode for internal review, QA, and demos that can jump to major Stage 3 pages, but SHALL expose that capability only when preview mode is explicitly enabled.

#### Scenario: Internal reviewer opens preview mode
- **WHEN** the app is opened with the preview-mode flag enabled
- **THEN** the system exposes a page switcher for major Stage 3 pages such as entry, recommendation, preparation, runtime, feedback, and next step
- **AND** the system can seed missing state required to render the selected page

#### Scenario: Normal user does not see preview navigation
- **WHEN** the app is opened without the preview-mode flag
- **THEN** the system hides the page switcher and preview-only navigation actions
- **AND** the default user journey remains the canonical guided flow
