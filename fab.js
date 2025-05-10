// FAB button functionality with smooth transitions
document.addEventListener('DOMContentLoaded', function() {
    const fabButton = document.querySelector('.fab-button');
    
    if (fabButton) {
        // Use a single event handler for both touch and click
        // with proper touch handling
        
        // Prevent ghost clicks by adding a small delay
        let lastTapTime = 0;
        let isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Pre-bind the event handler to avoid creation during event
        const handleFabClick = function(e) {
            // Prevent default behavior immediately for touch events
            if (e.type === 'touchstart') {
                e.preventDefault();
            }
            
            const currentTime = new Date().getTime();
            const tapDelay = currentTime - lastTapTime;
            
            // Prevent double triggers within 300ms
            if (tapDelay < 300 && tapDelay > 0) {
                return false;
            }
            
            lastTapTime = currentTime;
            
            // Add fade-out effect to the body
            document.body.classList.add('fade-out');
            
            // Navigate to add-entry page after animation
            setTimeout(() => {
                window.location.href = 'add-entry.html';
            }, 300);
        };
        
        // Add proper event listeners with correct options
        if (isTouchDevice) {
            fabButton.addEventListener('touchstart', handleFabClick, { passive: false });
        } else {
            fabButton.addEventListener('click', handleFabClick);
        }
    }
});