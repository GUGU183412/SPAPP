## ADDED Requirements

### Requirement: Stage 2 PoC can be opened from a stable public GitHub Pages URL
The system SHALL publish the Stage 2 PoC to a stable public GitHub Pages URL so the first-ASIN demo can be opened without a local preview environment.

#### Scenario: Public demo entry is available
- **WHEN** the Stage 2 demo is deployed to GitHub Pages
- **THEN** the team can open the PoC from a public URL without running the app locally

### Requirement: The public demo URL opens the first-ASIN experience
The system SHALL provide a canonical public entry URL that opens the Stage 2 demo for `B0BXJLTRSH`.

#### Scenario: Public demo link opens the correct landing flow
- **WHEN** a user opens the standard Stage 2 demo URL
- **THEN** the system loads the Landing page for `B0BXJLTRSH`
- **AND** the user can begin the 3-step installation guide from that entry

### Requirement: Deployment flow is documented for repeatable publishing
The system SHALL document the GitHub Pages deployment flow, including build expectations and the canonical public entry URL.

#### Scenario: Team member needs to reproduce the public demo
- **WHEN** a team member follows the Stage 2 deployment documentation
- **THEN** they can identify how the public demo is published
- **AND** they can find the canonical URL used for sharing and demos
