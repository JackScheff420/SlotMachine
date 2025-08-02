/**
 * Animation utilities for the slot machine
 */

// Hilfsfunktion zum Hinzufügen von Highlights
export function addHighlight(symbolElement, specialClass = '') {
    // Highlight-Element erstellen
    const highlight = document.createElement('div');
    highlight.className = `symbol-highlight ${specialClass}`;

    // Highlight dem Symbol hinzufügen
    symbolElement.style.position = 'relative';
    symbolElement.appendChild(highlight);
}

// Alle Hervorhebungen entfernen
export function removeHighlights() {
    document.querySelectorAll('.symbol-highlight').forEach(el => el.remove());
}

// Dynamically get symbol height based on CSS
export function getSymbolHeight() {
    // Get the first symbol element to measure its actual height
    const firstReel = document.querySelector('.reel');
    const firstSymbol = firstReel?.querySelector('.symbol');
    if (firstSymbol) {
        return firstSymbol.offsetHeight;
    }
    // Fallback to 100 if no symbol found
    return 100;
}

// Add required styles for animations
export function addRequiredStyles() {
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