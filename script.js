document.addEventListener('DOMContentLoaded', () => {
    // Symbole für die Slot Machine mit Gewichtungen
    const symbols = [
        { name: '7', class: 'symbol-7', display: '7', weight: 1 },            // Am seltensten
        { name: 'bell', class: 'symbol-bell', display: '🔔', weight: 3 },     // Sehr selten
        { name: 'cherry', class: 'symbol-cherry', display: '🍒', weight: 5 }, // Selten
        { name: 'lemon', class: 'symbol-lemon', display: '🍋', weight: 8 },   // Etwas selten
        { name: 'orange', class: 'symbol-orange', display: '🍊', weight: 12 }, // Mittel
        { name: 'plum', class: 'symbol-plum', display: '🍇', weight: 18 },     // Häufig
        { name: 'watermelon', class: 'symbol-watermelon', display: '🍉', weight: 25 } // Am häufigsten
    ];

    // Gewinnkombinationen und Auszahlungen
    const winningCombinations = [
        { symbols: ['7', '7', '7'], multiplier: 50 },        // Jackpot
        { symbols: ['bell', 'bell', 'bell'], multiplier: 15 },
        { symbols: ['cherry', 'cherry', 'cherry'], multiplier: 10 },
        { symbols: ['lemon', 'lemon', 'lemon'], multiplier: 8 },
        { symbols: ['orange', 'orange', 'orange'], multiplier: 6 },
        { symbols: ['plum', 'plum', 'plum'], multiplier: 4 },
        { symbols: ['watermelon', 'watermelon', 'watermelon'], multiplier: 3 },
        // Gemischte Fruchtkombo
        { symbols: ['orange', 'lemon', 'watermelon'], multiplier: 2 }
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

    // Konstanten für die Animation
    const symbolHeight = 100; // Höhe eines Symbols in Pixel
    const visibleRows = 3; // Anzahl der sichtbaren Reihen
    const spinSymbols = 20; // Anzahl der Symbole für die Drehung
    const spinCost = 1; // Kosten für einen Spin in Coins

    // Coins initialisieren
    let coins = 100;
    updateCoinDisplay();

    // Aktuelle Symbole speichern für jede Walze
    let currentReelSymbols = [];

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

        // Prüfen, ob genügend Coins vorhanden sind
        if (coins < spinCost) {
            showMessage("Nicht genug Coins! Bitte füge mehr Coins hinzu.");
            return;
        }

        // Coins abziehen
        coins -= spinCost;
        updateCoinDisplay();

        // Button deaktivieren während des Spins
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

        // Button wieder aktivieren
        spinButton.classList.remove('disabled');
        spinButton.disabled = false;

        // Gewinnkombinationen prüfen
        checkWinningCombinations();
    }

    // Nachricht anzeigen
    function showMessage(message) {
        alert(message);
    }

    // Coin-Anzeige aktualisieren
    function updateCoinDisplay() {
        coinCountElement.textContent = coins;

        // Spin-Button deaktivieren, wenn nicht genug Coins
        if (coins < spinCost) {
            spinButton.classList.add('disabled');
            spinButton.disabled = true;
        } else {
            spinButton.classList.remove('disabled');
            spinButton.disabled = false;
        }
    }

    // Coins hinzufügen (für Test-Zwecke)
    function addCoins() {
        coins += 50;
        updateCoinDisplay();
        showMessage("50 Coins hinzugefügt!");
    }

    // Gewinnkombinationen prüfen
    function checkWinningCombinations() {
        // In diesem Beispiel prüfen wir nur die mittlere Reihe (Index 1 bei visibleRows=3)
        const middleRowSymbols = currentReelSymbols.map(reelSymbols => reelSymbols[1].name);

        // Prüfe die ersten drei Symbole für Gewinnkombinationen
        const firstThreeSymbols = middleRowSymbols.slice(0, 3);

        // Suche nach Gewinnkombinationen
        let win = false;
        let winAmount = 0;

        for (const combo of winningCombinations) {
            // Prüfen, ob die Kombination übereinstimmt 
            // (Reihenfolge spielt für einfache Gewinne keine Rolle)
            if (containsAll(firstThreeSymbols, combo.symbols) ||
                (combo.symbols.length === 3 &&
                    firstThreeSymbols[0] === combo.symbols[0] &&
                    firstThreeSymbols[1] === combo.symbols[1] &&
                    firstThreeSymbols[2] === combo.symbols[2])) {
                win = true;
                winAmount = spinCost * combo.multiplier;
                break;
            }
        }

        // Falls gewonnen, Belohnung vergeben
        if (win) {
            coins += winAmount;
            updateCoinDisplay();
            showMessage(`Glückwunsch! Du hast ${winAmount} Coins gewonnen!`);
        }
    }

    // Hilfsfunktion: Prüft, ob alle Elemente von subset in set enthalten sind
    function containsAll(set, subset) {
        return subset.every(val => {
            return set.filter(item => item === val).length >=
                subset.filter(item => item === val).length;
        });
    }

    // Event-Listener hinzufügen
    spinButton.addEventListener('click', spin);
    addCoinsButton.addEventListener('click', addCoins);

    // Initialisierung
    initializeReels();
});