/**
 * Manages the slot machine reels and spinning animation
 */

import { getRandomSymbol, symbols } from '../utils/symbols.js';
import { getSymbolHeight } from '../utils/animations.js';

export class Reels {
    constructor(gameState) {
        this.gameState = gameState;
        this.reels = [
            document.getElementById('reel1'),
            document.getElementById('reel2'),
            document.getElementById('reel3'),
            document.getElementById('reel4'),
            document.getElementById('reel5')
        ];
        this.visibleRows = 3; // Anzahl der sichtbaren Reihen
        this.spinSymbols = 20; // Anzahl der Symbole für die Drehung
        this.currentReelSymbols = [];
        this.lockedReels = []; // For symbol lock powerup
        this.reelSelectionActive = false;
        
        this.initializeReels();
        this.setupReelClickHandlers();
    }

    // Walzen initialisieren
    initializeReels() {
        // Für jede Walze die aktuellen Symbole initialisieren
        for (let i = 0; i < this.reels.length; i++) {
            // Drei zufällige Symbole für die Startanzeige auswählen
            const reelSymbols = [];
            for (let j = 0; j < this.visibleRows; j++) {
                reelSymbols.push(getRandomSymbol());
            }
            this.currentReelSymbols.push(reelSymbols);

            // Container für die Symbole erstellen
            const reel = this.reels[i];
            const symbolsContainer = document.createElement('div');
            symbolsContainer.className = 'symbols-container';
            reel.appendChild(symbolsContainer);

            // Die aktuellen Symbole anzeigen
            this.updateReelDisplay(i);
        }
    }

    // Aktualisiert die Anzeige einer einzelnen Walze
    updateReelDisplay(reelIndex) {
        const reel = this.reels[reelIndex];
        const symbolsContainer = reel.querySelector('.symbols-container');

        // Container leeren
        symbolsContainer.innerHTML = '';

        // Die aktuellen Symbole anzeigen
        this.currentReelSymbols[reelIndex].forEach(symbol => {
            const symbolElement = document.createElement('div');
            symbolElement.className = `symbol ${symbol.class}`;
            symbolElement.textContent = symbol.display;
            symbolsContainer.appendChild(symbolElement);
        });

        // Position zurücksetzen
        symbolsContainer.style.transition = 'none';
        symbolsContainer.style.top = '0px';
    }

    // Eine einzelne Walze drehen
    spinReel(reelIndex, duration, delay) {
        return new Promise(resolve => {
            const reel = this.reels[reelIndex];
            const symbolsContainer = reel.querySelector('.symbols-container');

            // Check if this reel is locked
            if (this.lockedReels.includes(reelIndex)) {
                // Reel is locked, don't change its symbols
                setTimeout(() => {
                    resolve();
                }, duration + delay);
                return;
            }

            // 1. Die vorhandenen Symbole beibehalten und nach oben kopieren
            const existingSymbols = [...this.currentReelSymbols[reelIndex]];

            // 2. Zufällige Symbole für den Spin generieren
            const spinningSymbols = [];
            for (let i = 0; i < this.spinSymbols; i++) {
                let symbolsToUse = symbols;
                
                // Lucky 7s powerup: Increase weight of rare symbols
                if (this.gameState.powerupManager.isPowerupActive('lucky_sevens')) {
                    symbolsToUse = symbols.map(symbol => {
                        // Increase weight for rare symbols (7, bell, cherry)
                        if (['7', 'bell', 'cherry'].includes(symbol.name)) {
                            return { ...symbol, weight: symbol.weight * 3 };
                        }
                        return symbol;
                    });
                }
                
                spinningSymbols.push(getRandomSymbol(symbolsToUse));
            }

            // 3. Neue Symbole für das Ende des Spins generieren
            const newSymbols = [];
            for (let i = 0; i < this.visibleRows; i++) {
                let symbolsToUse = symbols;
                
                // Lucky 7s powerup: Increase weight of rare symbols
                if (this.gameState.powerupManager.isPowerupActive('lucky_sevens')) {
                    symbolsToUse = symbols.map(symbol => {
                        // Increase weight for rare symbols (7, bell, cherry)
                        if (['7', 'bell', 'cherry'].includes(symbol.name)) {
                            return { ...symbol, weight: symbol.weight * 3 };
                        }
                        return symbol;
                    });
                }
                
                newSymbols.push(getRandomSymbol(symbolsToUse));
            }

            // Container leeren
            symbolsContainer.innerHTML = '';

            // Neue Symbole am Anfang hinzufügen (werden nach dem Spin sichtbar sein)
            newSymbols.forEach(symbol => {
                const symbolElement = document.createElement('div');
                symbolElement.className = `symbol ${symbol.class}`;
                symbolElement.textContent = symbol.display;
                symbolsContainer.appendChild(symbolElement);
            });

            // Zufällige Symbole für den Spin hinzufügen
            spinningSymbols.forEach(symbol => {
                const symbolElement = document.createElement('div');
                symbolElement.className = `symbol ${symbol.class}`;
                symbolElement.textContent = symbol.display;
                symbolsContainer.appendChild(symbolElement);
            });

            // Aktuelle Symbole am Ende hinzufügen (werden am Anfang sichtbar sein)
            existingSymbols.forEach(symbol => {
                const symbolElement = document.createElement('div');
                symbolElement.className = `symbol ${symbol.class}`;
                symbolElement.textContent = symbol.display;
                symbolsContainer.appendChild(symbolElement);
            });

            // Berechnen der Positionen
            const symbolHeight = getSymbolHeight(); // Get current symbol height dynamically
            const totalHeight = symbolsContainer.childElementCount * symbolHeight;
            const startPosition = -(totalHeight - existingSymbols.length * symbolHeight);

            // Startposition einstellen (zeigt die aktuellen Symbole)
            symbolsContainer.style.transition = 'none';
            symbolsContainer.style.top = `${startPosition}px`;

            // Force reflow um die CSS-Änderung sofort anzuwenden
            void symbolsContainer.offsetHeight;

            // Animation nach Verzögerung starten
            setTimeout(() => {
                // Animation starten
                symbolsContainer.style.transition = `top ${duration}ms cubic-bezier(0.15, 0.85, 0.3, 1.0)`;
                symbolsContainer.style.top = '0px'; // Zum Anfang scrollen (neue Symbole werden sichtbar)

                // Nach Abschluss der Animation aufräumen
                setTimeout(() => {
                    // Neue Symbole als aktuelle Symbole speichern
                    this.currentReelSymbols[reelIndex] = newSymbols;

                    // Display aktualisieren
                    this.updateReelDisplay(reelIndex);

                    // Animation abgeschlossen
                    resolve();
                }, duration);
            }, delay);
        });
    }

