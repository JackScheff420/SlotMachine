document.addEventListener('DOMContentLoaded', () => {
    // Symbole für die Slot Machine
    const symbols = [
        { name: '7', class: 'symbol-7', display: '7' },
        { name: 'bell', class: 'symbol-bell', display: '🔔' },
        { name: 'cherry', class: 'symbol-cherry', display: '🍒' },
        { name: 'lemon', class: 'symbol-lemon', display: '🍋' },
        { name: 'orange', class: 'symbol-orange', display: '🍊' },
        { name: 'plum', class: 'symbol-plum', display: '🍇' },
        { name: 'watermelon', class: 'symbol-watermelon', display: '🍉' }
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
    const extraSymbols = 20; // Zusätzliche Symbole für die Animation

    // Aktuelle Symbole speichern für jede Walze (3 sichtbare Symbole pro Walze)
    let currentReelSymbols = [];

    // Walzen initialisieren
    function initializeReels() {
        // Für jede Walze die aktuellen Symbole initialisieren
        for (let i = 0; i < reels.length; i++) {
            // Drei zufällige Symbole für die Startanzeige auswählen
            const reelSymbols = [];
            for (let j = 0; j < visibleRows; j++) {
                reelSymbols.push(symbols[Math.floor(Math.random() * symbols.length)]);
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
        while (symbolsContainer.firstChild) {
            symbolsContainer.removeChild(symbolsContainer.firstChild);
        }

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

            // Neue zufällige Symbole für das Ende des Spins generieren
            const newSymbols = [];
            for (let i = 0; i < visibleRows; i++) {
                newSymbols.push(symbols[Math.floor(Math.random() * symbols.length)]);
            }

            // Container leeren für die Animation
            while (symbolsContainer.firstChild) {
                symbolsContainer.removeChild(symbolsContainer.firstChild);
            }

            // Animation vorbereiten: 
            // 1. Unsichtbare neue Symbole (werden später sichtbar nach der Animation)
            newSymbols.forEach(symbol => {
                const symbolElement = document.createElement('div');
                symbolElement.className = `symbol ${symbol.class}`;
                symbolElement.textContent = symbol.display;
                symbolsContainer.appendChild(symbolElement);
            });

            // 2. Zufällige Symbole für die Animation (werden durchlaufen)
            const animationSymbols = [];
            for (let i = 0; i < extraSymbols; i++) {
                animationSymbols.push(symbols[Math.floor(Math.random() * symbols.length)]);
            }

            animationSymbols.forEach(symbol => {
                const symbolElement = document.createElement('div');
                symbolElement.className = `symbol ${symbol.class}`;
                symbolElement.textContent = symbol.display;
                symbolsContainer.appendChild(symbolElement);
            });

            // 3. Aktuelle Symbole am Ende des Containers (Startposition)
            currentReelSymbols[reelIndex].forEach(symbol => {
                const symbolElement = document.createElement('div');
                symbolElement.className = `symbol ${symbol.class}`;
                symbolElement.textContent = symbol.display;
                symbolsContainer.appendChild(symbolElement);
            });

            // Ausgangslage einstellen: Container nach oben verschieben, sodass aktuelle Symbole sichtbar sind
            const containerHeight = symbolsContainer.childElementCount * symbolHeight;
            const startPosition = -(containerHeight - (visibleRows + currentReelSymbols[reelIndex].length) * symbolHeight);

            symbolsContainer.style.transition = 'none';
            symbolsContainer.style.top = `${startPosition}px`;

            // Animation verzögern
            setTimeout(() => {
                // Animation starten: Von aktueller Position (aktuelle Symbole sichtbar) nach
                // unten bewegen, bis nur die neuen Symbole sichtbar sind
                const endPosition = 0;

                // Animation starten
                symbolsContainer.style.transition = `top ${duration}ms cubic-bezier(0.15, 0.85, 0.3, 1.0)`;
                symbolsContainer.style.top = `${endPosition}px`;

                // Nach Abschluss der Animation
                setTimeout(() => {
                    // Neue Symbole als aktuelle Symbole speichern
                    currentReelSymbols[reelIndex] = newSymbols;

                    // Display aktualisieren, um nur die neuen Symbole anzuzeigen
                    updateReelDisplay(reelIndex);

                    // Animation abgeschlossen
                    resolve();
                }, duration);
            }, delay);
        });
    }

    // Alle Walzen drehen
    async function spin() {
        if (spinButton.classList.contains('disabled')) return;

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