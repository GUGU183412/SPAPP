## ADDED Requirements

### Requirement: The flow captures whether the tutorial resolved the problem
The system SHALL ask the user whether the problem is resolved after the guided installation flow is complete.

#### Scenario: User reaches the end of the tutorial
- **WHEN** a user completes Step 3
- **THEN** the system displays a feedback page asking whether the problem is resolved
- **AND** the user can select either a resolved or unresolved outcome

### Requirement: Unresolved outcomes collect structured reasons
The system SHALL collect a structured unresolved reason when the user indicates that the problem is not resolved.

#### Scenario: User reports unresolved status
- **WHEN** a user selects the unresolved outcome on the feedback page
- **THEN** the system displays a follow-up page with predefined unresolved reason choices
- **AND** the user can optionally submit an additional note

### Requirement: Unresolved reasons recommend the most relevant next step
The system SHALL guide unresolved users back to the most relevant tutorial step or support action based on the selected reason.

#### Scenario: User selects a reason related to locking
- **WHEN** a user selects `still_slips` or `not_sure_locked`
- **THEN** the system recommends reviewing Step 1

#### Scenario: User selects a reason related to stitching trust
- **WHEN** a user selects `stitching_safety`
- **THEN** the system recommends reviewing Step 2

#### Scenario: User selects a reason related to placement or door protection
- **WHEN** a user selects `wrong_placement` or `door_damage_worry`
- **THEN** the system recommends reviewing Step 3

#### Scenario: User selects a reason related to door fit
- **WHEN** a user selects `door_not_fit`
- **THEN** the system recommends a support path

