## MODIFIED Requirements

### Requirement: The system SHALL recommend a structured first-session plan before runtime begins
The system SHALL present a recommendation screen that summarizes the proposed first session, explains why it was selected, and shows the minimum details required for the user to decide whether to begin.

The recommendation screen SHALL also expose targeted edit actions for earlier inputs so users can revise the session setup without restarting the full flow manually.

#### Scenario: User reaches recommendation
- **WHEN** the user completes goal, equipment, and intake inputs
- **THEN** the system presents a recommended session with title, estimated duration, equipment summary, and key safety notes
- **AND** the recommendation includes a primary action to begin the session

#### Scenario: User needs more confidence before starting
- **WHEN** the user reviews the recommendation
- **THEN** the system provides a concise explanation of why this plan was recommended
- **AND** the user can continue into a preparation step before runtime starts

#### Scenario: User revises an earlier setup choice from recommendation
- **WHEN** the user selects an edit action for goal, equipment, or intake on the recommendation screen
- **THEN** the system routes the user to the corresponding earlier step
- **AND** the system recomputes the recommended session after the revised input is confirmed

### Requirement: The system SHALL include a preparation step before the active session runtime
The system SHALL provide a prep page that helps the user get ready for training, including setup notes, safety reminders, and runtime options such as voice support.

The preparation step SHALL allow the user to revise earlier setup inputs or language presentation without resetting the session context by default.

#### Scenario: Session needs preparation
- **WHEN** the user moves from recommendation into the active session
- **THEN** the system shows a preparation step before the first active runtime step
- **AND** the preparation step may include equipment setup guidance, including yoga-ball-specific setup when relevant

#### Scenario: User configures runtime support
- **WHEN** the user is on the preparation page
- **THEN** the system allows the user to enable or disable voice guidance before the session begins

#### Scenario: User revises setup from preparation
- **WHEN** the user selects an edit action for goal, equipment, or intake on the preparation screen
- **THEN** the system routes the user to the corresponding earlier step
- **AND** the app keeps the rest of the available session context until the revised input changes it

## ADDED Requirements

### Requirement: Active session exits SHALL require explicit confirmation
The system SHALL protect active runtime and unresolved post-session states from accidental abandonment when the user tries to return home or leave through a control-center action.

#### Scenario: User attempts to leave during runtime
- **WHEN** the user invokes a return-home or leave-session action during active runtime
- **THEN** the system asks for explicit confirmation before leaving
- **AND** the current session does not end silently from a single tap

### Requirement: Stage 3 runtime surfaces SHALL preserve context when locale changes
The system SHALL allow locale changes on recommendation, preparation, runtime, feedback, and next-step surfaces without resetting the current route or the current session context.

#### Scenario: User switches locale on a runtime-related page
- **WHEN** the user changes locale on recommendation, preparation, runtime, feedback, or next-step
- **THEN** the app refreshes visible copy into the selected locale
- **AND** the current page context remains active after the language change

#### Scenario: Locale changes do not reset active training state
- **WHEN** the user changes locale during an in-progress session
- **THEN** the app preserves timer, progress, and control state
- **AND** the language switch does not restart the session
