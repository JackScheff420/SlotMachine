/**
 * Manages the progressive unlock system for the slot machine
 */

import { StorageManager } from '../core/StorageManager.js';

export class ProgressionManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.unlocks = StorageManager.loadUnlocks();
        
        // Define unlock costs and requirements
        this.unlockConfig = {
            reels: {
                1: { cost: 0, unlocked: true }, // First reel is always unlocked
                2: { cost: 200, unlocked: false }, // 1x3 → 3x3
                3: { cost: 500, unlocked: false }, // 3x3 → 5x3  
                4: { cost: 1000, unlocked: false }, // 5x3 → 7x3 
                5: { cost: 2000, unlocked: false } // 7x3 → 9x3 (we have 5 reels max currently)
            },
            betMultipliers: {
                1: { cost: 0, unlocked: true }, // Always available
                2: { cost: 50, unlocked: false },
                5: { cost: 100, unlocked: false },
                10: { cost: 200, unlocked: false },
                25: { cost: 500, unlocked: false }
            },
            features: {
                autoSpin: { cost: 100, unlocked: false }
            },
            powerups: {
                double_money: { cost: 25, unlocked: false },
                lucky_sevens: { cost: 50, unlocked: false },
                symbol_lock: { cost: 75, unlocked: false }
            }
        };

        // Apply saved unlocks
        this.applyUnlocks();
    }

    // Apply unlocks from storage to config
    applyUnlocks() {
        if (this.unlocks.reels) {
            Object.keys(this.unlocks.reels).forEach(reelCount => {
                if (this.unlockConfig.reels[reelCount]) {
                    this.unlockConfig.reels[reelCount].unlocked = this.unlocks.reels[reelCount];
                }
            });
        }

        if (this.unlocks.betMultipliers) {
            Object.keys(this.unlocks.betMultipliers).forEach(multiplier => {
                if (this.unlockConfig.betMultipliers[multiplier]) {
                    this.unlockConfig.betMultipliers[multiplier].unlocked = this.unlocks.betMultipliers[multiplier];
                }
            });
        }

        if (this.unlocks.features) {
            Object.keys(this.unlocks.features).forEach(feature => {
                if (this.unlockConfig.features[feature]) {
                    this.unlockConfig.features[feature].unlocked = this.unlocks.features[feature];
                }
            });
        }

        if (this.unlocks.powerups) {
            Object.keys(this.unlocks.powerups).forEach(powerup => {
                if (this.unlockConfig.powerups[powerup]) {
                    this.unlockConfig.powerups[powerup].unlocked = this.unlocks.powerups[powerup];
                }
            });
        }
    }

    // Check if a specific reel count is unlocked
    isReelCountUnlocked(reelCount) {
        return this.unlockConfig.reels[reelCount]?.unlocked || false;
    }

    // Check if a bet multiplier is unlocked
    isBetMultiplierUnlocked(multiplier) {
        return this.unlockConfig.betMultipliers[multiplier]?.unlocked || false;
    }

    // Check if a feature is unlocked
    isFeatureUnlocked(feature) {
        return this.unlockConfig.features[feature]?.unlocked || false;
    }

    // Check if a powerup is unlocked for purchase
    isPowerupUnlocked(powerupId) {
        return this.unlockConfig.powerups[powerupId]?.unlocked || false;
    }

    // Get unlock cost for a feature
    getUnlockCost(type, item) {
        return this.unlockConfig[type]?.[item]?.cost || 0;
    }

    // Get current maximum unlocked reel count
    getMaxUnlockedReels() {
        let maxReels = 1; // Start with 1 reel minimum
        for (let reelCount = 2; reelCount <= 5; reelCount++) {
            if (this.isReelCountUnlocked(reelCount)) {
                maxReels = reelCount;
            }
        }
        return maxReels;
    }

    // Purchase an unlock
    purchaseUnlock(type, item) {
        const cost = this.getUnlockCost(type, item);
        
        if (this.gameState.coins < cost) {
            this.gameState.showMessage(`Nicht genug Coins! Benötigt: ${cost}`);
            return false;
        }

        if (this.unlockConfig[type]?.[item]?.unlocked) {
            this.gameState.showMessage('Bereits freigeschaltet!');
            return false;
        }

        // Deduct coins and unlock
        this.gameState.coins -= cost;
        this.gameState.saveCoins();
        
        // Update unlock status
        this.unlockConfig[type][item].unlocked = true;
        
        // Save to storage
        this.saveUnlocks();
        
        // Update UI
        this.updateAllUI();
        
        this.gameState.showMessage(`${this.getUnlockName(type, item)} freigeschaltet!`);
        return true;
    }

    // Get human-readable name for unlock
    getUnlockName(type, item) {
        switch (type) {
            case 'reels':
                return `${item} Walzen`;
            case 'betMultipliers':
                return `${item}x Einsatz`;
            case 'features':
                switch (item) {
                    case 'autoSpin': return 'Auto-Spin';
                    default: return item;
                }
            case 'powerups':
                switch (item) {
                    case 'double_money': return 'Double Money';
                    case 'lucky_sevens': return 'Lucky 7s';
                    case 'symbol_lock': return 'Symbol Lock';
                    default: return item;
                }
            default:
                return item;
        }
    }

    // Save unlocks to storage
    saveUnlocks() {
        const unlocksToSave = {
            reels: {},
            betMultipliers: {},
            features: {},
            powerups: {}
        };

        // Only save unlocked items
        Object.keys(this.unlockConfig.reels).forEach(reelCount => {
            if (this.unlockConfig.reels[reelCount].unlocked) {
                unlocksToSave.reels[reelCount] = true;
            }
        });

        Object.keys(this.unlockConfig.betMultipliers).forEach(multiplier => {
            if (this.unlockConfig.betMultipliers[multiplier].unlocked) {
                unlocksToSave.betMultipliers[multiplier] = true;
            }
        });

        Object.keys(this.unlockConfig.features).forEach(feature => {
            if (this.unlockConfig.features[feature].unlocked) {
                unlocksToSave.features[feature] = true;
            }
        });

        Object.keys(this.unlockConfig.powerups).forEach(powerup => {
            if (this.unlockConfig.powerups[powerup].unlocked) {
                unlocksToSave.powerups[powerup] = true;
            }
        });

        StorageManager.saveUnlocks(unlocksToSave);
    }

    // Update all UI elements
    updateAllUI() {
        this.updateReelDisplay();
        this.updateBetMultiplierDisplay();
        this.updateFeatureDisplay();
        this.updatePowerupDisplay();
        this.gameState.updateCoinDisplay();
    }

    // Update reel display (show/hide locked reels)
    updateReelDisplay() {
        const maxReels = this.getMaxUnlockedReels();
        const reelElements = document.querySelectorAll('.reel');
        
        reelElements.forEach((reel, index) => {
            const reelNumber = index + 1;
            if (reelNumber <= maxReels) {
                reel.classList.remove('locked');
            } else {
                reel.classList.add('locked');
            }
        });

        // Add unlock button for next reel if needed
        this.addReelUnlockButton();
    }

    // Add unlock button for next reel
    addReelUnlockButton() {
        const maxReels = this.getMaxUnlockedReels();
        const nextReelCount = maxReels + 1;
        
        // Remove existing unlock buttons
        document.querySelectorAll('.reel-unlock-btn').forEach(btn => btn.remove());
        
        if (nextReelCount <= 5 && !this.isReelCountUnlocked(nextReelCount)) {
            const cost = this.getUnlockCost('reels', nextReelCount);
            const reelToUnlock = document.querySelector(`.reel:nth-child(${nextReelCount})`);
            
            if (reelToUnlock) {
                const unlockBtn = document.createElement('button');
                unlockBtn.className = 'reel-unlock-btn';
                unlockBtn.innerHTML = `
                    <div class="unlock-icon">🔓</div>
                    <div class="unlock-cost">${cost} Coins</div>
                `;
                unlockBtn.onclick = () => this.purchaseUnlock('reels', nextReelCount);
                
                reelToUnlock.appendChild(unlockBtn);
            }
        }
    }

    // Update bet multiplier display
    updateBetMultiplierDisplay() {
        document.querySelectorAll('.bet-multiplier-btn').forEach(btn => {
            const multiplier = parseInt(btn.dataset.multiplier);
            const isUnlocked = this.isBetMultiplierUnlocked(multiplier);
            
            btn.classList.toggle('locked', !isUnlocked);
            
            if (!isUnlocked) {
                const cost = this.getUnlockCost('betMultipliers', multiplier);
                btn.innerHTML = `
                    <span class="bet-text">${multiplier}x</span>
                    <span class="unlock-cost">${cost}c</span>
                `;
                // Remove existing click handler and add unlock handler
                btn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.purchaseUnlock('betMultipliers', multiplier);
                };
            } else {
                btn.innerHTML = `${multiplier}x`;
                // Remove onclick and let the normal BetManager handle it
                btn.onclick = null;
                // Update active state
                btn.classList.toggle('active', multiplier === this.gameState.betManager.betMultiplier);
            }
        });
    }

    // Update feature display (auto-spin, etc.)
    updateFeatureDisplay() {
        this.updateAutoSpinDisplay();
    }

    // Update auto-spin button display
    updateAutoSpinDisplay() {
        const autoSpinBtn = document.getElementById('auto-spin-button');
        const isUnlocked = this.isFeatureUnlocked('autoSpin');
        
        autoSpinBtn.classList.toggle('locked', !isUnlocked);
        
        if (!isUnlocked) {
            const cost = this.getUnlockCost('features', 'autoSpin');
            autoSpinBtn.innerHTML = `
                <span class="feature-text">AUTO SPIN</span>
                <span class="unlock-cost">${cost} Coins</span>
            `;
            autoSpinBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.purchaseUnlock('features', 'autoSpin');
            };
        } else {
            autoSpinBtn.innerHTML = 'AUTO SPIN';
            // Remove our onclick handler to let GameState handle it
            autoSpinBtn.onclick = null;
        }
    }

    // Update powerup display (show/hide locked powerups)
    updatePowerupDisplay() {
        const powerupItems = document.querySelectorAll('.powerup-item');
        
        powerupItems.forEach(item => {
            const powerupId = item.dataset.powerup;
            const isUnlocked = this.isPowerupUnlocked(powerupId);
            const buyBtn = item.querySelector('.powerup-buy-btn');
            
            item.classList.toggle('locked', !isUnlocked);
            
            if (!isUnlocked) {
                const cost = this.getUnlockCost('powerups', powerupId);
                const powerupName = this.getUnlockName('powerups', powerupId);
                
                // Replace buy button with unlock button
                buyBtn.innerHTML = `UNLOCK ${cost}c`;
                buyBtn.classList.add('unlock-btn');
                buyBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.purchaseUnlock('powerups', powerupId);
                };
                buyBtn.disabled = this.gameState.coins < cost;
            } else {
                // Restore original purchase functionality
                buyBtn.innerHTML = 'BUY';
                buyBtn.classList.remove('unlock-btn');
                buyBtn.onclick = () => this.gameState.powerupManager.purchasePowerup(powerupId);
                // Let the powerup manager handle enabled/disabled state
            }
        });
    }
}