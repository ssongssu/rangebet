// Tab Switching Logic
import { loadUserHistory } from './stats.js';
import { initStats } from './stats.js';

document.addEventListener('DOMContentLoaded', () => {
    const gameTabs = document.querySelectorAll('.game-tabs .tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // Add click event to each tab
    gameTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');

            // Remove active class from all tabs and tab contents
            gameTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');

            // Specific actions for tabs
            if (tabName === 'history') {
                console.log('Loading history...');
                loadUserHistory();
            }

            if (tabName === 'stats') {
                console.log('Initializing stats...');
                initStats();
            }
        });
    });
});

export {};