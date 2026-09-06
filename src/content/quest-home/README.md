# Quest Home Module Refactor

This module has been refactored from a single large file (`quest-home.ts`) into multiple smaller, focused modules following the pattern established by `quest-code.ts`.

## Modules Created

1. **constants.ts** - Contains `ELEMENT_IDS` and `STYLES` constants
2. **dom.ts** - DOM utility functions (`getQuestButton`, `getQuestPanel`, `getQuestListContainer`, `createElement`)
3. **button.ts** - Quest button logic (`createQuestButton`, `handleButtonClick`, `updateButtonState`)
4. **panel.ts** - Panel management (`createExpandedPanel`, `togglePanel`)
5. **quest-list.ts** - Quest list updating (`updateQuestListUI`, `updateQuestItemUI`)
6. **message-handler.ts** - Message handling from Discord (`handleQuestMessage`, `isQuestMessage`, `handleWindowMessage`)
7. **route-watcher.ts** - Route observation (`watchRouteChanges`, `handleRouteChange`)
8. **lifecycle.ts** - Initialization and cleanup (`init`, `dispose`, `removeElements`)
9. **index.ts** - Re-exports all public functionality
10. **quest-home.ts** - Main entry point (updated to use the modules while preserving IIFE behavior)

## Design Goals Achieved

- **Separation of Concerns**: Each module has a single, well-defined responsibility
- **Maintainability**: Smaller files are easier to understand and modify
- **Reusability**: Functions can be imported and used independently where needed
- **Consistency**: Follows the same pattern as the quest-code module
- **Preserved Functionality**: All original behavior is maintained exactly
