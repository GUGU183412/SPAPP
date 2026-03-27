# Capability: poc-analytics-tracking

## Purpose

Define the minimum analytics event model for the Stage 2 PoC so the team can evaluate scan entry, progression, trust, resolution, unresolved reasons, and dropout behavior.

## Requirements

### Requirement: The PoC records the minimum funnel and progression events
The system SHALL record the minimum analytics event set needed to evaluate entry, tutorial progression, completion, and unresolved outcomes for the first ASIN.

#### Scenario: Entry and tutorial events are captured
- **WHEN** a user enters the PoC and starts the tutorial
- **THEN** the system records `pwa_entry`, `sku_view`, and `tutorial_start`

#### Scenario: Step progression events are captured
- **WHEN** a user views or completes a tutorial step
- **THEN** the system records `step_view` and `step_complete` with the current step metadata

### Requirement: The PoC records trust and outcome events
The system SHALL record the events needed to measure safety proof engagement and tutorial resolution results.

#### Scenario: Safety proof interaction is captured
- **WHEN** a user opens or clicks into the Step 2 safety proof detail
- **THEN** the system records `safety_trust_click`

#### Scenario: Feedback and unresolved reason submission are captured
- **WHEN** a user submits a resolved or unresolved outcome
- **THEN** the system records `resolved_status`
- **AND** if unresolved, the system records `unresolved_reason_submit`

### Requirement: The PoC records enough metadata to analyze dropout and review paths
The system SHALL include the metadata required to analyze dropout points, unresolved reason categories, and recommended review paths.

#### Scenario: Dropout metadata is available
- **WHEN** the user exits or abandons a tutorial step before completing the flow
- **THEN** the system records or derives the relevant dropout step context

#### Scenario: Unresolved reason metadata is available
- **WHEN** a user submits an unresolved reason
- **THEN** the system stores the selected reason and recommended review target with the event data
