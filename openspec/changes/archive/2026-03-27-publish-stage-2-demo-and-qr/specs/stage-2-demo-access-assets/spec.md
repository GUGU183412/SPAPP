## ADDED Requirements

### Requirement: QR assets are generated from the final public demo URL
The system SHALL generate Stage 2 QR assets from the final public demo URL so scan entry always matches the shared public demo.

#### Scenario: QR asset points to the public demo
- **WHEN** the team generates a Stage 2 QR code
- **THEN** the QR content matches the canonical public demo URL

### Requirement: QR outputs are reusable in internal sharing materials
The system SHALL provide QR assets in reusable output formats suitable for Feishu docs and presentation materials.

#### Scenario: Team needs QR assets for documentation
- **WHEN** the Stage 2 QR workflow completes
- **THEN** the team has QR image assets that can be embedded in docs and slides

### Requirement: QR asset workflow is documented
The system SHALL document how QR assets are generated, named, and stored so the assets can be recreated if the public URL changes.

#### Scenario: Public URL changes after initial QR generation
- **WHEN** the canonical Stage 2 demo URL is updated
- **THEN** the team can follow the documented workflow to regenerate QR assets against the new URL
