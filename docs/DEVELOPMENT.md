# Development Guide

## Architecture Overview

This project follows a modular, component-based architecture with clear separation of concerns:

### Core Components

- **SlotMachine.js**: Main orchestrator that initializes and coordinates all components
- **GameState.js**: Manages overall game state, UI updates, and user interactions
- **StorageManager.js**: Handles all localStorage operations for data persistence

### Game Components

- **Reels.js**: Manages reel spinning, symbol generation, and reel interactions
- **Powerups.js**: Handles powerup system, purchases, and effects
- **BetManager.js**: Manages betting system and multipliers

### Utilities

- **symbols.js**: Symbol definitions, weights, and random generation
- **winCalculator.js**: Win detection and calculation logic
- **animations.js**: Animation helpers and dynamic styles

## Code Organization Principles

1. **Single Responsibility**: Each file has one clear purpose
2. **Dependency Injection**: Components receive dependencies rather than creating them
3. **Event-Driven**: Components communicate through events and callbacks
4. **Modular CSS**: Styles organized by component and feature
5. **ES6 Modules**: Modern import/export system for clean dependencies

## Adding New Features

### Adding a New Powerup

1. Add powerup definition to `src/js/components/Powerups.js`
2. Implement powerup logic in relevant component (usually Reels.js or WinCalculator.js)
3. Update HTML structure if needed
4. Add CSS styles to `src/css/components/powerups.css`

### Adding New Symbol

1. Add symbol to `src/js/utils/symbols.js`
2. Add corresponding CSS class to `src/css/components/slot-machine.css`
3. Update win values in `getSymbolValue()` function

### Adding New Win Pattern

1. Add pattern detection logic to `src/js/utils/winCalculator.js`
2. Add highlighting logic to `highlightWinningSymbols()` method
3. Test thoroughly with different symbol combinations

## Testing

Currently using manual testing. Future improvements:
- Unit tests for utility functions
- Integration tests for component interactions
- Visual regression tests for UI consistency

## Performance Considerations

- Reels use CSS transitions for smooth animations
- Win calculations are done after reels stop to avoid blocking
- LocalStorage operations are minimized and batched
- CSS animations use transform/opacity for hardware acceleration

## Browser Compatibility

- Uses ES6 modules (requires modern browsers)
- CSS custom properties for theming
- Flexbox for layout
- No polyfills currently included