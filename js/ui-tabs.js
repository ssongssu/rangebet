// Tab Switching Logic
import { loadUserHistory } from './stats.js';
import { initStats } from './stats.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    
    const gameTabs = document.querySelectorAll('.game-tabs .tab');
    const tabContents = document.querySelectorAll('.tab-content');

    console.log('Game Tabs found:', gameTabs.length);
    console.log('Tab Contents found:', tabContents.length);

    // Add click event to each tab
    gameTabs.forEach(tab => {
        tab.addEventListener('click', (event) => {
            console.log('Tab clicked:', tab);
            const tabName = tab.getAttribute('data-tab');
            console.log('Tab name:', tabName);

            // Prevent default behavior
            event.preventDefault();

            // Remove active class from all tabs and tab contents
            gameTabs.forEach(t => {
                console.log('Removing active from:', t);
                t.classList.remove('active');
            });
            tabContents.forEach(tc => {
                console.log('Removing active from content:', tc);
                tc.classList.remove('active');
            });

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const targetTab = document.getElementById(`${tabName}-tab`);
            
            if (targetTab) {
                console.log('Target tab found:', targetTab);
                targetTab.classList.add('active');
            } else {
                console.error('Target tab not found for:', tabName);
            }

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