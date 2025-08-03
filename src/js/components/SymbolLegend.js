/**
 * Symbol Legend Component
 * Displays symbol values and winning combination multipliers
 */

import { symbolConfig, winConfig } from '../config/gameConfig.js';

export class SymbolLegend {
    constructor(gameState) {
        this.gameState = gameState;
        this.symbolsListElement = document.getElementById('symbols-list');
        this.combinationsListElement = document.getElementById('combinations-list');
    }

    initialize() {
        this.renderSymbolValues();
        this.renderCombinationMultipliers();
    }

    renderSymbolValues() {
        if (!this.symbolsListElement) return;

        // Clear existing content
        this.symbolsListElement.innerHTML = '';

        // Sort symbols by value (highest to lowest)
        const sortedSymbols = symbolConfig.definitions
            .map(symbol => ({
                ...symbol,
                value: symbolConfig.values[symbol.name] || 1
            }))
            .sort((a, b) => b.value - a.value);

        // Create symbol items
        sortedSymbols.forEach(symbol => {
            const symbolItem = document.createElement('div');
            symbolItem.className = 'symbol-item';

            symbolItem.innerHTML = `
                <div class="symbol-display">
                    <div class="symbol-icon">${symbol.display}</div>
                    <div class="symbol-name">${this.getSymbolDisplayName(symbol.name)}</div>
                </div>
                <div class="symbol-value">${symbol.value}</div>
            `;

            this.symbolsListElement.appendChild(symbolItem);
        });
    }

    renderCombinationMultipliers() {
        if (!this.combinationsListElement) return;

        // Clear existing content
        this.combinationsListElement.innerHTML = '';

        // Horizontal combinations
        Object.entries(winConfig.horizontalCountMultiplier).forEach(([count, multiplier]) => {
            const combinationItem = document.createElement('div');
            combinationItem.className = 'combination-item';

            combinationItem.innerHTML = `
                <div class="combination-type">${count} gleiche horizontal</div>
                <div class="combination-multiplier">${multiplier}x</div>
            `;

            this.combinationsListElement.appendChild(combinationItem);
        });

        // Vertical combinations
        if (winConfig.verticalMultiplier > 0) {
            const verticalItem = document.createElement('div');
            verticalItem.className = 'combination-item';

            verticalItem.innerHTML = `
                <div class="combination-type">3 gleiche vertikal</div>
                <div class="combination-multiplier">${winConfig.verticalMultiplier}x</div>
            `;

            this.combinationsListElement.appendChild(verticalItem);
        }

        // Diagonal combinations
        if (winConfig.diagonalBonus > 1) {
            const diagonalItem = document.createElement('div');
            diagonalItem.className = 'combination-item';

            diagonalItem.innerHTML = `
                <div class="combination-type">Diagonal</div>
                <div class="combination-multiplier">${winConfig.diagonalBonus}x</div>
            `;

            this.combinationsListElement.appendChild(diagonalItem);
        }

        // X-Formation bonus
        if (winConfig.xFormationBonus > 1) {
            const xFormationItem = document.createElement('div');
            xFormationItem.className = 'combination-item';

            xFormationItem.innerHTML = `
                <div class="combination-type">X-Formation</div>
                <div class="combination-multiplier">${winConfig.xFormationBonus}x</div>
            `;

            this.combinationsListElement.appendChild(xFormationItem);
        }
    }

    getSymbolDisplayName(symbolName) {
        const nameMap = {
            '7': 'Sieben',
            'bell': 'Glocke',
            'cherry': 'Kirsche',
            'lemon': 'Zitrone',
            'orange': 'Orange',
            'plum': 'Pflaume',
            'watermelon': 'Melone'
        };

        return nameMap[symbolName] || symbolName;
    }

    // Method to update legend if game config changes
    refresh() {
        this.renderSymbolValues();
        this.renderCombinationMultipliers();
    }
}