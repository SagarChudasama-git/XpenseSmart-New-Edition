// Loader management - Optimized for performance
document.addEventListener('DOMContentLoaded', function() {
    // Prevent content flash during page load
    document.body.style.overflow = 'hidden';
    const pageContent = document.querySelector('.page-transition');
    if (pageContent) {
        pageContent.classList.remove('active');
    }
    
    // Create loader container with optimized styles
    const loaderContainer = document.createElement('div');
    loaderContainer.id = 'loader-container';
    loaderContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        opacity: 1;
        transition: opacity 0.3s ease-out;
        will-change: opacity;
    `;

    // Add the dot spinner HTML
    loaderContainer.innerHTML = `
        <div class="dot-spinner">
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
        </div>
    `;

    // Add to document
    document.body.appendChild(loaderContainer);

    // Use a simpler approach to hide loader
    // This avoids the complex animation tracking that was causing lag
    const hideLoaderTimeout = setTimeout(hideLoader, 1500);

    // Hide loader when page is loaded
    window.addEventListener('load', function() {
        // Clear the timeout if the page loads before the timeout
        clearTimeout(hideLoaderTimeout);
        // Small delay to ensure UI is ready
        setTimeout(hideLoader, 300);
    });
});

// Function to show loader
function showLoader() {
    const loader = document.getElementById('loader-container');
    if (loader) {
        loader.style.display = 'flex';
        loader.style.opacity = '1';
    }
}

// Function to hide loader
function hideLoader() {
    const loader = document.getElementById('loader-container');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        setTimeout(() => {
            loader.style.display = 'none';
            document.body.style.overflow = 'auto';
            const pageContent = document.querySelector('.page-transition');
            if (pageContent) {
                pageContent.classList.add('active');
            }
        }, 400);
    }
}
