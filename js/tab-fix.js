// Direct tab fixing implementation
console.log('Tab fix script loaded!');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded in tab-fix.js');
    
    // Make sure to wait until all elements are available
    setTimeout(() => {
        console.log('Setting up direct tab handlers');
        
        // Get tab elements by selectors, avoiding any potential conflicts
        const gameTab = document.querySelector('.game-tabs .tab[data-tab="game"]');
        const historyTab = document.querySelector('.game-tabs .tab[data-tab="history"]');
        const statsTab = document.querySelector('.game-tabs .tab[data-tab="stats"]');
        
        const gameContent = document.getElementById('game-tab');
        const historyContent = document.getElementById('history-tab');
        const statsContent = document.getElementById('stats-tab');
        
        console.log('Tabs found:', 
            gameTab ? '✓ Game' : '✗ Game',
            historyTab ? '✓ History' : '✗ History',
            statsTab ? '✓ Stats' : '✗ Stats'
        );
        
        console.log('Content found:', 
            gameContent ? '✓ Game' : '✗ Game',
            historyContent ? '✓ History' : '✗ History',
            statsContent ? '✓ Stats' : '✗ Stats'
        );
        
        // Direct click handlers for each tab
        if (gameTab) {
            gameTab.addEventListener('click', (e) => {
                console.log('Game tab clicked');
                
                // Remove active class from all tabs and content
                document.querySelectorAll('.game-tabs .tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Set active class on this tab and content
                gameTab.classList.add('active');
                if (gameContent) {
                    gameContent.classList.add('active');
                    gameContent.style.display = 'block';
                }
                if (historyContent) historyContent.style.display = 'none';
                if (statsContent) statsContent.style.display = 'none';
            });
        }
        
        if (historyTab) {
            historyTab.addEventListener('click', (e) => {
                console.log('History tab clicked');
                
                // Remove active class from all tabs and content
                document.querySelectorAll('.game-tabs .tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Set active class on this tab and content
                historyTab.classList.add('active');
                if (historyContent) {
                    historyContent.classList.add('active');
                    historyContent.style.display = 'block';
                    
                    // If you have a loadUserHistory function, call it here
                    if (window.loadUserHistory) {
                        window.loadUserHistory();
                    }
                }
                if (gameContent) gameContent.style.display = 'none';
                if (statsContent) statsContent.style.display = 'none';
            });
        }
        
        if (statsTab) {
            statsTab.addEventListener('click', (e) => {
                console.log('Stats tab clicked');
                
                // Remove active class from all tabs and content
                document.querySelectorAll('.game-tabs .tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Set active class on this tab and content
                statsTab.classList.add('active');
                if (statsContent) {
                    statsContent.classList.add('active');
                    statsContent.style.display = 'block';
                    
                    // If you have a initStats function, call it here
                    if (window.initStats) {
                        window.initStats();
                    }
                }
                if (gameContent) gameContent.style.display = 'none';
                if (historyContent) historyContent.style.display = 'none';
            });
        }
    }, 2000); // Wait 2 seconds for everything to load
});

// Make the functions available globally
window.switchToGameTab = function() {
    const gameTab = document.querySelector('.game-tabs .tab[data-tab="game"]');
    if (gameTab) gameTab.click();
};

window.switchToHistoryTab = function() {
    const historyTab = document.querySelector('.game-tabs .tab[data-tab="history"]');
    if (historyTab) historyTab.click();
};

window.switchToStatsTab = function() {
    const statsTab = document.querySelector('.game-tabs .tab[data-tab="stats"]');
    if (statsTab) statsTab.click();
};
