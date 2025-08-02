/**
 * Win calculation logic for the slot machine
 */

import { getSymbolValue } from './symbols.js';
import { addHighlight, removeHighlights } from './animations.js';

export class WinCalculator {
    constructor(gameState) {
        this.gameState = gameState;
        this.visibleRows = 3; // Anzahl der sichtbaren Reihen
    }

    // Gewinnkombinationen prüfen
    checkWinningCombinations(currentReelSymbols) {
        return new Promise((resolve) => {
            // Get max unlocked reels from progression manager
            const maxUnlockedReels = this.gameState.progressionManager 
                ? this.gameState.progressionManager.getMaxUnlockedReels() 
                : 5; // Fallback to all reels if progression manager not available

            // Only consider symbols from unlocked reels
            const unlockedReelSymbols = currentReelSymbols.slice(0, maxUnlockedReels);

            // Alle Walzensymbole erfassen (nur für freigeschaltete Walzen und alle sichtbaren Reihen)
            const allRowsSymbols = [];

            // Für jede sichtbare Reihe
            for (let row = 0; row < this.visibleRows; row++) {
                // Symbole dieser Reihe nur aus freigeschalteten Walzen sammeln
                const rowSymbols = unlockedReelSymbols.map(reelSymbols => reelSymbols[row]);
                allRowsSymbols.push(rowSymbols);
            }

            // Liste aller Gewinnkombinationen für sequentielle Animation
            const winningSequences = [];
            let totalWinAmount = 0;

            // 1. Horizontale Muster prüfen
            totalWinAmount += this.checkHorizontalPatterns(allRowsSymbols, winningSequences);

            // 2. Vertikale Muster prüfen (nur für freigeschaltete Walzen)
            totalWinAmount += this.checkVerticalPatterns(allRowsSymbols, winningSequences, maxUnlockedReels);

            // 3. Diagonale Muster prüfen (nur für freigeschaltete Walzen)
            totalWinAmount += this.checkDiagonalPatterns(allRowsSymbols, winningSequences, maxUnlockedReels);

            // Wenn es Gewinnkombinationen gibt
            if (winningSequences.length > 0) {
                // Apply double money powerup if active
                if (this.gameState.powerupManager.isPowerupActive('double_money')) {
                    totalWinAmount *= 2;
                }
                
                // Coins hinzufügen
                this.gameState.coins += totalWinAmount;
                this.gameState.saveCoins();
                this.gameState.updateCoinDisplay(true);

                // Sequentiell alle Gewinnkombinationen animieren
                this.animateWinningSequences(winningSequences, 0, totalWinAmount, resolve);
            } else {
                // No wins, resolve immediately
                resolve();
            }
        });
    }

    checkHorizontalPatterns(allRowsSymbols, winningSequences) {
        let totalWinAmount = 0;

        for (let rowIndex = 0; rowIndex < allRowsSymbols.length; rowIndex++) {
            const rowSymbols = allRowsSymbols[rowIndex];

            // Identische Symbole in Folge finden
            let currentSymbol = null;
            let sequenceLength = 0;
            let sequenceStartIndex = 0;

            // Durch die Symbole in der Reihe iterieren
            for (let i = 0; i <= rowSymbols.length; i++) {
                // Am Ende oder wenn ein neues Symbol beginnt
                if (i === rowSymbols.length || (rowSymbols[i].name !== currentSymbol && currentSymbol !== null)) {
                    // Wenn wir eine Sequenz von mindestens 3 identischen Symbolen haben
                    if (sequenceLength >= 3) {
                        // Multiplikator basierend auf Anzahl der Symbole festlegen
                        const countMultiplier = sequenceLength - 2; // 3 Symbole = 1x, 4 Symbole = 2x, 5 Symbole = 3x

                        // Basiswert des Symbols bestimmen
                        const symbolValue = getSymbolValue(currentSymbol);

                        // Gewinn berechnen (inkl. Bet Multiplier)
                        const winAmount = this.gameState.betManager.getCurrentSpinCost() * symbolValue * countMultiplier;
                        totalWinAmount += winAmount;

                        // Gewinnsequenz für Animation speichern
                        winningSequences.push({
                            type: 'horizontal',
                            row: rowIndex,
                            startIndex: sequenceStartIndex,
                            length: sequenceLength,
                            symbol: currentSymbol,
                            winAmount: winAmount
                        });
                    }

                    // Neue Sequenz starten
                    currentSymbol = i < rowSymbols.length ? rowSymbols[i].name : null;
                    sequenceLength = 1;
                    sequenceStartIndex = i;
                } else if (rowSymbols[i].name === currentSymbol) {
                    // Sequenz verlängern
                    sequenceLength++;
                } else {
                    // Neue Sequenz starten
                    currentSymbol = rowSymbols[i].name;
                    sequenceLength = 1;
                    sequenceStartIndex = i;
                }
            }
        }

        return totalWinAmount;
    }

