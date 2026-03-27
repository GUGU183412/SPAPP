## ADDED Requirements

### Requirement: Scan entry opens the first SKU landing experience
The system SHALL allow users who enter from a QR code to open a landing page for the configured first ASIN and start the guided installation flow without requiring account creation or app installation.

#### Scenario: User enters from QR code
- **WHEN** a user opens the PoC entry URL with the first ASIN context
- **THEN** the system displays the landing page for `B0BXJLTRSH`
- **AND** the landing page shows the SKU confirmation and a clear action to start the 3-step installation guide

### Requirement: Guided installation flow covers the 3-step safety sequence
The system SHALL provide a guided installation tutorial consisting of Step 1 lock verification, Step 2 safety proof, and Step 3 door protection and placement guidance.

#### Scenario: User progresses through the tutorial
- **WHEN** a user starts the tutorial from the landing page
- **THEN** the system presents Step 1, Step 2, and Step 3 in order
- **AND** each step includes a next action to advance to the following step

#### Scenario: Step content matches stage-1 focus areas
- **WHEN** the user views the three installation steps
- **THEN** Step 1 focuses on slip prevention and correct locking
- **AND** Step 2 focuses on stitching safety proof
- **AND** Step 3 focuses on door protection and hinge-side placement

### Requirement: The tutorial content is driven by structured data
The system SHALL source the first SKU tutorial content from a structured content object so the PoC can be updated without rewriting page logic.

#### Scenario: First SKU content is loaded
- **WHEN** the application renders the landing page and tutorial pages
- **THEN** the visible title, step copy, and related content are read from a structured data source for the configured ASIN

