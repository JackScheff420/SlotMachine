/**
 * Manages the powerup system for the slot machine
 */

import { StorageManager } from '../core/StorageManager.js';

// Powerup definitions
export const powerups = [
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
];

export class PowerupManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.activePowerups = StorageManager.loadPowerups();
    }

    // Powerup-Management-Funktionen
    isPowerupActive(powerupId) {
        return this.activePowerups[powerupId] && this.activePowerups[powerupId] > 0;
    }

    activatePowerup(powerupId, duration) {
        this.activePowerups[powerupId] = duration;
        StorageManager.savePowerups(this.activePowerups);
        this.updatePowerupDisplay();
    }

    decrementPowerups() {
        let updated = false;
        for (const powerupId in this.activePowerups) {
            if (this.activePowerups[powerupId] > 0) {
                this.activePowerups[powerupId]--;
                updated = true;
                if (this.activePowerups[powerupId] <= 0) {
                    delete this.activePowerups[powerupId];
                }
            }
        }
        if (updated) {
            StorageManager.savePowerups(this.activePowerups);
            this.updatePowerupDisplay();
        }
    }

    purchasePowerup(powerupId) {
        const powerup = powerups.find(p => p.id === powerupId);
        if (!powerup) return false;
        
        // Check if powerup is unlocked for purchase
        if (this.gameState.progressionManager && !this.gameState.progressionManager.isPowerupUnlocked(powerupId)) {
            this.gameState.showMessage(`${powerup.name} ist noch nicht freigeschaltet!`);
            return false;
        }
        
        if (this.gameState.coins < powerup.cost) {
            this.gameState.showMessage(`Nicht genug Coins! Du brauchst ${powerup.cost} Coins für ${powerup.name}.`);
            return false;
        }

        // Special handling for symbol lock
        if (powerupId === 'symbol_lock' && this.isPowerupActive('symbol_lock')) {
            this.gameState.showMessage("Symbol Lock ist bereits aktiv!");
            return false;
        }

        this.gameState.coins -= powerup.cost;
        StorageManager.saveCoins(this.gameState.coins);
        this.activatePowerup(powerupId, powerup.duration);
        this.gameState.updateCoinDisplay(true);
        this.gameState.showMessage(`${powerup.name} aktiviert!`);
        return true;
    }

    // Update powerup display
    updatePowerupDisplay() {
        const activeList = document.getElementById('active-powerups-list');
        if (!activeList) return;

        activeList.innerHTML = '';
        
        for (const powerupId in this.activePowerups) {
            const powerup = powerups.find(p => p.id === powerupId);
            const remainingUses = this.activePowerups[powerupId];
            
            if (powerup && remainingUses > 0) {
                const powerupElement = document.createElement('div');
                powerupElement.className = 'active-powerup';
                powerupElement.innerHTML = `
                    <span class="powerup-icon">${powerup.icon}</span>
                    <span class="powerup-name">${powerup.name}</span>
                    <span class="powerup-remaining">${remainingUses}</span>
                `;
                activeList.appendChild(powerupElement);
            }
        }

        // Update buy button states only for unlocked powerups
        powerups.forEach(powerup => {
            const buyBtn = document.querySelector(`[data-powerup="${powerup.id}"] .powerup-buy-btn`);
            if (buyBtn && !buyBtn.classList.contains('unlock-btn')) {
                // Only update if not in unlock mode (managed by ProgressionManager)
                const canAfford = this.gameState.coins >= powerup.cost;
                const isActive = this.isPowerupActive(powerup.id);
                const isUnlocked = !this.gameState.progressionManager || this.gameState.progressionManager.isPowerupUnlocked(powerup.id);
                
                if (isUnlocked) {
                    buyBtn.disabled = !canAfford || (isActive && powerup.id === 'symbol_lock');
                    buyBtn.textContent = isActive && powerup.id === 'symbol_lock' ? 'ACTIVE' : 'BUY';
                    buyBtn.className = `powerup-buy-btn ${!canAfford ? 'disabled' : ''} ${isActive && powerup.id === 'symbol_lock' ? 'active' : ''}`;
                }
            }
        });
    }
}