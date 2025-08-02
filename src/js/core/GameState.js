/**
 * Main game state management for the slot machine
 */

import { StorageManager } from './StorageManager.js';

export class GameState {
    constructor() {
        this.coins = StorageManager.loadCoins();
        this.hasFreeSpin = StorageManager.checkForFreeSpin();
        
        // DOM elements
        this.spinButton = document.getElementById('spin-button');
        this.autoSpinButton = document.getElementById('auto-spin-button');
        this.coinCountElement = document.getElementById('coin-count');
        
        // Auto Spin state management
        this.isAutoSpinActive = false;
        this.autoSpinTimeoutId = null;
        
        this.initializeFreeSpinTimer();
        this.startTimerUpdater();
    }

    // Initialize free spin timer
    initializeFreeSpinTimer() {
        // Timer-Element für den Free Spin erstellen
        let freeSpinTimerElement = document.getElementById('free-spin-timer');
        if (!freeSpinTimerElement) {
            freeSpinTimerElement = document.createElement('div');
            freeSpinTimerElement.id = 'free-spin-timer';
            freeSpinTimerElement.className = 'free-spin-timer';
            // Timer unter den Spin-Button einfügen
            this.spinButton.parentNode.insertBefore(freeSpinTimerElement, this.spinButton.nextSibling);

            // Stil für den Free Spin Timer
            const style = document.createElement('style');
            style.textContent = `
                .free-spin-timer {
                    font-size: 12px;
                    color: #777;
                    text-align: center;
                    margin-top: 5px;
                    height: 18px;
                    overflow: hidden;
                    transition: opacity 0.3s;
                }
                
                .free-spin-timer.hidden {
                    opacity: 0;
                    height: 0;
                    margin-top: 0;
                }
                
                /* Stil für den Free Spin Button */
                #spin-button.free-spin {
                    background-color: #4CAF50;
                    color: white;
                    transition: background-color 0.3s, color 0.3s;
                    animation: pulse-green 2s infinite;
                }
                
                @keyframes pulse-green {
                    0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
                }
            `;
            document.head.appendChild(style);
        }
        this.freeSpinTimerElement = freeSpinTimerElement;
    }

    saveCoins() {
        StorageManager.saveCoins(this.coins);
    }

    // Auto Spin Management Functions
    toggleAutoSpin() {
        if (this.isAutoSpinActive) {
            this.stopAutoSpin();
        } else {
            this.startAutoSpin();
        }
    }

    startAutoSpin() {
        // Check if auto-spin is unlocked
        if (this.progressionManager && !this.progressionManager.isFeatureUnlocked('autoSpin')) {
            this.showMessage("Auto-Spin ist noch nicht freigeschaltet!");
            return;
        }

        // Check if we can start auto spin
        const currentSpinCost = this.betManager.getCurrentSpinCost();
        if (this.coins < currentSpinCost && !this.hasFreeSpin) {
            this.showMessage("Nicht genug Coins für Auto Spin!");
            return;
        }

        this.isAutoSpinActive = true;
        this.updateAutoSpinButtonState();
        this.showMessage("Auto Spin aktiviert!");
        
        // Start the first spin immediately
        this.triggerAutoSpin();
    }

    stopAutoSpin() {
        this.isAutoSpinActive = false;
        
        // Clear any pending auto spin timeout
        if (this.autoSpinTimeoutId) {
            clearTimeout(this.autoSpinTimeoutId);
            this.autoSpinTimeoutId = null;
        }
        
        this.updateAutoSpinButtonState();
        this.showMessage("Auto Spin gestoppt!");
    }

    triggerAutoSpin() {
        if (!this.isAutoSpinActive) return;
        
        // Check if we still have coins or free spin
        const currentSpinCost = this.betManager.getCurrentSpinCost();
        if (this.coins < currentSpinCost && !this.hasFreeSpin) {
            this.stopAutoSpin();
            this.showMessage("Auto Spin gestoppt - nicht genug Coins!");
            return;
        }
        
        // Trigger a spin
        this.spin().then(() => {
            // Schedule next auto spin if still active
            if (this.isAutoSpinActive) {
                this.autoSpinTimeoutId = setTimeout(() => {
                    this.triggerAutoSpin();
                }, 500); // Reduced delay for more responsive auto spin
            }
        }).catch((error) => {
            console.error("Auto spin error:", error);
            this.stopAutoSpin();
        });
    }

