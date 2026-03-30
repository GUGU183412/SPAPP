## MODIFIED Requirements

### Requirement: The MVP SHALL use a goal-driven page sequence as its primary front-end flow
The system SHALL present the Stage 3 MVP as a goal-driven page sequence rather than a tutorial-first page sequence. The primary sequence SHALL be entry, goal selection, equipment selection, quick intake, recommendation, preparation, session runtime, session feedback, and next-step recommendation.

The user-facing shell SHALL be mobile-first and single-column, and each page in the sequence SHALL focus on one primary task rather than acting as a presentation or explanatory layout.

#### Scenario: User follows the standard MVP journey
- **WHEN** a user starts the Stage 3 MVP
- **THEN** the system routes the user through the goal-driven page sequence
- **AND** the system does not force the user into the Stage 2 tutorial step sequence as the primary journey

#### Scenario: Product context is preserved without controlling the journey
- **WHEN** a user enters from a QR code or product-linked URL
- **THEN** the system preserves product or SKU context as recommendation input
- **AND** the system still enters the goal-driven flow instead of forcing a fixed tutorial page order

#### Scenario: iPhone user sees a task-focused page
- **WHEN** a user opens any Stage 3 page on iPhone
- **THEN** the page presents a single-column mobile layout
- **AND** the page emphasizes the next action instead of explanatory side content

### Requirement: Each Stage 3 page SHALL expose a clear functional contract and CTA state
The system SHALL define a specific functional purpose for each page in the Stage 3 sequence and SHALL gate the primary CTA until the minimum input for that page is complete.

The system SHALL keep supporting copy brief and SHALL avoid stacked explanatory cards or internal-product framing on user-facing task pages.

#### Scenario: User is on a decision page
- **WHEN** the user has not completed the required input for the current page
- **THEN** the primary CTA remains disabled or unavailable
- **AND** the system clearly indicates what input is still required

#### Scenario: User completes the required input
- **WHEN** the minimum required input for the current page is complete
- **THEN** the primary CTA becomes available
- **AND** the system allows the user to continue to the next page in the defined flow

#### Scenario: Entry screen avoids presentation-style content
- **WHEN** the user opens the entry screen
- **THEN** the screen SHALL show a concise introduction and a primary start action
- **AND** the screen SHALL not include architecture panels, project-phase information, or multiple explanatory marketing cards

### Requirement: The flow SHALL define recovery, exit, and return behavior
The system SHALL define how the user can go back, exit, resume, or recover when the standard flow is interrupted or when the session is not resolved smoothly.

#### Scenario: User navigates backward in the onboarding flow
- **WHEN** the user selects a back action before session start
- **THEN** the system returns the user to the previous logical page
- **AND** previously entered data remains available unless explicitly cleared

#### Scenario: User cannot continue after training or prep
- **WHEN** the user reports that the session was not suitable or cannot continue
- **THEN** the system offers a recovery path such as easier repeat, prep review, re-recommendation, or support routing
