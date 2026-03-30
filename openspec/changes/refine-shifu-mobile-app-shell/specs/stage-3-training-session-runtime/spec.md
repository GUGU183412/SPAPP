## MODIFIED Requirements

### Requirement: The system SHALL include a preparation step before the active session runtime
The system SHALL provide a prep page that helps the user get ready for training, including setup notes, safety reminders, and runtime options such as voice support.

The preparation page SHALL present these controls in a mobile-first single-column layout and SHALL avoid non-essential explanatory content that distracts from the readiness decision.

#### Scenario: Session needs preparation
- **WHEN** the user moves from recommendation into the active session
- **THEN** the system shows a preparation step before the first active runtime step
- **AND** the preparation step may include equipment setup guidance, including yoga-ball-specific setup when relevant

#### Scenario: User configures runtime support
- **WHEN** the user is on the preparation page
- **THEN** the system allows the user to enable or disable voice guidance before the session begins

#### Scenario: iPhone user sees a compact prep page
- **WHEN** the user opens the prep page on iPhone
- **THEN** the page shows only the essential prep checklist, runtime toggles, and primary CTA in a single-column task layout

### Requirement: The system SHALL provide a follow-along runtime with timing and pacing controls
The system SHALL provide a session runtime page that displays the active step, supports progression through the session, and provides visible work and rest pacing.

The runtime page SHALL prioritize the active step, timer, and action controls, and SHALL not include desktop-style side panels or duplicate summary sections in the user-facing shell.

#### Scenario: User runs a session step
- **WHEN** the session starts
- **THEN** the system shows the current exercise or prep step
- **AND** the system shows overall session progress
- **AND** the system provides controls to pause, resume, and advance according to the session design

#### Scenario: Active step includes time-based pacing
- **WHEN** the active step includes a work or rest duration
- **THEN** the system shows the relevant timer state to the user
- **AND** the system updates the pacing display as the session progresses

#### Scenario: Runtime fits an iPhone shell
- **WHEN** the user is in the active runtime on iPhone
- **THEN** the page uses a single-column mobile layout with a clear primary control hierarchy
- **AND** optional support such as mirror preview stays subordinate to the main training controls

### Requirement: The runtime SHALL capture structured post-session feedback and route the next action
The system SHALL collect structured post-session feedback and SHALL provide a next-step screen that routes the user to the most relevant follow-up action.

The feedback and next-step pages SHALL remain concise task pages rather than explanatory summary pages.

#### Scenario: User completes session feedback
- **WHEN** the session ends
- **THEN** the system asks whether the session was completed and whether it felt suitable
- **AND** the system allows the user to indicate uncertainty, blockers, or discomfort

#### Scenario: System routes the user after feedback
- **WHEN** the feedback is submitted
- **THEN** the system presents a next-step recommendation such as repeat easier, continue, review prep, or support
- **AND** the next-step recommendation reflects the submitted feedback outcome
