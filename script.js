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
    const autoSpinButton = document.getElementById('auto-spin-button');
    const coinCountElement = document.getElementById('coin-count');

    // Konstanten für die Animation
    const visibleRows = 3; // Anzahl der sichtbaren Reihen
    const spinSymbols = 20; // Anzahl der Symbole für die Drehung
    const spinCost = 1; // Kosten für einen Spin in Coins

    // LocalStorage Keys
    const COINS_KEY = 'slotMachineCoins';
    const LAST_FREE_SPIN_KEY = 'slotMachineLastFreeSpin';
    const POWERUPS_KEY = 'slotMachinePowerups';

    // Powerup definitions
    const powerups = [
        {
            id: 'double_money',
            name: 'Double Money',
            description: 'Double winnings for 3 spins',
            cost: 5,
            duration: 3,
            icon: '💰'
        },
        {
            id: 'lucky_sevens',
            name: 'Lucky 7s',
            description: 'Higher chance for rare symbols for 5 spins',
            cost: 10,
            duration: 5,
            icon: '🍀'
        },
        {
            id: 'symbol_lock',
            name: 'Symbol Lock',
            description: 'Lock 2 reels on next spin',
            cost: 15,
            duration: 1,
            icon: '🔒'
        }
    ];

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
    let activePowerups = loadPowerupsFromStorage();
    let lockedReels = []; // For symbol lock powerup
    
    // Auto Spin state management
    let isAutoSpinActive = false;
    let autoSpinTimeoutId = null;

    updateSpinButtonState();
    updateCoinDisplay(false); // false = keine Error-Anzeige beim Start
    updatePowerupDisplay();
    updateAutoSpinButtonState();

    // Aktuelle Symbole speichern für jede Walze
    let currentReelSymbols = [];

    // Auto Spin Management Functions
    function toggleAutoSpin() {
        if (isAutoSpinActive) {
            stopAutoSpin();
        } else {
            startAutoSpin();
        }
    }

    function startAutoSpin() {
        // Check if we can start auto spin
        if (coins < spinCost && !hasFreeSpin) {
            showMessage("Nicht genug Coins für Auto Spin!");
            return;
        }

        isAutoSpinActive = true;
        updateAutoSpinButtonState();
        showMessage("Auto Spin aktiviert!");
        
        // Start the first spin immediately
        triggerAutoSpin();
    }

    function stopAutoSpin() {
        isAutoSpinActive = false;
        
        // Clear any pending auto spin timeout
        if (autoSpinTimeoutId) {
            clearTimeout(autoSpinTimeoutId);
            autoSpinTimeoutId = null;
        }
        
        updateAutoSpinButtonState();
        showMessage("Auto Spin gestoppt!");
    }

    function triggerAutoSpin() {
        if (!isAutoSpinActive) return;
        
        // Check if we still have coins or free spin
        if (coins < spinCost && !hasFreeSpin) {
            stopAutoSpin();
            showMessage("Auto Spin gestoppt - nicht genug Coins!");
            return;
        }
        
        // Trigger a spin
        spin().then(() => {
            // Schedule next auto spin if still active
            if (isAutoSpinActive) {
                autoSpinTimeoutId = setTimeout(() => {
                    triggerAutoSpin();
                }, 500); // Reduced delay for more responsive auto spin
            }
        }).catch((error) => {
            console.error("Auto spin error:", error);
            stopAutoSpin();
        });
    }

    function updateAutoSpinButtonState() {
        if (isAutoSpinActive) {
            autoSpinButton.classList.add('active');
            autoSpinButton.classList.remove('disabled');
            autoSpinButton.textContent = 'STOP AUTO';
            autoSpinButton.disabled = false;
        } else {
            autoSpinButton.classList.remove('active');
            
            // Disable auto spin if not enough coins and no free spin
            if (coins < spinCost && !hasFreeSpin) {
                autoSpinButton.classList.add('disabled');
                autoSpinButton.disabled = true;
                autoSpinButton.textContent = 'AUTO SPIN';
            } else {
                autoSpinButton.classList.remove('disabled');
                autoSpinButton.disabled = false;
                autoSpinButton.textContent = 'AUTO SPIN';
            }
        }
    }

    // Lädt Coins aus dem localStorage oder setzt auf Standardwert
    function loadCoinsFromStorage() {
        const savedCoins = localStorage.getItem(COINS_KEY);
        return savedCoins !== null ? parseInt(savedCoins) : 10; // Standardwert: 10 Coins
    }

    // Speichert Coins im localStorage
    function saveCoinsToStorage() {
        localStorage.setItem(COINS_KEY, coins.toString());
    }

    // Lädt Powerups aus dem localStorage
    function loadPowerupsFromStorage() {
        const savedPowerups = localStorage.getItem(POWERUPS_KEY);
        return savedPowerups ? JSON.parse(savedPowerups) : {};
    }

    // Speichert Powerups im localStorage
    function savePowerupsToStorage() {
        localStorage.setItem(POWERUPS_KEY, JSON.stringify(activePowerups));
    }

    // Powerup-Management-Funktionen
    function isPowerupActive(powerupId) {
        return activePowerups[powerupId] && activePowerups[powerupId] > 0;
    }

    function activatePowerup(powerupId, duration) {
        activePowerups[powerupId] = duration;
        savePowerupsToStorage();
        updatePowerupDisplay();
    }

    function decrementPowerups() {
        let updated = false;
        for (const powerupId in activePowerups) {
            if (activePowerups[powerupId] > 0) {
                activePowerups[powerupId]--;
                updated = true;
                if (activePowerups[powerupId] <= 0) {
                    delete activePowerups[powerupId];
                }
            }
        }
        if (updated) {
            savePowerupsToStorage();
            updatePowerupDisplay();
        }
    }

    function purchasePowerup(powerupId) {
        const powerup = powerups.find(p => p.id === powerupId);
        if (!powerup) return false;
        
        if (coins < powerup.cost) {
            showMessage(`Nicht genug Coins! Du brauchst ${powerup.cost} Coins für ${powerup.name}.`);
            return false;
        }

        // Special handling for symbol lock
        if (powerupId === 'symbol_lock' && isPowerupActive('symbol_lock')) {
            showMessage("Symbol Lock ist bereits aktiv!");
            return false;
        }

        coins -= powerup.cost;
        saveCoinsToStorage();
        activatePowerup(powerupId, powerup.duration);
        updateCoinDisplay(true);
        showMessage(`${powerup.name} aktiviert!`);
        return true;
    }
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
        let symbolsToUse = symbols;
        
        // Lucky 7s powerup: Increase weight of rare symbols
        if (isPowerupActive('lucky_sevens')) {
            symbolsToUse = symbols.map(symbol => {
                // Increase weight for rare symbols (7, bell, cherry)
                if (['7', 'bell', 'cherry'].includes(symbol.name)) {
                    return { ...symbol, weight: symbol.weight * 3 };
                }
                return symbol;
            });
        }

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

    // Dynamically get symbol height based on CSS
    function getSymbolHeight() {
        // Get the first symbol element to measure its actual height
        const firstReel = reels[0];
        const firstSymbol = firstReel.querySelector('.symbol');
        if (firstSymbol) {
            return firstSymbol.offsetHeight;
        }
        // Fallback to 100 if no symbol found
        return 100;
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

            // Check if this reel is locked
            if (lockedReels.includes(reelIndex)) {
                // Reel is locked, don't change its symbols
                setTimeout(() => {
                    resolve();
                }, duration + delay);
                return;
            }

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
        if (spinButton.disabled) return Promise.resolve();

        const useFreeSpin = hasFreeSpin;

        // Prüfen, ob genügend Coins vorhanden sind oder Free Spin verfügbar
        if (!useFreeSpin && coins < spinCost) {
            showMessage("Nicht genug Coins! Bitte füge mehr Coins hinzu.");
            // Stop auto spin if running
            if (isAutoSpinActive) {
                stopAutoSpin();
            }
            return Promise.resolve();
        }

        // Check for symbol lock powerup before spin
        if (isPowerupActive('symbol_lock') && lockedReels.length === 0) {
            // Allow player to select reels to lock
            showReelSelection();
            // Stop auto spin if running since we need manual interaction
            if (isAutoSpinActive) {
                stopAutoSpin();
                showMessage("Auto Spin gestoppt - Symbol Lock Auswahl erforderlich!");
            }
            return Promise.resolve(); // Wait for reel selection
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

        // Clear locked reels after spin
        lockedReels = [];
        removeReelLocks();

        // Decrement powerup durations after spin
        decrementPowerups();

        // NACH dem Spin den Button-Status aktualisieren
        updateCoinDisplay(true);
        updateAutoSpinButtonState();

        // Gewinnkombinationen prüfen
        await checkWinningCombinations();
        
        // Only reactivate buttons after all animations and win sequences are complete
        updateSpinButtonState();
        
        return Promise.resolve();
    }

    // Nachricht anzeigen
    function showMessage(message) {
        // Prüfen ob bereits ein Message-Element existiert
        let messageElement = document.getElementById('general-message');

        // Falls nicht, erstellen wir ein neues
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'general-message';
            messageElement.className = 'win-message';
            document.querySelector('.container').prepend(messageElement);
        }

        // Nachricht setzen
        messageElement.textContent = message;

        // Animation für das Einblenden
        messageElement.classList.remove('show');
        void messageElement.offsetHeight; // Force reflow
        messageElement.classList.add('show');

        // Nach 3 Sekunden ausblenden
        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 3000);
    }

    // Coin-Anzeige aktualisieren
    // showError bestimmt, ob der Error-Status angezeigt werden soll
    function updateCoinDisplay(showError) {
        coinCountElement.textContent = coins;

        // Add double money indicator if active
        if (isPowerupActive('double_money')) {
            coinCountElement.parentElement.classList.add('double-money-active');
        } else {
            coinCountElement.parentElement.classList.remove('double-money-active');
        }

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
        updateAutoSpinButtonState();
        updatePowerupDisplay();
    }

    // Gewinnkombinationen prüfen
    function checkWinningCombinations() {
        return new Promise((resolve) => {
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

        // 1. Horizontale Muster prüfen (bestehende Logik)
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

        // 2. Vertikale Muster prüfen (drei in einer Spalte)
        for (let colIndex = 0; colIndex < reels.length; colIndex++) {
            const columnSymbols = [];
            for (let row = 0; row < visibleRows; row++) {
                columnSymbols.push(allRowsSymbols[row][colIndex]);
            }

            // Prüfen ob alle 3 Symbole in der Spalte identisch sind
            if (columnSymbols.length >= 3 && 
                columnSymbols[0].name === columnSymbols[1].name && 
                columnSymbols[1].name === columnSymbols[2].name) {
                
                const symbolValue = getSymbolValue(columnSymbols[0].name);
                const winAmount = spinCost * symbolValue * 1; // Basis-Multiplikator für 3er-Spalte
                totalWinAmount += winAmount;

                winningSequences.push({
                    type: 'vertical',
                    column: colIndex,
                    symbol: columnSymbols[0].name,
                    winAmount: winAmount
                });
            }
        }

        // 3. Diagonale Muster prüfen (X Formation)
        if (visibleRows >= 3 && reels.length >= 3) {
            // Haupt-Diagonale (links-oben nach rechts-unten)
            const mainDiagonal = [
                allRowsSymbols[0][0], // Oben links
                allRowsSymbols[1][1], // Mitte
                allRowsSymbols[2][2]  // Unten rechts
            ];

            if (mainDiagonal[0].name === mainDiagonal[1].name && 
                mainDiagonal[1].name === mainDiagonal[2].name) {
                
                const symbolValue = getSymbolValue(mainDiagonal[0].name);
                const winAmount = spinCost * symbolValue * 1.5; // Bonus für Diagonal
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
                const winAmount = spinCost * symbolValue * 1.5; // Bonus für Diagonal
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
                const winAmount = spinCost * symbolValue * 3; // Großer Bonus für X-Formation
                totalWinAmount += winAmount;

                winningSequences.push({
                    type: 'x_formation',
                    symbol: mainDiagonal[0].name,
                    winAmount: winAmount
                });
            }
        }

        // Wenn es Gewinnkombinationen gibt
        if (winningSequences.length > 0) {
            // Apply double money powerup if active
            if (isPowerupActive('double_money')) {
                totalWinAmount *= 2;
            }
            
            // Coins hinzufügen
            coins += totalWinAmount;
            // Im LocalStorage speichern
            saveCoinsToStorage();
            updateCoinDisplay(true);

            // Sequentiell alle Gewinnkombinationen animieren
            animateWinningSequences(winningSequences, 0, totalWinAmount, resolve);
        } else {
            // No wins, resolve immediately
            resolve();
        }
        });
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
    function animateWinningSequences(sequences, currentIndex, totalWinAmount, resolve) {
        // Alle Animationen abgeschlossen
        if (currentIndex >= sequences.length) {
            // Nachricht mit Gesamtgewinn anzeigen (ohne alert)
            showWinMessage(`Glückwunsch! Du hast ${totalWinAmount} Coins gewonnen!`);

            // Wait for the full win message display duration before resolving
            setTimeout(() => {
                if (resolve) resolve(); // Call the promise resolve callback
            }, 3000); // Wait for the full 3 seconds of win message display
            return;
        }

        const sequence = sequences[currentIndex];

        // Symbole in dieser Gewinnreihe markieren basierend auf Typ
        highlightWinningSymbols(sequence);

        // Nach einer Verzögerung die Markierung entfernen und zur nächsten Kombination gehen
        setTimeout(() => {
            removeHighlights();
            animateWinningSequences(sequences, currentIndex + 1, totalWinAmount, resolve);
        }, 1500); // 1,5 Sekunden pro Kombination anzeigen
    }

    // Gewinnkombination hervorheben basierend auf Typ
    function highlightWinningSymbols(sequence) {
        switch (sequence.type) {
            case 'horizontal':
                // Horizontale Linie hervorheben (bestehende Logik)
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
                for (let row = 0; row < visibleRows; row++) {
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

    // Hilfsfunktion zum Hinzufügen von Highlights
    function addHighlight(symbolElement, specialClass = '') {
        // Highlight-Element erstellen
        const highlight = document.createElement('div');
        highlight.className = `symbol-highlight ${specialClass}`;

        // Highlight dem Symbol hinzufügen
        symbolElement.style.position = 'relative';
        symbolElement.appendChild(highlight);
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

    // Symbol Lock powerup functions
    let reelSelectionActive = false;
    
    function showReelSelection() {
        showMessage("Symbol Lock aktiv! Klicke auf 2 Walzen um sie zu sperren.");
        reelSelectionActive = true;
        
        // Add click handlers to reels
        reels.forEach((reel, index) => {
            reel.classList.add('selectable');
        });
    }

    function handleReelClick(event) {
        if (!reelSelectionActive) return;
        
        // Find which reel was clicked
        const clickedReel = event.currentTarget;
        const reelIndex = reels.indexOf(clickedReel);
        
        if (reelIndex === -1) return;
        
        selectReel(reelIndex);
    }

    function selectReel(reelIndex) {
        const reel = reels[reelIndex];
        
        if (lockedReels.includes(reelIndex)) {
            // Deselect reel
            lockedReels = lockedReels.filter(r => r !== reelIndex);
            reel.classList.remove('locked');
        } else if (lockedReels.length < 2) {
            // Select reel
            lockedReels.push(reelIndex);
            reel.classList.add('locked');
        }

        // Check if we have 2 reels selected
        if (lockedReels.length === 2) {
            reelSelectionActive = false;
            
            // Remove selectable state from all reels
            reels.forEach(r => {
                r.classList.remove('selectable');
            });
            
            showMessage("Walzen gesperrt! Drehe jetzt!");
        }
    }

    function removeReelLocks() {
        reels.forEach(reel => {
            reel.classList.remove('locked', 'selectable');
        });
    }

    // Update powerup display
    function updatePowerupDisplay() {
        const activeList = document.getElementById('active-powerups-list');
        if (!activeList) return;

        activeList.innerHTML = '';
        
        for (const powerupId in activePowerups) {
            const powerup = powerups.find(p => p.id === powerupId);
            const remainingUses = activePowerups[powerupId];
            
            if (powerup && remainingUses > 0) {
                const powerupElement = document.createElement('div');
                powerupElement.className = 'active-powerup';
                powerupElement.innerHTML = `
                    <span class="powerup-icon">${powerup.icon}</span>
                    <span class="powerup-name">${powerup.name}</span>
                    <span class="powerup-remaining">${remainingUses}</span>
                `;
                activeList.appendChild(powerupElement);
            }
        }

        // Update buy button states
        powerups.forEach(powerup => {
            const buyBtn = document.querySelector(`[data-powerup="${powerup.id}"] .powerup-buy-btn`);
            if (buyBtn) {
                const canAfford = coins >= powerup.cost;
                const isActive = isPowerupActive(powerup.id);
                
                buyBtn.disabled = !canAfford || (isActive && powerup.id === 'symbol_lock');
                buyBtn.textContent = isActive && powerup.id === 'symbol_lock' ? 'ACTIVE' : 'BUY';
                buyBtn.className = `powerup-buy-btn ${!canAfford ? 'disabled' : ''} ${isActive && powerup.id === 'symbol_lock' ? 'active' : ''}`;
            }
        });
    }

    // Make purchasePowerup available globally
    window.purchasePowerup = purchasePowerup;
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
            
            /* Spezieller Stil für X-Formation */
            .symbol-highlight.x-formation {
                border: 4px solid #ff4444;
                box-shadow: 0 0 15px #ff4444, 0 0 30px #ff4444;
                animation: pulse-x 0.3s infinite alternate;
            }
            
            @keyframes pulse {
                0% { opacity: 0.4; transform: scale(0.95); }
                100% { opacity: 1; transform: scale(1.05); }
            }
            
            @keyframes pulse-x {
                0% { 
                    opacity: 0.6; 
                    transform: scale(0.9); 
                    box-shadow: 0 0 15px #ff4444, 0 0 30px #ff4444;
                }
                100% { 
                    opacity: 1; 
                    transform: scale(1.1); 
                    box-shadow: 0 0 25px #ff4444, 0 0 50px #ff4444;
                }
            }
            
            /* Double money indicator */
            .double-money-active {
                position: relative;
            }
            
            .double-money-active::after {
                content: "2X";
                position: absolute;
                top: -5px;
                right: -5px;
                background: gold;
                color: black;
                border-radius: 50%;
                width: 25px;
                height: 25px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                animation: double-money-glow 1s infinite alternate;
            }
            
            @keyframes double-money-glow {
                0% { box-shadow: 0 0 5px gold; }
                100% { box-shadow: 0 0 15px gold; }
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
                updateAutoSpinButtonState();
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
    autoSpinButton.addEventListener('click', toggleAutoSpin);
    
    // Add click listeners to reels for symbol lock
    reels.forEach(reel => {
        reel.addEventListener('click', handleReelClick);
    });

    // Initialisierung
    addRequiredStyles();
    initializeReels();
    startTimerUpdater();
});