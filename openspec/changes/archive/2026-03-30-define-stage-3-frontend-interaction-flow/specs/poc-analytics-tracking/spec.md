## MODIFIED Requirements

### Requirement: The PoC records the minimum funnel and progression events
The system SHALL record the minimum analytics event set needed to evaluate the Stage 3 MVP funnel from entry through onboarding, recommendation, session start, session progression, completion, and post-session routing.

#### Scenario: Entry and onboarding events are captured
- **WHEN** a user enters the MVP and begins the Stage 3 flow
- **THEN** the system records entry context and the relevant onboarding events such as `entry_open`, `goal_select`, and `equipment_select`

#### Scenario: Recommendation and session events are captured
- **WHEN** a user receives a recommendation or starts a training session
- **THEN** the system records `plan_recommend` and `session_start`
- **AND** the system records step-level or progression events needed to understand runtime completion

### Requirement: The PoC records trust and outcome events
The system SHALL record the events needed to measure recommendation acceptance, runtime support usage, and session outcomes in the Stage 3 MVP.

#### Scenario: Runtime support interaction is captured
- **WHEN** a user uses session support features such as voice prompts, timers, or mirror/self-preview mode
- **THEN** the system records the relevant support interaction events such as `timer_use`, `voice_prompt_use`, or `mirror_mode_use`

#### Scenario: Session feedback is captured
- **WHEN** a user submits post-session feedback
- **THEN** the system records `session_feedback`
- **AND** if the session is completed, the system records `session_complete`

### Requirement: The PoC records enough metadata to analyze dropout and review paths
The system SHALL include the metadata required to analyze where users drop, which recommendations they accept, which equipment contexts they use, and which next-step routes are triggered after feedback.

#### Scenario: Dropout metadata is available for the Stage 3 journey
- **WHEN** the user exits or abandons the Stage 3 flow before completing the session
- **THEN** the system records or derives the relevant page, module, and context needed to identify the dropout point

#### Scenario: Next-step routing metadata is available
- **WHEN** a user completes the feedback step and receives a next-step route
- **THEN** the system stores the selected outcome, blocker metadata, and routed next action with the event data
