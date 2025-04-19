document.addEventListener('DOMContentLoaded', () => {
    // Symbole für die Slot Machine mit Gewichtungen
    const symbols = [
        {name: '7', class: 'symbol-7', display: '7', weight: 1},            // Am seltensten
        {name: 'bell', class: 'symbol-bell', display: '🔔', weight: 3},     // Sehr selten
        {name: 'cherry', class: 'symbol-cherry', display: '🍒', weight: 5}, // Selten
        {name: 'lemon', class: 'symbol-lemon', display: '🍋', weight: 8},   // Etwas selten
        {name: 'orange', class: 'symbol-orange', display: '🍊', weight: 12}, // Mittel
        {name: 'plum', class: 'symbol-plum', display: '🍇', weight: 18},     // Häufig
        {name: 'watermelon', class: 'symbol-watermelon', display: '🍉', weight: 25} // Am häufigsten
    ];

    // Gewinnkombinationen und Auszahlungen
    const winningCombinations = [
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

    // DOM-Elemente
    const reels = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3'),
        document.getElementById('reel4'),
        document.getElementById('reel5')
    ];
    const spinButton = document.getElementById('spin-button');
    const coinCountElement = document.getElementById('coin-count');

    // Konstanten für die Animation
    const symbolHeight = 100; // Höhe eines Symbols in Pixel
    const visibleRows = 3; // Anzahl der sichtbaren Reihen
    const spinSymbols = 20; // Anzahl der Symbole für die Drehung
    const spinCost = 1; // Kosten für einen Spin in Coins

    // LocalStorage Keys
    const COINS_KEY = 'slotMachineCoins';
    const LAST_FREE_SPIN_KEY = 'slotMachineLastFreeSpin';

    // Timer-Element für den Free Spin erstellen
    let freeSpinTimerElement = document.getElementById('free-spin-timer');
    if (!freeSpinTimerElement) {
        freeSpinTimerElement = document.createElement('div');
        freeSpinTimerElement.id = 'free-spin-timer';
        freeSpinTimerElement.className = 'free-spin-timer';
        // Timer unter den Spin-Button einfügen
        spinButton.parentNode.insertBefore(freeSpinTimerElement, spinButton.nextSibling);

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

    // Coins und Free Spin Status initialisieren
    let coins = loadCoinsFromStorage();
    let hasFreeSpin = checkForFreeSpin();

    updateSpinButtonState();
    updateCoinDisplay(false); // false = keine Error-Anzeige beim Start

    // Aktuelle Symbole speichern für jede Walze
    let currentReelSymbols = [];

    // Lädt Coins aus dem localStorage oder setzt auf Standardwert
    function loadCoinsFromStorage() {
        const savedCoins = localStorage.getItem(COINS_KEY);
        return savedCoins !== null ? parseInt(savedCoins) : 10; // Standardwert: 10 Coins
    }

    // Speichert Coins im localStorage
    function saveCoinsToStorage() {
        localStorage.setItem(COINS_KEY, coins.toString());
    }

    // Prüft, ob heute ein kostenloser Spin verfügbar ist
    function checkForFreeSpin() {
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
    function markFreeSpinUsed() {
        localStorage.setItem(LAST_FREE_SPIN_KEY, Date.now().toString());
        hasFreeSpin = false;
    }

    // Aktualisiert den Status des Spin-Buttons basierend auf Free Spin und Coins
    function updateSpinButtonState() {
        // Free Spin verfügbar - Button entsprechend anzeigen
        if (hasFreeSpin) {
            spinButton.classList.add('free-spin');
            spinButton.classList.remove('error', 'disabled');
            spinButton.textContent = "FREE SPIN";
            spinButton.disabled = false;

            // Timer ausblenden
            freeSpinTimerElement.classList.add('hidden');
            freeSpinTimerElement.textContent = '';

            // Spin-Kosten-Text-Animation entfernen
            document.querySelector('.spin-cost') && document.querySelector('.spin-cost').classList.remove('error');
        }
        // Kein Free Spin, aber genug Coins
        else if (coins >= spinCost) {
            spinButton.classList.remove('free-spin', 'error', 'disabled');
            spinButton.textContent = "SPIN";
            spinButton.disabled = false;

            // Timer für nächsten Free Spin anzeigen
            updateFreeSpinTimer();

            // Spin-Kosten-Text-Animation entfernen
            document.querySelector('.spin-cost') && document.querySelector('.spin-cost').classList.remove('error');
        }
        // Weder Free Spin noch genug Coins
        else {
            spinButton.classList.remove('free-spin');
            spinButton.classList.add('error');
            spinButton.classList.remove('disabled');
            spinButton.textContent = "#ERROR#";
            spinButton.disabled = true;

            // Timer für nächsten Free Spin anzeigen
            updateFreeSpinTimer();

            // Spin-Kosten-Text ebenfalls blinken lassen
            document.querySelector('.spin-cost') && document.querySelector('.spin-cost').classList.add('error');
        }
    }

    // Aktualisiert den Free Spin Timer
    function updateFreeSpinTimer() {
        if (hasFreeSpin) {
            freeSpinTimerElement.classList.add('hidden');
            return;
        }

        freeSpinTimerElement.classList.remove('hidden');

        const nextResetTime = getNextResetTime();
        const now = Date.now();
        const timeRemaining = nextResetTime - now;

        if (timeRemaining <= 0) {
            // Wenn Zeit abgelaufen ist, prüfen ob Free Spin jetzt verfügbar
            hasFreeSpin = checkForFreeSpin();
            if (hasFreeSpin) {
                updateSpinButtonState();
                return;
            }
        }

        // Zeit bis zum nächsten Free Spin formatieren
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

        freeSpinTimerElement.textContent = `Nächster Free Spin in ${hours}h ${minutes}min`;
    }

    // Berechnet die Zeit bis zum nächsten Reset (Mitternacht)
    function getNextResetTime() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow.getTime();
    }

    // Funktion zum Auswählen eines zufälligen Symbols basierend auf Gewichtung
    function getRandomSymbol() {
        // Gesamtgewichtung berechnen
        const totalWeight = symbols.reduce((sum, symbol) => sum + symbol.weight, 0);

        // Zufallszahl zwischen 0 und der Gesamtgewichtung generieren
        let randomValue = Math.random() * totalWeight;

        // Symbol basierend auf Gewichtung auswählen
        for (const symbol of symbols) {
            randomValue -= symbol.weight;
            if (randomValue <= 0) {
                return symbol;
            }
        }

        // Fallback für unerwartete Fälle
        return symbols[symbols.length - 1];
    }

    // Walzen initialisieren
    function initializeReels() {
        // Für jede Walze die aktuellen Symbole initialisieren
        for (let i = 0; i < reels.length; i++) {
            // Drei zufällige Symbole für die Startanzeige auswählen
            const reelSymbols = [];
            for (let j = 0; j < visibleRows; j++) {
                reelSymbols.push(getRandomSymbol());
            }
            currentReelSymbols.push(reelSymbols);

            // Container für die Symbole erstellen
            const reel = reels[i];
            const symbolsContainer = document.createElement('div');
            symbolsContainer.className = 'symbols-container';
            reel.appendChild(symbolsContainer);

            // Die aktuellen Symbole anzeigen
            updateReelDisplay(i);
        }
    }

    // Aktualisiert die Anzeige einer einzelnen Walze
    function updateReelDisplay(reelIndex) {
        const reel = reels[reelIndex];
        const symbolsContainer = reel.querySelector('.symbols-container');

        // Container leeren
        symbolsContainer.innerHTML = '';

        // Die aktuellen Symbole anzeigen
        currentReelSymbols[reelIndex].forEach(symbol => {
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
    function spinReel(reelIndex, duration, delay) {
        return new Promise(resolve => {
            const reel = reels[reelIndex];
            const symbolsContainer = reel.querySelector('.symbols-container');

            // 1. Die vorhandenen Symbole beibehalten und nach oben kopieren
            const existingSymbols = [...currentReelSymbols[reelIndex]];

            // 2. Zufällige Symbole für den Spin generieren
            const spinningSymbols = [];
            for (let i = 0; i < spinSymbols; i++) {
                spinningSymbols.push(getRandomSymbol());
            }

            // 3. Neue Symbole für das Ende des Spins generieren
            const newSymbols = [];
            for (let i = 0; i < visibleRows; i++) {
                newSymbols.push(getRandomSymbol());
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
                    currentReelSymbols[reelIndex] = newSymbols;

                    // Display aktualisieren
                    updateReelDisplay(reelIndex);

                    // Animation abgeschlossen
                    resolve();
                }, duration);
            }, delay);
        });
    }

    // Alle Walzen drehen
    async function spin() {
        if (spinButton.disabled) return;

        const useFreeSpin = hasFreeSpin;

        // Prüfen, ob genügend Coins vorhanden sind oder Free Spin verfügbar
        if (!useFreeSpin && coins < spinCost) {
            showMessage("Nicht genug Coins! Bitte füge mehr Coins hinzu.");
            return;
        }

        // Coins abziehen oder Free Spin markieren
        if (!useFreeSpin) {
            coins -= spinCost;
        } else {
            markFreeSpinUsed();
        }

        // Coins im localStorage speichern
        saveCoinsToStorage();

        // Button deaktivieren während des Spins
        spinButton.classList.remove('free-spin', 'error');
        spinButton.classList.add('disabled');
        spinButton.disabled = true;

        // Nacheinander alle Walzen drehen
        const promises = reels.map((reel, index) => {
            const duration = 2000 + index * 400; // Jede nachfolgende Walze dreht länger
            const delay = index * 150; // Jede nachfolgende Walze startet später
            return spinReel(index, duration, delay);
        });

        // Warten bis alle Walzen angehalten haben
        await Promise.all(promises);

        // NACH dem Spin den Button-Status aktualisieren
        updateCoinDisplay(true);
        updateSpinButtonState();

        // Gewinnkombinationen prüfen
        checkWinningCombinations();
    }

    // Nachricht anzeigen
    function showMessage(message) {
        alert(message);
    }

    // Coin-Anzeige aktualisieren
    // showError bestimmt, ob der Error-Status angezeigt werden soll
    function updateCoinDisplay(showError) {
        coinCountElement.textContent = coins;

        // Wir aktualisieren nur den Coin-Count hier, den Button-Status regeln wir in updateSpinButtonState()
        if (hasFreeSpin) {
            // Keine Error-Anzeige wenn Free Spin verfügbar ist
            document.querySelector('.spin-cost') && document.querySelector('.spin-cost').classList.remove('error');
        } else if (coins < spinCost && showError) {
            // Error-Status für Spin-Kosten-Text wenn zu wenig Coins
            document.querySelector('.spin-cost') && document.querySelector('.spin-cost').classList.add('error');
        } else {
            // Keine Error-Anzeige
            document.querySelector('.spin-cost') && document.querySelector('.spin-cost').classList.remove('error');
        }

        // Auch den Button-Status aktualisieren
        updateSpinButtonState();
    }

    // Gewinnkombinationen prüfen
    function checkWinningCombinations() {
        // Alle Walzensymbole erfassen (für alle sichtbaren Reihen)
        const allRowsSymbols = [];

        // Für jede sichtbare Reihe
        for (let row = 0; row < visibleRows; row++) {
            // Symbole dieser Reihe aus allen Walzen sammeln
            const rowSymbols = currentReelSymbols.map(reelSymbols => reelSymbols[row]);
            allRowsSymbols.push(rowSymbols);
        }

        // Liste aller Gewinnkombinationen für sequentielle Animation
        const winningSequences = [];
        let totalWinAmount = 0;

        // Jede Reihe auf Gewinnkombinationen prüfen
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

                        // Gewinn berechnen
                        const winAmount = spinCost * symbolValue * countMultiplier;
                        totalWinAmount += winAmount;

                        // Gewinnsequenz für Animation speichern
                        winningSequences.push({
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

        // Wenn es Gewinnkombinationen gibt
        if (winningSequences.length > 0) {
            // Coins hinzufügen
            coins += totalWinAmount;
            // Im LocalStorage speichern
            saveCoinsToStorage();
            updateCoinDisplay(true);

            // Sequentiell alle Gewinnkombinationen animieren
            animateWinningSequences(winningSequences, 0, totalWinAmount);
        } else {
            // Sofort nach dem Spin den Button wieder aktivieren, wenn es keine Gewinne gibt
            updateSpinButtonState();
        }
    }

    // Symbol-Werte festlegen (von niedrigsten zu höchsten)
    function getSymbolValue(symbolName) {
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

    // Gewinnkombinationen nacheinander animieren
    function animateWinningSequences(sequences, currentIndex, totalWinAmount) {
        // Alle Animationen abgeschlossen
        if (currentIndex >= sequences.length) {
            // Nachricht mit Gesamtgewinn anzeigen (ohne alert)
            showWinMessage(`Glückwunsch! Du hast ${totalWinAmount} Coins gewonnen!`);

            // Button wieder aktivieren nach kurzer Verzögerung
            setTimeout(() => {
                updateSpinButtonState();
            }, 2000); // 2 Sekunden warten, bis die letzte Meldung ausgeblendet ist
            return;
        }

        const sequence = sequences[currentIndex];

        // Symbole in dieser Gewinnreihe markieren
        highlightWinningSymbols(sequence.row, sequence.startIndex, sequence.length);

        // Nach einer Verzögerung die Markierung entfernen und zur nächsten Kombination gehen
        setTimeout(() => {
            removeHighlights();
            animateWinningSequences(sequences, currentIndex + 1, totalWinAmount);
        }, 1500); // 1,5 Sekunden pro Kombination anzeigen
    }

    // Gewinnkombination hervorheben
    function highlightWinningSymbols(row, startIndex, length) {
        for (let i = startIndex; i < startIndex + length; i++) {
            if (i < reels.length) { // Sicherstellen, dass der Index im gültigen Bereich liegt
                const reel = reels[i];
                const symbolElement = reel.querySelector('.symbols-container').children[row];

                // Highlight-Element erstellen
                const highlight = document.createElement('div');
                highlight.className = 'symbol-highlight';

                // Highlight dem Symbol hinzufügen
                symbolElement.style.position = 'relative';
                symbolElement.appendChild(highlight);
            }
        }
    }

    // Alle Hervorhebungen entfernen
    function removeHighlights() {
        document.querySelectorAll('.symbol-highlight').forEach(el => el.remove());
    }

    // Win-Nachricht anzeigen ohne den Spielfluss zu unterbrechen
    function showWinMessage(message) {
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

    // Sicherstellen, dass die benötigten CSS-Stile vorhanden sind
    function addRequiredStyles() {
        if (!document.getElementById('slot-machine-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'slot-machine-styles';
            styleElement.textContent = `
            /* Animation für die Gewinnmeldung */
            .win-message {
                position: fixed;
                top: -100px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: gold;
                padding: 15px 25px;
                border-radius: 10px;
                font-weight: bold;
                text-align: center;
                z-index: 100;
                min-width: 300px;
                transition: top 0.5s ease-out;
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.7);
            }
            
            .win-message.show {
                top: 20px;
            }
            
            /* Symbol-Highlight Animationen */
            .symbol-highlight {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: 4px solid gold;
                border-radius: 8px;
                box-shadow: 0 0 10px gold;
                animation: pulse 0.5s infinite alternate;
                pointer-events: none;
                z-index: 10;
            }
            
            @keyframes pulse {
                0% { opacity: 0.4; transform: scale(0.95); }
                100% { opacity: 1; transform: scale(1.05); }
            }
        `;
            document.head.appendChild(styleElement);
        }
    }

    // Aktualisiert den Free Spin Timer alle 60 Sekunden
    function startTimerUpdater() {
        // Sofort aktualisieren und dann alle 60 Sekunden
        updateFreeSpinTimer();
        setInterval(() => {
            // Prüfen, ob ein neuer Tag begonnen hat
            const newHasFreeSpin = checkForFreeSpin();
            if (newHasFreeSpin !== hasFreeSpin) {
                hasFreeSpin = newHasFreeSpin;
                updateSpinButtonState();
            } else {
                // Nur den Countdown aktualisieren
                if (!hasFreeSpin) {
                    updateFreeSpinTimer();
                }
            }
        }, 60000); // Jede Minute aktualisieren
    }

    // Event-Listener hinzufügen
    spinButton.addEventListener('click', spin);

    // Initialisierung
    addRequiredStyles();
    initializeReels();
    startTimerUpdater();
});