    updateAutoSpinButtonState() {
        // Check if auto-spin is locked by progression system
        if (this.progressionManager && !this.progressionManager.isFeatureUnlocked('autoSpin')) {
            // Let progression manager handle the locked state
            return;
        }

        if (this.isAutoSpinActive) {
            this.autoSpinButton.classList.add('active');
            this.autoSpinButton.classList.remove('disabled');
            this.autoSpinButton.textContent = 'STOP AUTO';
            this.autoSpinButton.disabled = false;
        } else {
            this.autoSpinButton.classList.remove('active');
            
            // Disable auto spin if not enough coins and no free spin
            const currentSpinCost = this.betManager.getCurrentSpinCost();
            if (this.coins < currentSpinCost && !this.hasFreeSpin) {
                this.autoSpinButton.classList.add('disabled');
                this.autoSpinButton.disabled = true;
                this.autoSpinButton.textContent = 'AUTO SPIN';
            } else {
                this.autoSpinButton.classList.remove('disabled');
                this.autoSpinButton.disabled = false;
                this.autoSpinButton.textContent = 'AUTO SPIN';
            }
        }
    }

    // Aktualisiert den Status des Spin-Buttons basierend auf Free Spin und Coins
    updateSpinButtonState() {
        const currentSpinCost = this.betManager.getCurrentSpinCost();
        
        // Free Spin verfügbar - Button entsprechend anzeigen
        if (this.hasFreeSpin) {
            this.spinButton.classList.add('free-spin');
            this.spinButton.classList.remove('error', 'disabled');
            this.spinButton.textContent = "FREE SPIN";
            this.spinButton.disabled = false;

            // Timer ausblenden
            this.freeSpinTimerElement.classList.add('hidden');
            this.freeSpinTimerElement.textContent = '';

            // Spin-Kosten-Text-Animation entfernen
            document.querySelector('.spin-cost') && document.querySelector('.spin-cost').classList.remove('error');
        }
        // Kein Free Spin, aber genug Coins
        else if (this.coins >= currentSpinCost) {
            this.spinButton.classList.remove('free-spin', 'error', 'disabled');
            this.spinButton.textContent = "SPIN";
            this.spinButton.disabled = false;

            // Timer für nächsten Free Spin anzeigen
            this.updateFreeSpinTimer();

            // Spin-Kosten-Text-Animation entfernen
            document.querySelector('.spin-cost') && document.querySelector('.spin-cost').classList.remove('error');
        }
        // Weder Free Spin noch genug Coins
        else {
            this.spinButton.classList.remove('free-spin');
            this.spinButton.classList.add('error');
            this.spinButton.classList.remove('disabled');
            this.spinButton.textContent = "#ERROR#";
            this.spinButton.disabled = true;

            // Timer für nächsten Free Spin anzeigen
            this.updateFreeSpinTimer();

            // Spin-Kosten-Text ebenfalls blinken lassen
            document.querySelector('.spin-cost') && document.querySelector('.spin-cost').classList.add('error');
        }
    }

    // Aktualisiert den Free Spin Timer
    updateFreeSpinTimer() {
        if (this.hasFreeSpin) {
            this.freeSpinTimerElement.classList.add('hidden');
            return;
        }

        this.freeSpinTimerElement.classList.remove('hidden');

        const nextResetTime = StorageManager.getNextResetTime();
        const now = Date.now();
        const timeRemaining = nextResetTime - now;

        if (timeRemaining <= 0) {
            // Wenn Zeit abgelaufen ist, prüfen ob Free Spin jetzt verfügbar
            this.hasFreeSpin = StorageManager.checkForFreeSpin();
            if (this.hasFreeSpin) {
                this.updateSpinButtonState();
                return;
            }
        }

        // Zeit bis zum nächsten Free Spin formatieren
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

        this.freeSpinTimerElement.textContent = `Nächster Free Spin in ${hours}h ${minutes}min`;
    }

    // Aktualisiert den Free Spin Timer alle 60 Sekunden
    startTimerUpdater() {
        // Sofort aktualisieren und dann alle 60 Sekunden
        this.updateFreeSpinTimer();
        setInterval(() => {
            // Prüfen, ob ein neuer Tag begonnen hat
            const newHasFreeSpin = StorageManager.checkForFreeSpin();
            if (newHasFreeSpin !== this.hasFreeSpin) {
                this.hasFreeSpin = newHasFreeSpin;
                this.updateSpinButtonState();
                this.updateAutoSpinButtonState();
            } else {
                // Nur den Countdown aktualisieren
                if (!this.hasFreeSpin) {
                    this.updateFreeSpinTimer();
                }
            }
        }, 60000); // Jede Minute aktualisieren
    }

