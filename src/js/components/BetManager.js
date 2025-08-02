/**
 * Manages betting and multiplier system
 */

export class BetManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.baseCost = 1; // Basis-Kosten für einen Spin in Coins
        this.betMultiplier = 1; // Default bet multiplier
    }

    // Get current spin cost based on bet multiplier
    getCurrentSpinCost() {
        return this.baseCost * this.betMultiplier;
    }

    // Bet multiplier functions
    setBetMultiplier(multiplier) {
        // Check if this multiplier is unlocked
        if (this.gameState.progressionManager && !this.gameState.progressionManager.isBetMultiplierUnlocked(multiplier)) {
            this.gameState.showMessage(`${multiplier}x Einsatz ist noch nicht freigeschaltet!`);
            return;
        }

        this.betMultiplier = multiplier;
        this.gameState.updateSpinButtonState();
        this.gameState.updateAutoSpinButtonState();
        this.updateBetDisplay();
    }

    updateBetDisplay() {
        const spinCostElement = document.querySelector('.spin-cost');
        if (spinCostElement) {
            const currentCost = this.getCurrentSpinCost();
            if (this.betMultiplier === 1) {
                spinCostElement.textContent = `${currentCost} Coin pro Spin`;
            } else {
                spinCostElement.textContent = `${currentCost} Coins pro Spin (${this.betMultiplier}x)`;
            }
        }
        
        // Update bet multiplier buttons (only if not controlled by progression manager)
        document.querySelectorAll('.bet-multiplier-btn').forEach(btn => {
            const multiplier = parseInt(btn.dataset.multiplier);
            
            // Skip if this button is locked by progression system
            if (btn.classList.contains('locked')) {
                return;
            }
            
            btn.classList.toggle('active', multiplier === this.betMultiplier);
            btn.disabled = this.gameState.coins < (this.baseCost * multiplier) && !this.gameState.hasFreeSpin;
        });
    }

    // Initialize bet multiplier buttons
    initializeBetButtons() {
        document.querySelectorAll('.bet-multiplier-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const multiplier = parseInt(btn.dataset.multiplier);
                this.setBetMultiplier(multiplier);
            });
        });
    }
}