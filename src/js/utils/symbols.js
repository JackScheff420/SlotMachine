/**
 * Symbol definitions and configurations for the slot machine
 */

// Symbole für die Slot Machine mit Gewichtungen
export const symbols = [
    {name: '7', class: 'symbol-7', display: '7', weight: 1},            // Am seltensten
    {name: 'bell', class: 'symbol-bell', display: '🔔', weight: 3},     // Sehr selten
    {name: 'cherry', class: 'symbol-cherry', display: '🍒', weight: 5}, // Selten
    {name: 'lemon', class: 'symbol-lemon', display: '🍋', weight: 8},   // Etwas selten
    {name: 'orange', class: 'symbol-orange', display: '🍊', weight: 12}, // Mittel
    {name: 'plum', class: 'symbol-plum', display: '🍇', weight: 18},     // Häufig
    {name: 'watermelon', class: 'symbol-watermelon', display: '🍉', weight: 25} // Am häufigsten
];

// Gewinnkombinationen und Auszahlungen
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
    switch (symbolName) {
        case 'watermelon':
            return 2;  // Am niedrigsten
        case 'plum':
            return 3;
        case 'orange':
            return 4;
        case 'lemon':
            return 5;
        case 'cherry':
            return 6;
        case 'bell':
            return 8;
        case '7':
            return 10;          // Am höchsten
        default:
            return 1;
    }
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