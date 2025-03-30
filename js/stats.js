[Previous stats.js content with added event listener at the bottom]
// Add event listener for Load History button
document.addEventListener('DOMContentLoaded', () => {
    const loadHistoryBtn = document.getElementById('load-history-btn');
    if (loadHistoryBtn) {
        loadHistoryBtn.addEventListener('click', () => {
            console.log('Load History button clicked');
            loadUserHistory();
        });
    }
});