    checkVerticalPatterns(allRowsSymbols, winningSequences, maxUnlockedReels) {
        let totalWinAmount = 0;
        const reels = document.querySelectorAll('.reel');

        // Vertikale Muster prüfen (drei in einer Spalte) - nur für freigeschaltete Walzen
        for (let colIndex = 0; colIndex < Math.min(reels.length, maxUnlockedReels); colIndex++) {
            const columnSymbols = [];
            for (let row = 0; row < this.visibleRows; row++) {
                columnSymbols.push(allRowsSymbols[row][colIndex]);
            }

            // Prüfen ob alle 3 Symbole in der Spalte identisch sind
            if (columnSymbols.length >= 3 && 
                columnSymbols[0].name === columnSymbols[1].name && 
                columnSymbols[1].name === columnSymbols[2].name) {
                
                const symbolValue = getSymbolValue(columnSymbols[0].name);
                const winAmount = this.gameState.betManager.getCurrentSpinCost() * symbolValue * 1; // Basis-Multiplikator für 3er-Spalte
                totalWinAmount += winAmount;

                winningSequences.push({
                    type: 'vertical',
                    column: colIndex,
                    symbol: columnSymbols[0].name,
                    winAmount: winAmount
                });
            }
        }

        return totalWinAmount;
    }

    checkDiagonalPatterns(allRowsSymbols, winningSequences, maxUnlockedReels) {
        let totalWinAmount = 0;
        const reels = document.querySelectorAll('.reel');

        // Diagonale Muster prüfen (X Formation) - nur wenn mindestens 3 Walzen freigeschaltet sind
        if (this.visibleRows >= 3 && maxUnlockedReels >= 3) {
            // Haupt-Diagonale (links-oben nach rechts-unten)
            const mainDiagonal = [
                allRowsSymbols[0][0], // Oben links
                allRowsSymbols[1][1], // Mitte
                allRowsSymbols[2][2]  // Unten rechts
            ];

            if (mainDiagonal[0].name === mainDiagonal[1].name && 
                mainDiagonal[1].name === mainDiagonal[2].name) {
                
                const symbolValue = getSymbolValue(mainDiagonal[0].name);
                const winAmount = this.gameState.betManager.getCurrentSpinCost() * symbolValue * 1.5; // Bonus für Diagonal
                totalWinAmount += winAmount;

                winningSequences.push({
                    type: 'diagonal_main',
                    symbol: mainDiagonal[0].name,
                    winAmount: winAmount
                });
            }

            // Anti-Diagonale (rechts-oben nach links-unten)
            const antiDiagonal = [
                allRowsSymbols[0][2], // Oben rechts
                allRowsSymbols[1][1], // Mitte
                allRowsSymbols[2][0]  // Unten links
            ];

            if (antiDiagonal[0].name === antiDiagonal[1].name && 
                antiDiagonal[1].name === antiDiagonal[2].name) {
                
                const symbolValue = getSymbolValue(antiDiagonal[0].name);
                const winAmount = this.gameState.betManager.getCurrentSpinCost() * symbolValue * 1.5; // Bonus für Diagonal
                totalWinAmount += winAmount;

                winningSequences.push({
                    type: 'diagonal_anti',
                    symbol: antiDiagonal[0].name,
                    winAmount: winAmount
                });
            }

            // Erweiterte X-Formation (beide Diagonalen gleichzeitig)
            if (mainDiagonal[0].name === mainDiagonal[1].name && 
                mainDiagonal[1].name === mainDiagonal[2].name &&
                antiDiagonal[0].name === antiDiagonal[1].name && 
                antiDiagonal[1].name === antiDiagonal[2].name &&
                mainDiagonal[0].name === antiDiagonal[0].name) {
                
                // Entferne die einzelnen Diagonal-Gewinne, da wir eine vollständige X-Formation haben
                const mainDiagIndex = winningSequences.findIndex(seq => seq.type === 'diagonal_main');
                const antiDiagIndex = winningSequences.findIndex(seq => seq.type === 'diagonal_anti');
                
                if (mainDiagIndex !== -1) {
                    totalWinAmount -= winningSequences[mainDiagIndex].winAmount;
                    winningSequences.splice(mainDiagIndex, 1);
                }
                if (antiDiagIndex !== -1) {
                    const adjustedIndex = mainDiagIndex < antiDiagIndex ? antiDiagIndex - 1 : antiDiagIndex;
                    totalWinAmount -= winningSequences[adjustedIndex].winAmount;
                    winningSequences.splice(adjustedIndex, 1);
                }

                // X-Formation Bonus
                const symbolValue = getSymbolValue(mainDiagonal[0].name);
                const winAmount = this.gameState.betManager.getCurrentSpinCost() * symbolValue * 3; // Großer Bonus für X-Formation
                totalWinAmount += winAmount;

                winningSequences.push({
                    type: 'x_formation',
                    symbol: mainDiagonal[0].name,
                    winAmount: winAmount
                });
            }
        }

        return totalWinAmount;
    }

