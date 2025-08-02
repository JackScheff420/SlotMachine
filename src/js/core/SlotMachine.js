/**
 * Main SlotMachine class that orchestrates all components
 */

import { GameState } from './GameState.js';
import { BetManager } from '../components/BetManager.js';
import { PowerupManager } from '../components/Powerups.js';
import { Reels } from '../components/Reels.js';
import { WinCalculator } from '../utils/winCalculator.js';
import { addRequiredStyles } from '../utils/animations.js';

export class SlotMachine {
    constructor() {
        this.gameState = new GameState();
        this.betManager = new BetManager(this.gameState);
        this.powerupManager = new PowerupManager(this.gameState);
        this.reels = new Reels(this.gameState);
        this.winCalculator = new WinCalculator(this.gameState);

        // Set component references in game state
        this.gameState.setComponents(
            this.betManager,
            this.powerupManager,
            this.reels,
            this.winCalculator
        );

        this.initialize();
    }

    initialize() {
        // Add required styles
        addRequiredStyles();

        // Initialize components
        this.betManager.initializeBetButtons();
        this.powerupManager.updatePowerupDisplay();

        // Set up event listeners
        this.setupEventListeners();

        // Initial state updates
        this.gameState.updateSpinButtonState();
        this.gameState.updateCoinDisplay(false); // false = keine Error-Anzeige beim Start
        this.gameState.updateAutoSpinButtonState();
        this.betManager.updateBetDisplay(); // Initialize bet display

        // Make global functions available
        this.setupGlobalFunctions();
    }

    setupEventListeners() {
        // Spin button
        this.gameState.spinButton.addEventListener('click', () => {
            this.gameState.spin();
        });

        // Auto spin button
        this.gameState.autoSpinButton.addEventListener('click', () => {
            this.gameState.toggleAutoSpin();
        });
    }

    setupGlobalFunctions() {
        // Make purchasePowerup available globally for HTML onclick handlers
        window.purchasePowerup = (powerupId) => {
            return this.powerupManager.purchasePowerup(powerupId);
        };

        // Make setBetMultiplier available globally for HTML onclick handlers
        window.setBetMultiplier = (multiplier) => {
            this.betManager.setBetMultiplier(multiplier);
        };
    }
}