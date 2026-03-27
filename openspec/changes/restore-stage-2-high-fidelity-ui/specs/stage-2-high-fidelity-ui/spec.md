## ADDED Requirements

### Requirement: Landing screen SHALL match the approved Stage 2 high-fidelity layout
The system SHALL render the public entry landing screen using the approved Stage 2 high-fidelity structure so the public demo visually matches the archived design baseline while preserving ASIN-driven entry.

#### Scenario: User opens the public Stage 2 landing entry
- **WHEN** a user opens the Stage 2 public demo URL for `B0BXJLTRSH`
- **THEN** the landing screen presents the approved hero layout with high-impact editorial typography, ASIN confirmation, product image treatment, start CTA, and fixed bottom navigation
- **AND** the visible layout matches the approved landing mockup hierarchy rather than the simplified PoC card layout

### Requirement: Tutorial steps SHALL render page-specific high-fidelity layouts
The system SHALL render Step 1, Step 2, and Step 3 using their approved page-specific layouts instead of a shared generic step shell.

#### Scenario: User views Step 1
- **WHEN** the user enters Step 1
- **THEN** the screen presents the approved lock-check comparison layout with distinct incorrect and correct visual states
- **AND** the screen preserves the existing progression behavior to Step 2

#### Scenario: User views Step 2
- **WHEN** the user enters Step 2
- **THEN** the screen presents the approved stitching proof layout with editorial hero media, load capacity emphasis, and trust-supporting safety cards
- **AND** the screen preserves the existing `safety_trust_click` interaction path

#### Scenario: User views Step 3
- **WHEN** the user enters Step 3
- **THEN** the screen presents the approved door protection layout with backing material hero treatment, hinge-side guidance, and placement diagram
- **AND** the screen preserves the existing progression behavior to the feedback screen

### Requirement: Feedback and unresolved screens SHALL match the approved decision layouts
The system SHALL render the feedback and unresolved follow-up screens using the approved decision-oriented layouts so the end-of-flow experience matches the archived Stage 2 baseline.

#### Scenario: User reaches the feedback screen
- **WHEN** the user completes Step 3
- **THEN** the feedback screen presents the approved large-format resolved decision layout with distinct positive and negative options
- **AND** the screen preserves the existing `resolved_status` submission behavior

#### Scenario: User reaches the unresolved follow-up screen
- **WHEN** the user selects the unresolved feedback path
- **THEN** the follow-up screen presents the approved unresolved reason card list, recommendation guidance, optional note input, and submission action
- **AND** the screen preserves the existing unresolved reason routing and `unresolved_reason_submit` behavior

### Requirement: High-fidelity restoration SHALL preserve Stage 2 validated business behavior
The system SHALL preserve the approved Stage 2 business behavior while restoring the high-fidelity visuals.

#### Scenario: User completes the restored flow
- **WHEN** a user proceeds from landing through the tutorial and submits feedback
- **THEN** the same step order, unresolved routing logic, and query-driven ASIN handling remain intact
- **AND** the existing analytics event model continues to fire for entry, progression, trust click, resolved status, unresolved reason submission, and dropout tracking

### Requirement: User-facing demo screens SHALL exclude temporary PoC-only debug UI
The system SHALL exclude temporary debug-facing UI from the default user-facing demo so presentation quality matches stakeholder expectations.

#### Scenario: User opens the public demo during review
- **WHEN** the user views the Stage 2 app in normal demo mode
- **THEN** temporary debug panels such as the visible event log are not shown in the primary viewport
- **AND** the removal of those elements does not disable the underlying tracking behavior