    // Gewinnkombinationen nacheinander animieren
    animateWinningSequences(sequences, currentIndex, totalWinAmount, resolve) {
        // Alle Animationen abgeschlossen
        if (currentIndex >= sequences.length) {
            // Nachricht mit Gesamtgewinn anzeigen (ohne alert)
            this.gameState.showWinMessage(`Glückwunsch! Du hast ${totalWinAmount} Coins gewonnen!`);

            // Resolve immediately when win message appears (button should be unlocked now)
            if (resolve) resolve(); // Call the promise resolve callback
            return;
        }

        const sequence = sequences[currentIndex];

        // Symbole in dieser Gewinnreihe markieren basierend auf Typ
        this.highlightWinningSymbols(sequence);

        // Nach einer Verzögerung die Markierung entfernen und zur nächsten Kombination gehen
        setTimeout(() => {
            removeHighlights();
            this.animateWinningSequences(sequences, currentIndex + 1, totalWinAmount, resolve);
        }, 1500); // 1,5 Sekunden pro Kombination anzeigen
    }

    // Gewinnkombination hervorheben basierend auf Typ
    highlightWinningSymbols(sequence) {
        const reels = document.querySelectorAll('.reel');

        switch (sequence.type) {
            case 'horizontal':
                // Horizontale Linie hervorheben
                for (let i = sequence.startIndex; i < sequence.startIndex + sequence.length; i++) {
                    if (i < reels.length) {
                        const reel = reels[i];
                        const symbolElement = reel.querySelector('.symbols-container').children[sequence.row];
                        addHighlight(symbolElement);
                    }
                }
                break;

            case 'vertical':
                // Vertikale Spalte hervorheben
                const reel = reels[sequence.column];
                for (let row = 0; row < this.visibleRows; row++) {
                    const symbolElement = reel.querySelector('.symbols-container').children[row];
                    addHighlight(symbolElement);
                }
                break;

            case 'diagonal_main':
                // Haupt-Diagonale hervorheben (links-oben nach rechts-unten)
                const mainDiagonalPositions = [
                    {reel: 0, row: 0}, // Oben links
                    {reel: 1, row: 1}, // Mitte
                    {reel: 2, row: 2}  // Unten rechts
                ];
                mainDiagonalPositions.forEach(pos => {
                    if (pos.reel < reels.length) {
                        const reel = reels[pos.reel];
                        const symbolElement = reel.querySelector('.symbols-container').children[pos.row];
                        addHighlight(symbolElement);
                    }
                });
                break;

            case 'diagonal_anti':
                // Anti-Diagonale hervorheben (rechts-oben nach links-unten)
                const antiDiagonalPositions = [
                    {reel: 2, row: 0}, // Oben rechts
                    {reel: 1, row: 1}, // Mitte
                    {reel: 0, row: 2}  // Unten links
                ];
                antiDiagonalPositions.forEach(pos => {
                    if (pos.reel < reels.length) {
                        const reel = reels[pos.reel];
                        const symbolElement = reel.querySelector('.symbols-container').children[pos.row];
                        addHighlight(symbolElement);
                    }
                });
                break;

            case 'x_formation':
                // Beide Diagonalen hervorheben (X-Formation)
                const xFormationPositions = [
                    {reel: 0, row: 0}, // Oben links
                    {reel: 1, row: 1}, // Mitte
                    {reel: 2, row: 2}, // Unten rechts
                    {reel: 2, row: 0}, // Oben rechts
                    {reel: 0, row: 2}  // Unten links
                ];
                xFormationPositions.forEach(pos => {
                    if (pos.reel < reels.length) {
                        const reel = reels[pos.reel];
                        const symbolElement = reel.querySelector('.symbols-container').children[pos.row];
                        addHighlight(symbolElement, 'x-formation');
                    }
                });
                break;
        }
    }
}