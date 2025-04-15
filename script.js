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

    // Initialisierung der Walzen
    function initializeReels() {
        reels.forEach(reel => {
            // Jede Walze erhält 3 sichtbare Symbole plus extras für Animation
            for (let i = 0; i < 15; i++) {
                const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
                const symbolElement = document.createElement('div');
                symbolElement.className = `symbol ${randomSymbol.class}`;
                symbolElement.textContent = randomSymbol.display;
                reel.appendChild(symbolElement);
            }
        });
    }

    // Eine einzelne Walze drehen
    function spinReel(reel, duration, delay) {
        return new Promise(resolve => {
            // Aktuelle Position merken
            const currentPosition = parseInt(reel.style.top || '0');

            // Neue Symbole am Ende hinzufügen
            for (let i = 0; i < 10; i++) {
                const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
                const symbolElement = document.createElement('div');
                symbolElement.className = `symbol ${randomSymbol.class}`;
                symbolElement.textContent = randomSymbol.display;
                reel.appendChild(symbolElement);
            }

            // Animation starten nach Verzögerung
            setTimeout(() => {
                reel.style.transition = `top ${duration}ms cubic-bezier(0.45, 0.05, 0.55, 0.95)`;
                reel.style.top = `${currentPosition - 1000}px`;

                // Nach Ende der Animation aufräumen
                setTimeout(() => {
                    reel.style.transition = 'none';
                    // Obere Elemente entfernen und nach unten setzen
                    for (let i = 0; i < 10; i++) {
                        if (reel.firstChild) {
                            reel.removeChild(reel.firstChild);
                        }
                    }
                    reel.style.top = `${currentPosition}px`;
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

        // Nacheinander alle Walzen drehen mit unterschiedlicher Verzögerung
        const promises = reels.map((reel, index) => {
            const duration = 2000 + index * 500; // Erste Walze stoppt zuerst, letzte zuletzt
            const delay = index * 300; // Walzen starten nacheinander
            return spinReel(reel, duration, delay);
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
            alert('Glückwunsch! Du hast gewonnen!');
        }
    }

    // Event-Listener hinzufügen
    spinButton.addEventListener('click', spin);

    // Initialisierung
    initializeReels();
});