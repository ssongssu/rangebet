// Debug helper script
console.log('Debug script loaded');

// Check for DOM elements
setTimeout(() => {
    // Check the slider elements
    console.log('minHandle exists:', !!document.getElementById('min-handle'));
    console.log('maxHandle exists:', !!document.getElementById('max-handle'));
    console.log('selectedRange exists:', !!document.getElementById('selected-range'));
    console.log('sliderContainer exists:', !!document.querySelector('.slider-container'));
    
    // Check the betting elements
    console.log('betAmountInput exists:', !!document.getElementById('bet-amount'));
    console.log('betButton exists:', !!document.getElementById('bet-button'));
    
    // Check if the multiplier buttons have event listeners
    const multiplierBtns = document.querySelectorAll('.multiplier-btn');
    console.log('multiplierBtns count:', multiplierBtns.length);
    
    // Test all JavaScript imports
    console.log('Testing imports...');
    import('./firebase-config.js').then(() => {
        console.log('firebase-config.js loaded successfully');
    }).catch(err => {
        console.error('Error loading firebase-config.js:', err);
    });
    
    import('./auth.js').then(() => {
        console.log('auth.js loaded successfully');
    }).catch(err => {
        console.error('Error loading auth.js:', err);
    });
    
    import('./game.js').then(() => {
        console.log('game.js loaded successfully');
    }).catch(err => {
        console.error('Error loading game.js:', err);
    });
    
    import('./stats.js').then(() => {
        console.log('stats.js loaded successfully');
    }).catch(err => {
        console.error('Error loading stats.js:', err);
    });
    
    // Log the current module system
    console.log('Script type:', document.querySelector('script[type="module"]') ? 'ES modules' : 'Traditional');
}, 2000);
