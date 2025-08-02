/**
 * Main entry point for the Slot Machine application
 */

import { SlotMachine } from './core/SlotMachine.js';

// Initialize the slot machine when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const slotMachine = new SlotMachine();
    
    // Optional: Expose to global scope for debugging
    window.slotMachine = slotMachine;
});