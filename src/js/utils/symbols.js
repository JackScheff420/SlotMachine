/**
 * Symbol definitions and configurations for the slot machine
 */

import { symbolConfig } from '../config/gameConfig.js';

// Symbole für die Slot Machine mit Gewichtungen
export const symbols = symbolConfig.definitions;

// Gewinnkombinationen und Auszahlungen (legacy - now calculated dynamically)
export const winningCombinations = [
    {symbols: ['7', '7', '7'], multiplier: 50},        // Jackpot
    {symbols: ['bell', 'bell', 'bell'], multiplier: 15},
    {symbols: ['cherry', 'cherry', 'cherry'], multiplier: 10},
    {symbols: ['lemon', 'lemon', 'lemon'], multiplier: 8},
    {symbols: ['orange', 'orange', 'orange'], multiplier: 6},
    {symbols: ['plum', 'plum', 'plum'], multiplier: 4},
    {symbols: ['watermelon', 'watermelon', 'watermelon'], multiplier: 3},
    // Gemischte Fruchtkombo
    {symbols: ['orange', 'lemon', 'watermelon'], multiplier: 2}
];

// Symbol-Werte festlegen (von niedrigsten zu höchsten)
export function getSymbolValue(symbolName) {
    return symbolConfig.values[symbolName] || 1;
}

// Funktion zum Auswählen eines zufälligen Symbols basierend auf Gewichtung
export function getRandomSymbol(symbolsToUse = symbols) {
    // Gesamtgewichtung berechnen
    const totalWeight = symbolsToUse.reduce((sum, symbol) => sum + symbol.weight, 0);

    // Zufallszahl zwischen 0 und der Gesamtgewichtung generieren
    let randomValue = Math.random() * totalWeight;

    // Symbol basierend auf Gewichtung auswählen
    for (const symbol of symbolsToUse) {
        randomValue -= symbol.weight;
        if (randomValue <= 0) {
            return symbol;
        }
    }

    // Fallback für unerwartete Fälle
    return symbolsToUse[symbolsToUse.length - 1];
}