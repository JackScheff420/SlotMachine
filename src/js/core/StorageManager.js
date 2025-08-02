/**
 * Manages localStorage operations for the slot machine game
 */

// LocalStorage Keys
const COINS_KEY = 'slotMachineCoins';
const LAST_FREE_SPIN_KEY = 'slotMachineLastFreeSpin';
const POWERUPS_KEY = 'slotMachinePowerups';
const UNLOCKS_KEY = 'slotMachineUnlocks';

export class StorageManager {
    // Lädt Coins aus dem localStorage oder setzt auf Standardwert
    static loadCoins() {
        const savedCoins = localStorage.getItem(COINS_KEY);
        return savedCoins !== null ? parseInt(savedCoins) : 10; // Standardwert: 10 Coins
    }

    // Speichert Coins im localStorage
    static saveCoins(coins) {
        localStorage.setItem(COINS_KEY, coins.toString());
    }

    // Lädt Powerups aus dem localStorage
    static loadPowerups() {
        const savedPowerups = localStorage.getItem(POWERUPS_KEY);
        return savedPowerups ? JSON.parse(savedPowerups) : {};
    }

    // Speichert Powerups im localStorage
    static savePowerups(activePowerups) {
        localStorage.setItem(POWERUPS_KEY, JSON.stringify(activePowerups));
    }

    // Prüft ob ein Free Spin verfügbar ist
    static checkForFreeSpin() {
        const lastFreeSpin = localStorage.getItem(LAST_FREE_SPIN_KEY);

        if (!lastFreeSpin) {
            return true; // Noch nie einen Free Spin verwendet
        }

        const lastDate = new Date(parseInt(lastFreeSpin));
        const today = new Date();

        // Prüfen ob das letzte Datum vor dem heutigen Tag liegt
        return lastDate.getDate() !== today.getDate() ||
            lastDate.getMonth() !== today.getMonth() ||
            lastDate.getFullYear() !== today.getFullYear();
    }

    // Markiert den kostenlosen Spin als verwendet
    static markFreeSpinUsed() {
        localStorage.setItem(LAST_FREE_SPIN_KEY, Date.now().toString());
    }

    // Berechnet die Zeit bis zum nächsten Reset (Mitternacht)
    static getNextResetTime() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow.getTime();
    }

    // Lädt Unlock-Status aus dem localStorage
    static loadUnlocks() {
        const savedUnlocks = localStorage.getItem(UNLOCKS_KEY);
        return savedUnlocks ? JSON.parse(savedUnlocks) : {
            reels: { 1: true }, // Start with 1 reel unlocked
            betMultipliers: { 1: true }, // Start with 1x multiplier unlocked
            features: {} // No features unlocked initially
        };
    }

    // Speichert Unlock-Status im localStorage
    static saveUnlocks(unlocks) {
        localStorage.setItem(UNLOCKS_KEY, JSON.stringify(unlocks));
    }
}