# Capability: locale-preview-switching

## Purpose

Define how Stage 3 resolves locale, switches between Chinese and English, and preserves context during bilingual review.

## Requirements

### Requirement: The UI SHALL support Chinese and English preview switching
The system SHALL allow the Stage 3 UI to switch between Chinese and English presentation for review and future internationalization work.

#### Scenario: User changes the UI language from inside the app
- **WHEN** the user selects a supported locale switch action
- **THEN** the system updates visible Stage 3 UI copy to the selected locale
- **AND** the system keeps the user inside the same app shell instead of forcing a restart

### Requirement: Locale resolution SHALL support URL override and persisted preference
The system SHALL resolve the active locale using URL override first, persisted local preference second, and the default Chinese locale last.

#### Scenario: URL override is present
- **WHEN** the app is opened with a supported `lang` query parameter
- **THEN** the system uses the locale from the URL for that session
- **AND** the URL-provided locale takes precedence over any previously saved preference

#### Scenario: Persisted locale is reused
- **WHEN** the app is opened without a `lang` query parameter and a supported locale was previously selected
- **THEN** the system restores the saved locale preference
- **AND** the app does not require the user to switch languages again manually

### Requirement: Locale switching SHALL preserve current page context
The system SHALL treat locale as presentation state and SHALL preserve the current route and relevant user selections when the locale changes.

#### Scenario: User switches locale on a pre-session page
- **WHEN** the user changes locale on goal selection, equipment selection, intake, recommendation, or preparation
- **THEN** the system keeps the user on the same page
- **AND** the current selections remain available after the copy refreshes

#### Scenario: User switches locale during or after a session
- **WHEN** the user changes locale on runtime, feedback, or next-step surfaces
- **THEN** the system keeps the current page context intact
- **AND** timers, progress, and submitted feedback state are not reset solely because the locale changed

### Requirement: Missing translated copy SHALL fall back safely
The system SHALL fall back to the default Chinese copy when a supported English string is unavailable so that UI text never renders as empty or broken.

#### Scenario: A translated message is missing
- **WHEN** the selected locale does not provide a message required by the current screen
- **THEN** the system renders the default Chinese copy for that message
- **AND** the rest of the screen continues rendering normally