    // Coin-Anzeige aktualisieren
    updateCoinDisplay(showError) {
        const currentSpinCost = this.betManager.getCurrentSpinCost();
        this.coinCountElement.textContent = this.coins;

        // Add double money indicator if active
        if (this.powerupManager.isPowerupActive('double_money')) {
            this.coinCountElement.parentElement.classList.add('double-money-active');
        } else {
            this.coinCountElement.parentElement.classList.remove('double-money-active');
        }

        // Wir aktualisieren nur den Coin-Count hier, den Button-Status regeln wir in updateSpinButtonState()
        if (this.hasFreeSpin) {
            // Keine Error-Anzeige wenn Free Spin verfügbar ist
            document.querySelector('.spin-cost') && document.querySelector('.spin-cost').classList.remove('error');
        } else if (this.coins < currentSpinCost && showError) {
            // Error-Status für Spin-Kosten-Text wenn zu wenig Coins
            document.querySelector('.spin-cost') && document.querySelector('.spin-cost').classList.add('error');
        } else {
            // Keine Error-Anzeige
            document.querySelector('.spin-cost') && document.querySelector('.spin-cost').classList.remove('error');
        }

        // Auch den Button-Status aktualisieren
        this.updateSpinButtonState();
        this.updateAutoSpinButtonState();
        this.powerupManager.updatePowerupDisplay();
        this.betManager.updateBetDisplay(); // Update bet display when coins change
    }

    // Nachricht anzeigen
    showMessage(message) {
        // Prüfen ob bereits ein Message-Element existiert
        let messageElement = document.getElementById('general-message');

        // Falls nicht, erstellen wir ein neues
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'general-message';
            messageElement.className = 'win-message';
            document.querySelector('.container').prepend(messageElement);
        }

        // Nachricht setzen
        messageElement.textContent = message;

        // Animation für das Einblenden
        messageElement.classList.remove('show');
        void messageElement.offsetHeight; // Force reflow
        messageElement.classList.add('show');

        // Nach 3 Sekunden ausblenden
        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 3000);
    }

    // Win-Nachricht anzeigen ohne den Spielfluss zu unterbrechen
    showWinMessage(message) {
        // Prüfen ob bereits ein Win-Message-Element existiert
        let winMessageElement = document.getElementById('win-message');

        // Falls nicht, erstellen wir ein neues
        if (!winMessageElement) {
            winMessageElement = document.createElement('div');
            winMessageElement.id = 'win-message';
            winMessageElement.className = 'win-message';
            document.querySelector('.container').prepend(winMessageElement);
        }

        // Nachricht setzen
        winMessageElement.textContent = message;

        // Animation für das Einblenden
        winMessageElement.classList.remove('show');
        void winMessageElement.offsetHeight; // Force reflow
        winMessageElement.classList.add('show');

        // Nach 3 Sekunden ausblenden
        setTimeout(() => {
            winMessageElement.classList.remove('show');
        }, 3000);
    }

    // Main spin function - to be called by SlotMachine
    async spin() {
        if (this.spinButton.disabled) return Promise.resolve();

        const useFreeSpin = this.hasFreeSpin;
        const currentSpinCost = this.betManager.getCurrentSpinCost();

        // Prüfen, ob genügend Coins vorhanden sind oder Free Spin verfügbar
        if (!useFreeSpin && this.coins < currentSpinCost) {
            this.showMessage("Nicht genug Coins! Bitte füge mehr Coins hinzu.");
            // Stop auto spin if running
            if (this.isAutoSpinActive) {
                this.stopAutoSpin();
            }
            return Promise.resolve();
        }

        // Check for symbol lock powerup before spin
        if (this.powerupManager.isPowerupActive('symbol_lock') && this.reels.lockedReels.length === 0) {
            // Allow player to select reels to lock
            this.reels.showReelSelection();
            // Stop auto spin if running since we need manual interaction
            if (this.isAutoSpinActive) {
                this.stopAutoSpin();
                this.showMessage("Auto Spin gestoppt - Symbol Lock Auswahl erforderlich!");
            }
            return Promise.resolve(); // Wait for reel selection
        }

        // Coins abziehen oder Free Spin markieren
        if (!useFreeSpin) {
            this.coins -= currentSpinCost;
        } else {
            StorageManager.markFreeSpinUsed();
            this.hasFreeSpin = false;
        }

        // Coins im localStorage speichern
        this.saveCoins();

        // Button deaktivieren während des Spins
        this.spinButton.classList.remove('free-spin', 'error');
        this.spinButton.classList.add('disabled');
        this.spinButton.disabled = true;

        // Spin the reels
        await this.reels.spinAllReels();

        // Decrement powerup durations after spin
        this.powerupManager.decrementPowerups();

        // NACH dem Spin den Button-Status aktualisieren
        this.updateCoinDisplay(true);
        this.updateAutoSpinButtonState();

        // Gewinnkombinationen prüfen
        await this.winCalculator.checkWinningCombinations(this.reels.getCurrentSymbols());
        
        // Update progression display to maintain locked reel visual state
        if (this.progressionManager) {
            this.progressionManager.updateReelDisplay();
        }
        
        // Only reactivate buttons after all animations and win sequences are complete
        this.updateSpinButtonState();
        
        return Promise.resolve();
    }

    // Set references to other components
    setComponents(betManager, powerupManager, reels, winCalculator, progressionManager) {
        this.betManager = betManager;
        this.powerupManager = powerupManager;
        this.reels = reels;
        this.winCalculator = winCalculator;
        this.progressionManager = progressionManager;
    }
}