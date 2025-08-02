# Game Balance Configuration Examples

This file shows how easy it is to adjust game balance by modifying values in `gameConfig.js`.

## Current Configuration (Default Balanced)
```javascript
spinning: { baseCost: 1 }
symbols: { 
    definitions: [
        { name: '7', weight: 1 },     // Rarest
        { name: 'bell', weight: 3 },
        { name: 'cherry', weight: 5 },
        { name: 'lemon', weight: 8 },
        { name: 'orange', weight: 12 },
        { name: 'plum', weight: 18 },
        { name: 'watermelon', weight: 25 } // Most common
    ]
}
powerups: {
    double_money: { cost: 5, duration: 3 },
    lucky_sevens: { cost: 10, duration: 5 },
    symbol_lock: { cost: 15, duration: 1 }
}
```

## Example: "Easy Mode" Configuration
For a more casual experience:
```javascript
spinning: { baseCost: 0.5 }  // Cheaper spins
symbols: { 
    // Increase rare symbol chances
    definitions: [
        { name: '7', weight: 3 },     // More 7s
        { name: 'bell', weight: 5 },
        { name: 'cherry', weight: 8 },
        // ... other symbols
    ]
}
powerups: {
    double_money: { cost: 3, duration: 5 },  // Cheaper, longer
    lucky_sevens: { cost: 6, duration: 7 },
    symbol_lock: { cost: 8, duration: 2 }
}
```

## Example: "Hard Mode" Configuration  
For experienced players:
```javascript
spinning: { baseCost: 2 }  // More expensive spins
symbols: { 
    // Decrease rare symbol chances
    definitions: [
        { name: '7', weight: 0.5 },   // Even rarer 7s
        { name: 'bell', weight: 1 },
        { name: 'cherry', weight: 2 },
        // ... other symbols with higher weights
    ]
}
powerups: {
    double_money: { cost: 8, duration: 2 },   // More expensive, shorter
    lucky_sevens: { cost: 15, duration: 3 },
    symbol_lock: { cost: 25, duration: 1 }
}
```

## Example: "High Roller" Configuration
For players who want bigger risks and rewards:
```javascript
winCalculation: {
    horizontalCountMultiplier: {
        3: 2,  // 3 symbols = 2x instead of 1x
        4: 4,  // 4 symbols = 4x instead of 2x
        5: 8   // 5 symbols = 8x instead of 3x
    },
    diagonalBonus: 3,      // 3x instead of 1.5x
    xFormationBonus: 10    // 10x instead of 3x
}
progression: {
    reels: {
        2: { cost: 100 },  // Cheaper unlock
        3: { cost: 250 },
        4: { cost: 500 },
        5: { cost: 1000 }
    }
}
```

## How to Apply Changes
1. Open `src/js/config/gameConfig.js`
2. Modify the desired values
3. Refresh the game page
4. Changes take effect immediately!

No code compilation or complex setup required - just edit and play!