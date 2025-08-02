/**
 * Game Balance Configuration
 * 
 * This file contains all game balance values including costs, multipliers, chances,
 * and progression requirements. Modify these values to adjust game balance.
 */

export const gameConfig = {
    // ===== SPIN COSTS =====
    spinning: {
        baseCost: 1,  // Base cost for one spin in coins
    },

    // ===== SYMBOL CONFIGURATION =====
    symbols: {
        // Symbol definitions with spawn weights (higher weight = more common)
        definitions: [
            { name: '7', class: 'symbol-7', display: '7', weight: 1 },            // Rarest
            { name: 'bell', class: 'symbol-bell', display: '🔔', weight: 3 },     // Very rare
            { name: 'cherry', class: 'symbol-cherry', display: '🍒', weight: 5 }, // Rare
            { name: 'lemon', class: 'symbol-lemon', display: '🍋', weight: 8 },   // Uncommon
            { name: 'orange', class: 'symbol-orange', display: '🍊', weight: 12 }, // Common
            { name: 'plum', class: 'symbol-plum', display: '🍇', weight: 18 },     // Very common
            { name: 'watermelon', class: 'symbol-watermelon', display: '🍉', weight: 25 } // Most common
        ],

        // Symbol values for win calculations (higher value = better payout)
        values: {
            'watermelon': 2,  // Lowest value
            'plum': 3,
            'orange': 4,
            'lemon': 5,
            'cherry': 6,
            'bell': 8,
            '7': 10,          // Highest value
        }
    },

    // ===== WIN CALCULATION MULTIPLIERS =====
    winCalculation: {
        // Base multipliers for horizontal wins (based on number of symbols)
        // 3 symbols = 1x, 4 symbols = 2x, 5 symbols = 3x
        horizontalCountMultiplier: {
            3: 1,
            4: 2,
            5: 3
        },

        // Multiplier for vertical wins (3 symbols in a column)
        verticalMultiplier: 1,

        // Bonus multipliers for special patterns
        diagonalBonus: 1.5,      // Bonus for single diagonal lines
        xFormationBonus: 3,      // Bonus for complete X formation (both diagonals)

        // Double money powerup multiplier
        doubleMoney: 2
    },

    // ===== POWERUP SYSTEM =====
    powerups: {
        definitions: [
            {
                id: 'double_money',
                name: 'Double Money',
                description: 'Double winnings for 3 spins',
                cost: 5,
                duration: 3,
                icon: '💰'
            },
            {
                id: 'lucky_sevens',
                name: 'Lucky 7s',
                description: 'Higher chance for rare symbols for 5 spins',
                cost: 10,
                duration: 5,
                icon: '🍀'
            },
            {
                id: 'symbol_lock',
                name: 'Symbol Lock',
                description: 'Lock 2 reels on next spin',
                cost: 15,
                duration: 1,
                icon: '🔒'
            }
        ]
    },

    // ===== BET MULTIPLIERS =====
    betting: {
        // Available bet multipliers and their unlock costs
        multipliers: {
            1: { cost: 0, unlocked: true },     // Always available
            2: { cost: 50, unlocked: false },
            5: { cost: 100, unlocked: false },
            10: { cost: 200, unlocked: false },
            25: { cost: 500, unlocked: false }
        }
    },

    // ===== PROGRESSION SYSTEM =====
    progression: {
        // Reel unlock costs
        reels: {
            1: { cost: 0, unlocked: true },      // First reel is always unlocked
            2: { cost: 200, unlocked: false },   // 1x3 → 3x3
            3: { cost: 500, unlocked: false },   // 3x3 → 5x3  
            4: { cost: 1000, unlocked: false },  // 5x3 → 7x3 
            5: { cost: 2000, unlocked: false }   // 7x3 → 9x3
        },

        // Feature unlock costs
        features: {
            autoSpin: { cost: 100, unlocked: false }
        },

        // Powerup unlock costs (must unlock before purchasing)
        powerupUnlocks: {
            double_money: { cost: 25, unlocked: false },
            lucky_sevens: { cost: 50, unlocked: false },
            symbol_lock: { cost: 75, unlocked: false }
        }
    },

    // ===== GAME MECHANICS =====
    gameplay: {
        visibleRows: 3,           // Number of visible symbol rows
        maxReels: 5,              // Maximum number of reels
        minimumWinLength: 3,      // Minimum symbols needed for a win
        
        // Animation timings (in milliseconds)
        winAnimationDuration: 1500,
        
        // Free spin system
        freeSpins: {
            cooldownHours: 24     // Hours between free spins
        }
    }
};

// Export individual sections for convenience
export const spinConfig = gameConfig.spinning;
export const symbolConfig = gameConfig.symbols;
export const winConfig = gameConfig.winCalculation;
export const powerupConfig = gameConfig.powerups;
export const bettingConfig = gameConfig.betting;
export const progressionConfig = gameConfig.progression;
export const gameplayConfig = gameConfig.gameplay;