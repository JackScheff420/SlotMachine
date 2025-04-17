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
    const addCoinsButton = document.getElementById('add-coins-button');

    // "Spin Cost" Element suchen oder erstellen
    let spinCostElement = document.querySelector('.spin-cost');
    if (!spinCostElement) {
        spinCostElement = document.createElement('div');
        spinCostElement.className = 'spin-cost';
        // Nach dem Spin-Button einfügen
        spinButton.parentNode.insertBefore(spinCostElement, spinButton.nextSibling);
    }

    // Konstanten für die Animation
    const symbolHeight = 100; // Höhe eines Symbols in Pixel
    const visibleRows = 3; // Anzahl der sichtbaren Reihen
    const spinSymbols = 20; // Anzahl der Symbole für die Drehung
    const spinCost = 1; // Kosten für einen Spin in Coins

    // Coins und Gratis-Spin-Status aus dem localStorage laden
    let coins = loadCoins();
    let lastFreeSpin = loadLastFreeSpin();
    let isFreeSpin = false; // Flag, um zu speichern, ob der nächste Spin ein Gratis-Spin ist

    updateCoinDisplay(false); // false = keine Error-Anzeige beim Start
    updateSpinButton(); // Status des Spin-Buttons aktualisieren

    // Aktuelle Symbole speichern für jede Walze
    let currentReelSymbols = [];

    // Funktion zum Laden der Coins aus dem localStorage
    function loadCoins() {
        const savedCoins = localStorage.getItem('slotMachineCoins');
        return savedCoins ? parseInt(savedCoins) : 1; // Standardwert 1, wenn nichts gespeichert ist
    }

    // Funktion zum Speichern der Coins im localStorage
    function saveCoins(amount) {
        localStorage.setItem('slotMachineCoins', amount.toString());
    }

    // Funktion zum Laden des letzten Gratis-Spin-Datums aus dem localStorage
    function loadLastFreeSpin() {
        return localStorage.getItem('slotMachineLastFreeSpin') || ''; // Leerer String, wenn nichts gespeichert ist
    }

    // Funktion zum Speichern des Gratis-Spin-Datums im localStorage
    function saveLastFreeSpin(date) {
        localStorage.setItem('slotMachineLastFreeSpin', date);
    }

    // Prüfen, ob heute ein Gratis-Spin verfügbar ist
    function isFreeSpinAvailableToday() {
        if (!lastFreeSpin) return true; // Noch nie einen Gratis-Spin benutzt

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        return today !== lastFreeSpin;
    }

    // Aktualisieren des Spin-Button-Status
    function updateSpinButton() {
        const freeSpinAvailable = isFreeSpinAvailableToday();

        // Zurücksetzen des Buttons
        spinButton.classList.remove('free-spin', 'disabled', 'error');

        if (freeSpinAvailable) {
            // Gratis-Spin ist verfügbar
            spinButton.textContent = "GRATIS SPIN";
            spinButton.classList.add('free-spin');
            spinButton.disabled = false;
            isFreeSpin = true;

            // Kostenanzeige ausblenden
            spinCostElement.style.display = 'none';
        } else {
            // Normaler Spin, Button je nach Coin-Stand aktivieren/deaktivieren
            isFreeSpin = false;
            spinButton.textContent = "SPIN";

            // Kostenanzeige einblenden
            spinCostElement.style.display = 'block';
            spinCostElement.textContent = `Kosten: ${spinCost} Coin${spinCost !== 1 ? 's' : ''}`;

            // Button-Status basierend auf verfügbaren Coins
            if (coins < spinCost) {
                spinButton.classList.add('disabled');
                spinButton.disabled = true;
            } else {
                spinButton.disabled = false;
            }
        }

        // Zeit bis zum nächsten Gratis-Spin anzeigen, wenn der heutige bereits genutzt wurde
        if (!freeSpinAvailable) {
            // Info für den nächsten Gratis-Spin anzeigen
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const now = new Date();
            const hoursLeft = Math.floor((tomorrow - now) / 1000 / 60 / 60);
            const minutesLeft = Math.floor(((tomorrow - now) / 1000 / 60) % 60);

            // Element für die Gratis-Spin-Info aktualisieren oder erstellen
            let freeSpinInfoElement = document.getElementById('free-spin-info');
            if (!freeSpinInfoElement) {
                freeSpinInfoElement = document.createElement('div');
                freeSpinInfoElement.id = 'free-spin-info';
                freeSpinInfoElement.className = 'free-spin-info';
                // Nach dem Spin-Button einfügen
                spinButton.parentNode.insertBefore(freeSpinInfoElement, spinButton.nextSibling);
            }

            freeSpinInfoElement.textContent = `Nächster Gratis-Spin in ${hoursLeft}h ${minutesLeft}m`;
            freeSpinInfoElement.style.display = 'block';
        } else {
            // Gratis-Spin-Info ausblenden, wenn verfügbar
            const freeSpinInfoElement = document.getElementById('free-spin-info');
            if (freeSpinInfoElement) {
                freeSpinInfoElement.style.display = 'none';
            }
        }
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

    // Spin ausführen (kombinierte Funktion für normale und Gratis-Spins)
    async function performSpin() {
        if (spinButton.disabled) return;

        let isGratisSpin = isFreeSpin;

        // Wenn es kein Gratis-Spin ist, Coins prüfen und abziehen
        if (!isGratisSpin) {
            // Prüfen, ob genügend Coins vorhanden sind
            if (coins < spinCost) {
                showMessage("Nicht genug Coins! Bitte füge mehr Coins hinzu.");
                return;
            }

            // Coins abziehen
            coins -= spinCost;
            // Coin-Zähler aktualisieren und im localStorage speichern
            updateCoinDisplay(false);
            saveCoins(coins);
        } else {
            // Gratis-Spin registrieren
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            lastFreeSpin = today;
            saveLastFreeSpin(today);

            // Meldung anzeigen
            showWinMessage("Dein täglicher GRATIS SPIN!");
        }

        // Button deaktivieren während des Spins
        spinButton.classList.add('disabled');
        spinButton.disabled = true;
        spinButton.textContent = isGratisSpin ? "GRATIS SPIN" : "SPIN";

        // Nacheinander alle Walzen drehen
        const promises = reels.map((reel, index) => {
            const duration = 2000 + index * 400; // Jede nachfolgende Walze dreht länger
            const delay = index * 150; // Jede nachfolgende Walze startet später
            return spinReel(index, duration, delay);
        });

        // Warten bis alle Walzen angehalten haben
        await Promise.all(promises);

        // Button-Status nach dem Spin aktualisieren
        updateCoinDisplay(true);
        updateSpinButton();

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

        // Wenn ein Gratis-Spin verfügbar ist, keine Error-Anzeige
        if (isFreeSpinAvailableToday()) {
            return;
        }

        // Spin-Button-Status basierend auf Coin-Anzahl anpassen
        if (coins < spinCost) {
            if (showError) {
                // Error-Zustand anzeigen
                spinButton.classList.add('error');
                spinButton.classList.remove('disabled');
                spinButton.textContent = "#ERROR#";
                spinButton.disabled = true;

                // Spin-Kosten-Text ebenfalls blinken lassen
                spinCostElement.classList.add('error');
            } else {
                // Deaktivieren ohne Error-Anzeige
                spinButton.classList.remove('error');
                spinButton.classList.add('disabled');
                spinButton.textContent = "SPIN";
                spinButton.disabled = true;

                // Auch kein Blinken für den Spin-Kosten-Text
                spinCostElement.classList.remove('error');
            }
        } else {
            // Normalen Zustand wiederherstellen
            spinButton.classList.remove('error', 'disabled');
            spinButton.textContent = "SPIN";
            spinButton.disabled = false;

            // Spin-Kosten-Text-Animation entfernen
            spinCostElement.classList.remove('error');
        }
    }

    // Coins hinzufügen (für Test-Zwecke)
    function addCoins() {
        coins += 5;
        updateCoinDisplay(false); // Bei Coins-Erhöhung keinen Error anzeigen
        saveCoins(coins); // Coins im localStorage speichern
        updateSpinButton(); // Button-Status aktualisieren
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
            updateCoinDisplay(true);
            saveCoins(coins); // Coins im localStorage speichern

            // Sequentiell alle Gewinnkombinationen animieren
            animateWinningSequences(winningSequences, 0, totalWinAmount);
        } else {
            // Sofort nach dem Spin den Button wieder aktivieren, wenn es keine Gewinne gibt
            spinButton.classList.remove('disabled');
            spinButton.disabled = false;
            updateSpinButton(); // Button-Status aktualisieren
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
                spinButton.classList.remove('disabled');
                spinButton.disabled = false;
                updateSpinButton(); // Button-Status aktualisieren
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
            
            /* Stil für den Spin-Button als Gratis-Spin */
            #spin-button.free-spin {
                background-color: #4CAF50;
                color: white;
                animation: glow 1.5s infinite alternate;
            }
            
            @keyframes glow {
                0% { box-shadow: 0 0 5px rgba(76, 175, 80, 0.5); }
                100% { box-shadow: 0 0 20px rgba(76, 175, 80, 0.8); }
            }
            
            /* Stil für den Countdown zum nächsten Gratis-Spin */
            .free-spin-info {
                font-size: 0.8em;
                color: #aaa;
                text-align: center;
                margin-top: 5px;
                font-style: italic;
            }
        `;
            document.head.appendChild(styleElement);
        }
    }

    // Event-Listener hinzufügen
    spinButton.addEventListener('click', performSpin);
    addCoinsButton.addEventListener('click', addCoins);

    // Beim Laden der Seite die Stile hinzufügen und die Walzen initialisieren
    addRequiredStyles();
    initializeReels();

    // Timer für die regelmäßige Aktualisierung des Countdown-Timers
    setInterval(() => {
        if (!isFreeSpinAvailableToday()) {
            updateSpinButton(); // Nur aktualisieren, wenn kein Gratis-Spin verfügbar ist
        }
    }, 60000); // Jede Minute aktualisieren
});