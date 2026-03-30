## ADDED Requirements

### Requirement: The PWA SHALL present itself as Shifu in browser and install surfaces
The system SHALL use `Shifu` as the user-visible app identity in the browser title and the installed PWA shell.

#### Scenario: Browser title reflects the current product identity
- **WHEN** a user opens the web app from a QR code or direct URL
- **THEN** the browser title SHALL display `Shifu`

#### Scenario: Installed PWA identity reflects the current product identity
- **WHEN** a user adds the web app to the home screen or opens it in standalone mode
- **THEN** the manifest `name` and `short_name` SHALL identify the app as `Shifu`

### Requirement: The PWA SHALL not expose the legacy Stage 2 installation-guide identity
The system SHALL remove the old Door Anchor installation-guide naming from user-visible app identity metadata.

#### Scenario: User opens the app on iPhone
- **WHEN** the page loads in Safari or standalone mode
- **THEN** the user SHALL not see the legacy `Door Anchor Installation Guide` title or `Door Anchor Guide` app name
