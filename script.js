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

    // DOM-Elemente
    const reels = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3'),
        document.getElementById('reel4'),
        document.getElementById('reel5')
    ];
    const spinButton = document.getElementById('spin-button');

    // Konstanten für die Animation
    const symbolHeight = 100; // Höhe eines Symbols in Pixel
    const visibleRows = 3; // Anzahl der sichtbaren Reihen
    const spinSymbols = 20; // Anzahl der Symbole für die Drehung

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

        // Optional: Prüfen auf Gewinnkombinationen
        checkWinningCombinations();
    }

    // Optional: Gewinnkombinationen prüfen
    function checkWinningCombinations() {
        // Hier könntest du die Logik implementieren, um zu prüfen,
        // ob der Spieler gewonnen hat
        // Für dieses Beispiel: Einfach ein zufälliges Ergebnis zurückgeben
        const hasWon = Math.random() > 0.7;
        if (hasWon) {
            setTimeout(() => {
                alert('Glückwunsch! Du hast gewonnen!');
            }, 500);
        }
    }

    // Event-Listener hinzufügen
    spinButton.addEventListener('click', spin);

    // Initialisierung
    initializeReels();
});