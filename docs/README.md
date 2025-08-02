# Slot Machine Game

A professional slot machine game with daily free spins, powerup system, and retro CRT visual effects.

## Features

- **5-Reel Slot Machine** with weighted symbol system
- **Daily Free Spins** - Reset every 24 hours
- **Powerup System** with three unique powerups:
  - Double Money: Double winnings for 3 spins
  - Lucky 7s: Higher chance for rare symbols for 5 spins
  - Symbol Lock: Lock 2 reels on next spin
- **Auto Spin** functionality
- **Betting System** with 1x, 2x, 5x, 10x, 25x multipliers
- **Win Detection** for horizontal, vertical, and diagonal patterns
- **Retro CRT Effects** with scanlines, rolling distortion, and color shift
- **Responsive Design** for mobile and desktop
- **LocalStorage** for persistent game state

## Project Structure

```
/
├── src/
│   ├── js/
│   │   ├── core/                 # Core game logic
│   │   │   ├── SlotMachine.js    # Main game orchestrator
│   │   │   ├── GameState.js      # Game state management
│   │   │   └── StorageManager.js # LocalStorage handling
│   │   ├── components/           # Game components
│   │   │   ├── Reels.js          # Reel management and spinning
│   │   │   ├── Powerups.js       # Powerup system
│   │   │   ├── BetManager.js     # Betting and multipliers
│   │   │   └── UI.js             # UI management
│   │   ├── utils/                # Utility functions
│   │   │   ├── animations.js     # Animation helpers
│   │   │   ├── symbols.js        # Symbol definitions
│   │   │   └── winCalculator.js  # Win calculation logic
│   │   └── main.js               # Application entry point
│   ├── css/
│   │   ├── base/                 # Base styles
│   │   │   ├── reset.css         # CSS reset
│   │   │   ├── typography.css    # Typography styles
│   │   │   └── variables.css     # CSS custom properties
│   │   ├── components/           # Component styles
│   │   │   ├── slot-machine.css  # Main slot machine styles
│   │   │   ├── powerups.css      # Powerup panel styles
│   │   │   ├── buttons.css       # Button styles
│   │   │   └── reels.css         # Reel-specific styles
│   │   ├── effects/              # Visual effects
│   │   │   ├── crt-effects.css   # CRT/retro TV effects
│   │   │   └── animations.css    # Animation styles
│   │   └── main.css              # Main CSS file (imports all)
│   └── assets/                   # Static assets (future use)
├── docs/                         # Documentation
├── tests/                        # Test files (future use)
├── dist/                         # Built files (future use)
├── index.html                    # Main HTML file
├── package.json                  # Project configuration
└── README.md                     # This file
```

## Getting Started

### Prerequisites

- Modern web browser with ES6 module support
- Python 3 (for local development server)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/JackScheff420/SlotMachine.git
cd SlotMachine
```

2. Start the development server:
```bash
npm start
# or
python3 -m http.server 8080
```

3. Open your browser and navigate to `http://localhost:8080`

## How to Play

1. **Spinning**: Click "SPIN" to play (costs 1 coin by default)
2. **Free Spins**: Available once every 24 hours
3. **Betting**: Use the multiplier buttons (1x-25x) to increase your bet
4. **Auto Spin**: Click "AUTO SPIN" for continuous play
5. **Powerups**: Purchase powerups with coins to enhance your gameplay
6. **Wins**: Match 3+ symbols horizontally, vertically, or diagonally

## Symbol Values (Lowest to Highest)

- 🍉 Watermelon (2x) - Most common
- 🍇 Plum (3x)
- 🍊 Orange (4x)
- 🍋 Lemon (5x)
- 🍒 Cherry (6x)
- 🔔 Bell (8x)
- 7 Seven (10x) - Rarest, Jackpot symbol

## Development

### Architecture

This project follows a modular, component-based architecture:

- **Separation of Concerns**: Each file has a single responsibility
- **ES6 Modules**: Modern JavaScript module system
- **Component-Based CSS**: Organized by feature/component
- **Professional Structure**: Industry-standard project organization

### Scripts

```bash
npm start    # Start development server
npm run dev  # Start development server (alias)
npm run build # Build for production (to be implemented)
npm test     # Run tests (to be implemented)
```

## Browser Support

- Chrome 61+
- Firefox 60+
- Safari 10.1+
- Edge 16+

## License

MIT License - See LICENSE file for details

## Author

Maximilian Scheffler