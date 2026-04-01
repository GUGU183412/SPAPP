## MODIFIED Requirements

### Requirement: The MVP SHALL use a goal-driven page sequence as its primary front-end flow
The system SHALL present the Stage 3 MVP as a goal-driven page sequence rather than a tutorial-first page sequence. The primary sequence SHALL be entry, goal selection, equipment selection, quick intake, recommendation, preparation, session runtime, session feedback, and next-step recommendation.

The normal user journey SHALL keep this sequence as its canonical path even when internal preview mode exists for review and QA.

#### Scenario: User follows the standard MVP journey
- **WHEN** a user starts the Stage 3 MVP
- **THEN** the system routes the user through the goal-driven page sequence
- **AND** the system does not force the user into the Stage 2 tutorial step sequence as the primary journey

#### Scenario: Product context is preserved without controlling the journey
- **WHEN** a user enters from a QR code or product-linked URL
- **THEN** the system preserves product or SKU context as recommendation input
- **AND** the system still enters the goal-driven flow instead of forcing a fixed tutorial page order

#### Scenario: Internal review uses preview mode without redefining the product flow
- **WHEN** preview mode is explicitly enabled for internal review
- **THEN** the system may expose direct navigation to major Stage 3 pages
- **AND** the canonical product journey remains the goal-driven sequence for normal users

### Requirement: The flow SHALL define recovery, exit, and return behavior
The system SHALL define how the user can go back, return home, revise earlier inputs, resume context, or recover when the standard flow is interrupted or when the session is not resolved smoothly.

#### Scenario: User navigates backward in the onboarding flow
- **WHEN** the user selects a back action before session start
- **THEN** the system returns the user to the previous logical page
- **AND** previously entered data remains available unless explicitly cleared

#### Scenario: User returns home before session start
- **WHEN** the user selects the return-home action before the active session begins
- **THEN** the system routes the user back to the Stage 3 home or entry screen
- **AND** previously entered goal, equipment, and intake data remain available as draft context

#### Scenario: User revises a specific earlier decision from a later pre-session page
- **WHEN** the user selects an edit action for goal, equipment, or intake from recommendation or preparation
- **THEN** the system routes the user to the matching earlier step
- **AND** the system preserves other compatible context until the revised input changes downstream results

#### Scenario: User exits during active session
- **WHEN** the user attempts to leave the active session flow through a return-home action
- **THEN** the system requires explicit confirmation before abandoning the current runtime surface
- **AND** the exit path does not silently discard the in-progress experience

#### Scenario: User cannot continue after training or prep
- **WHEN** the user reports that the session was not suitable or cannot continue
- **THEN** the system offers a recovery path such as easier repeat, prep review, re-recommendation, or support routing
