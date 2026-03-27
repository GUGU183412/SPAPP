## 1. Screen Structure Refactor

- [x] 1.1 Refactor the landing screen render path to match the archived high-fidelity landing layout while preserving ASIN-driven entry behavior
- [x] 1.2 Replace the shared generic Step 1 rendering with the approved lock-check comparison layout from the archived mockup
- [x] 1.3 Replace the shared generic Step 2 rendering with the approved stitching proof and safety endorsement layout from the archived mockup
- [x] 1.4 Replace the shared generic Step 3 rendering with the approved door protection and hinge-side placement layout from the archived mockup

## 2. Decision Screen Restoration

- [x] 2.1 Rebuild the feedback screen to match the approved large-format resolved decision layout while preserving current resolved submission logic
- [x] 2.2 Rebuild the unresolved follow-up screen to match the approved card-based reason selection layout while preserving reason mapping and submission behavior
- [x] 2.3 Restore screen-specific bottom navigation and supporting visual anchors where required by the approved mockups

## 3. Logic Preservation And Cleanup

- [x] 3.1 Preserve existing analytics events and state transitions while adapting the screen-specific JSX structure
- [x] 3.2 Remove the visible PoC event log from the default user-facing viewport without disabling the underlying tracking storage
- [x] 3.3 Consolidate screen-specific styles and helper structures so the restored UI remains maintainable within the current single-page app

## 4. Verification

- [x] 4.1 Verify the restored flow still supports the public `asin` entry path, end-to-end navigation, and unresolved review routing
- [x] 4.2 Run a production build and perform a visual QA pass against the archived mockups for Landing, Step 1, Step 2, Step 3, Feedback, and Unresolved
