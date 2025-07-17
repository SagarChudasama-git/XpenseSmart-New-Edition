// FAB button functionality with smooth transitions
document.addEventListener('DOMContentLoaded', function() {
    const fabButton = document.querySelector('.fab-button');
    const fab = document.querySelector('.fab');
    
    // Show FAB only on Record section (index.html)
    const currentPage = window.location.pathname.split('/').pop();
    if (fab) {
        if (currentPage === 'index.html' || currentPage === '' || currentPage === '/') {
            // Show FAB on Record section
            fab.style.display = 'block';
            fab.style.visibility = 'visible';
            fab.style.opacity = '1';
            fab.style.pointerEvents = 'auto';
            fab.classList.add('visible');
            
            // Force FAB to maintain its position
            ensureFabPosition(fab);
            
            // Use MutationObserver to ensure FAB position is maintained after any DOM changes
            const observer = new MutationObserver(function() {
                ensureFabPosition(fab);
            });
            
            // Observe the entire document for changes
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        } else {
            // Hide FAB on other sections - ensure it's completely hidden
            fab.style.display = 'none';
            fab.style.visibility = 'hidden';
            fab.style.opacity = '0';
            fab.style.pointerEvents = 'none';
            fab.classList.remove('visible');
        }
    }
    
    // Add event listener to hide FAB before any page navigation
    document.addEventListener('click', function(e) {
        // Check if the clicked element is a link that navigates to another page
        if (e.target.tagName === 'A' || e.target.closest('a')) {
            const link = e.target.tagName === 'A' ? e.target : e.target.closest('a');
            // Only process links that navigate to another page (not anchors or javascript:)
            if (link.href && !link.href.startsWith('javascript:') && !link.href.includes('#')) {
                if (fab) {
                    fab.style.display = 'none';
                    fab.style.visibility = 'hidden';
                    fab.style.opacity = '0';
                    fab.style.pointerEvents = 'none';
                }
            }
        }
    });
    
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
            
            // Hide FAB immediately before navigation
            if (fab) {
                fab.style.display = 'none';
                fab.style.visibility = 'hidden';
                fab.style.opacity = '0';
                fab.style.pointerEvents = 'none';
            }
            
            // Navigate immediately without animation
            window.location.href = 'add-entry.html';
        };
        
        // Add proper event listeners with correct options
        if (isTouchDevice) {
            fabButton.addEventListener('touchstart', handleFabClick, { passive: false });
        } else {
            fabButton.addEventListener('click', handleFabClick);
        }
    }
});

// Helper function to ensure FAB position
function ensureFabPosition(fab) {
    if (fab) {
        fab.style.position = 'fixed';
        fab.style.bottom = '85px';
        fab.style.right = '20px';
        fab.style.left = 'auto';
        fab.style.transform = 'none';
        fab.style.width = '56px';
        fab.style.height = '56px';
        fab.style.margin = '0';
        fab.style.padding = '0';
    }
}