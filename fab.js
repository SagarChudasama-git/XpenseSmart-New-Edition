// FAB button functionality with smooth transitions
document.addEventListener('DOMContentLoaded', function() {
    const fabButton = document.querySelector('.fab-button');
    
    if (fabButton) {
        // Add touchstart event listener for mobile devices
        fabButton.addEventListener('touchstart', handleFabClick, { passive: true });
        // Keep click event for desktop compatibility
        fabButton.addEventListener('click', handleFabClick);
        
        // Prevent ghost clicks by adding a small delay
        let lastTapTime = 0;
        function handleFabClick(e) {
            const currentTime = new Date().getTime();
            const tapDelay = currentTime - lastTapTime;
            
            // Prevent double triggers within 300ms
            if (tapDelay < 300 && tapDelay > 0) {
                e.preventDefault();
                return false;
            }
            
            lastTapTime = currentTime;
            
            // Add fade-out effect to the body
            document.body.classList.add('fade-out');
            
            // Navigate to add-entry page after animation
            setTimeout(() => {
                window.location.href = 'add-entry.html';
            }, 300);
        }
    }
});