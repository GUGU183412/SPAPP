## ADDED Requirements

### Requirement: The MVP SHALL use a goal-driven page sequence as its primary front-end flow
The system SHALL present the Stage 3 MVP as a goal-driven page sequence rather than a tutorial-first page sequence. The primary sequence SHALL be entry, goal selection, equipment selection, quick intake, recommendation, preparation, session runtime, session feedback, and next-step recommendation.

#### Scenario: User follows the standard MVP journey
- **WHEN** a user starts the Stage 3 MVP
- **THEN** the system routes the user through the goal-driven page sequence
- **AND** the system does not force the user into the Stage 2 tutorial step sequence as the primary journey

#### Scenario: Product context is preserved without controlling the journey
- **WHEN** a user enters from a QR code or product-linked URL
- **THEN** the system preserves product or SKU context as recommendation input
- **AND** the system still enters the goal-driven flow instead of forcing a fixed tutorial page order

### Requirement: The equipment selection step SHALL support yoga ball priority without restricting equipment breadth
The system SHALL present yoga ball as a first-class equipment option for Stage 3 and SHALL also allow selection of other supported equipment and a no-equipment option.

#### Scenario: User selects yoga ball
- **WHEN** the user reaches equipment selection
- **THEN** the system offers yoga ball as an available equipment choice
- **AND** yoga-ball selection can influence the recommendation output

#### Scenario: User needs another setup
- **WHEN** the user reaches equipment selection
- **THEN** the system also offers other supported equipment choices and a no-equipment choice
- **AND** the user is not blocked from continuing if yoga ball is not selected

### Requirement: Each Stage 3 page SHALL expose a clear functional contract and CTA state
The system SHALL define a specific functional purpose for each page in the Stage 3 sequence and SHALL gate the primary CTA until the minimum input for that page is complete.

#### Scenario: User is on a decision page
- **WHEN** the user has not completed the required input for the current page
- **THEN** the primary CTA remains disabled or unavailable
- **AND** the system clearly indicates what input is still required

#### Scenario: User completes the required input
- **WHEN** the minimum required input for the current page is complete
- **THEN** the primary CTA becomes available
- **AND** the system allows the user to continue to the next page in the defined flow

### Requirement: The flow SHALL define recovery, exit, and return behavior
The system SHALL define how the user can go back, exit, resume, or recover when the standard flow is interrupted or when the session is not resolved smoothly.

#### Scenario: User navigates backward in the onboarding flow
- **WHEN** the user selects a back action before session start
- **THEN** the system returns the user to the previous logical page
- **AND** previously entered data remains available unless explicitly cleared

#### Scenario: User cannot continue after training or prep
- **WHEN** the user reports that the session was not suitable or cannot continue
- **THEN** the system offers a recovery path such as easier repeat, prep review, re-recommendation, or support routing

### Requirement: The implementation plan SHALL support short-cycle progress review
The Stage 3 front-end flow definition SHALL include implementation checkpoints that can be demonstrated every 3 days and at each key result milestone.

#### Scenario: A short-cycle checkpoint is reached
- **WHEN** 3 days of implementation work have elapsed or a key result slice is completed
- **THEN** the team can demonstrate the current flow state against the defined page contract
- **AND** the checkpoint supports review with项目经理田楚 before scope continues
