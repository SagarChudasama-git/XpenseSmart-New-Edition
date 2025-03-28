// FAB button functionality with smooth transitions
document.addEventListener('DOMContentLoaded', function() {
    const fabButton = document.querySelector('.fab-button');
    
    if (fabButton) {
        fabButton.addEventListener('click', function() {
            // Add fade-out effect to the body
            document.body.classList.add('fade-out');
            
            // Navigate to add-entry page after animation
            setTimeout(() => {
                window.location.href = 'add-entry.html';
            }, 300);
        });
    }
});