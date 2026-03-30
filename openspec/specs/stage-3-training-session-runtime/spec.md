# Capability: stage-3-training-session-runtime

## Purpose

Define the recommendation, preparation, runtime pacing, voice support, and post-session routing contract for the Stage 3 training experience.

## Requirements

### Requirement: The system SHALL recommend a structured first-session plan before runtime begins
The system SHALL present a recommendation screen that summarizes the proposed first session, explains why it was selected, and shows the minimum details required for the user to decide whether to begin.

#### Scenario: User reaches recommendation
- **WHEN** the user completes goal, equipment, and intake inputs
- **THEN** the system presents a recommended session with title, estimated duration, equipment summary, and key safety notes
- **AND** the recommendation includes a primary action to begin the session

#### Scenario: User needs more confidence before starting
- **WHEN** the user reviews the recommendation
- **THEN** the system provides a concise explanation of why this plan was recommended
- **AND** the user can continue into a preparation step before runtime starts

### Requirement: The system SHALL include a preparation step before the active session runtime
The system SHALL provide a prep page that helps the user get ready for training, including setup notes, safety reminders, and runtime options such as voice support.

#### Scenario: Session needs preparation
- **WHEN** the user moves from recommendation into the active session
- **THEN** the system shows a preparation step before the first active runtime step
- **AND** the preparation step may include equipment setup guidance, including yoga-ball-specific setup when relevant

#### Scenario: User configures runtime support
- **WHEN** the user is on the preparation page
- **THEN** the system allows the user to enable or disable voice guidance before the session begins

### Requirement: The system SHALL provide a follow-along runtime with timing and pacing controls
The system SHALL provide a session runtime page that displays the active step, supports progression through the session, and provides visible work and rest pacing.

#### Scenario: User runs a session step
- **WHEN** the session starts
- **THEN** the system shows the current exercise or prep step
- **AND** the system shows overall session progress
- **AND** the system provides controls to pause, resume, and advance according to the session design

#### Scenario: Active step includes time-based pacing
- **WHEN** the active step includes a work or rest duration
- **THEN** the system shows the relevant timer state to the user
- **AND** the system updates the pacing display as the session progresses

### Requirement: The runtime SHALL support lightweight voice guidance without requiring audio
The session runtime SHALL remain usable visually and SHALL optionally provide voice prompts for critical transitions.

#### Scenario: Voice guidance is enabled
- **WHEN** the user begins the session with voice guidance enabled
- **THEN** the runtime provides prompts for start, countdown, transition, rest, and completion events

#### Scenario: Voice guidance is disabled
- **WHEN** the user begins the session with voice guidance disabled
- **THEN** the runtime still provides complete visual pacing and progression support

### Requirement: The runtime SHALL capture structured post-session feedback and route the next action
The system SHALL collect structured post-session feedback and SHALL provide a next-step screen that routes the user to the most relevant follow-up action.

#### Scenario: User completes session feedback
- **WHEN** the session ends
- **THEN** the system asks whether the session was completed and whether it felt suitable
- **AND** the system allows the user to indicate uncertainty, blockers, or discomfort

#### Scenario: System routes the user after feedback
- **WHEN** the feedback is submitted
- **THEN** the system presents a next-step recommendation such as repeat easier, continue, review prep, or support
- **AND** the next-step recommendation reflects the submitted feedback outcome