    // Alle Walzen drehen
    async spinAllReels() {
        // Nacheinander alle Walzen drehen
        const promises = this.reels.map((reel, index) => {
            const duration = 2000 + index * 400; // Jede nachfolgende Walze dreht länger
            const delay = index * 150; // Jede nachfolgende Walze startet später
            return this.spinReel(index, duration, delay);
        });

        // Warten bis alle Walzen angehalten haben
        await Promise.all(promises);

        // Clear locked reels after spin
        this.lockedReels = [];
        this.removeReelLocks();
    }

    // Symbol Lock powerup functions
    showReelSelection() {
        this.gameState.showMessage("Symbol Lock aktiv! Klicke auf 2 Walzen um sie zu sperren.");
        this.reelSelectionActive = true;
        
        // Add click handlers to reels
        this.reels.forEach((reel, index) => {
            reel.classList.add('selectable');
        });
    }

    handleReelClick(event) {
        if (!this.reelSelectionActive) return;
        
        // Find which reel was clicked
        const clickedReel = event.currentTarget;
        const reelIndex = this.reels.indexOf(clickedReel);
        
        if (reelIndex === -1) return;
        
        this.selectReel(reelIndex);
    }

    selectReel(reelIndex) {
        const reel = this.reels[reelIndex];
        
        if (this.lockedReels.includes(reelIndex)) {
            // Deselect reel
            this.lockedReels = this.lockedReels.filter(r => r !== reelIndex);
            reel.classList.remove('locked');
        } else if (this.lockedReels.length < 2) {
            // Select reel
            this.lockedReels.push(reelIndex);
            reel.classList.add('locked');
        }

        // Check if we have 2 reels selected
        if (this.lockedReels.length === 2) {
            this.reelSelectionActive = false;
            
            // Remove selectable state from all reels
            this.reels.forEach(r => {
                r.classList.remove('selectable');
            });
            
            this.gameState.showMessage("Walzen gesperrt! Drehe jetzt!");
        }
    }

    removeReelLocks() {
        this.reels.forEach(reel => {
            reel.classList.remove('locked', 'selectable');
        });
    }

    setupReelClickHandlers() {
        // Add click listeners to reels for symbol lock
        this.reels.forEach(reel => {
            reel.addEventListener('click', (event) => this.handleReelClick(event));
        });
    }

    getCurrentSymbols() {
        return this.currentReelSymbols;
    }
}