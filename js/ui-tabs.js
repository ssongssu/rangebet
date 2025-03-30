// Tab Switching Logic
import { loadUserHistory } from './stats.js';
import { initStats } from './stats.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - initializing tabs');
    const gameTabs = document.querySelectorAll('.game-tabs .tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    console.log('Found tabs:', gameTabs.length);
    console.log('Found tab contents:', tabContents.length);

    // Add click event to each tab
    gameTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            console.log('Tab clicked:', tabName);

            // Remove active class from all tabs and tab contents
            gameTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const tabContent = document.getElementById(`${tabName}-tab`);
            console.log('Tab content element:', tabContent ? 'found' : 'not found');
            
            if (tabContent) {
                tabContent.classList.add('active');
            } else {
                console.error(`Could not find tab content with id: ${tabName}-tab`);
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
    
    // For debugging: list all tab content elements
    console.log('All tab content elements:');
    Array.from(document.querySelectorAll('[id$="-tab"]')).forEach(el => {
        console.log(`- ${el.id}: ${el.classList.contains('active') ? 'active' : 'inactive'}`);
    });
});

export {};