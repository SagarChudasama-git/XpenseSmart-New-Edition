// Loader management - Optimized for performance
document.addEventListener('DOMContentLoaded', function() {
    // Prevent content flash during page load but don't block rendering
    document.body.classList.add('loading');
    const pageContent = document.querySelector('.page-transition');
    if (pageContent) {
        pageContent.classList.remove('active');
    }
    
    // Use a pre-defined hidden loader instead of creating one dynamically
    const loaderContainer = document.getElementById('loader-container') || createLoader();
    
    // Show the loader immediately
    if (loaderContainer) {
        loaderContainer.style.display = 'flex';
        loaderContainer.style.opacity = '1';
    }
    
    // Use requestAnimationFrame for smoother rendering
    requestAnimationFrame(() => {
        // Hide loader faster - don't wait as long
        const hideLoaderTimeout = setTimeout(hideLoader, 800);
        
        // Hide loader when page is loaded
        window.addEventListener('load', function() {
            // Clear the timeout if the page loads before the timeout
            clearTimeout(hideLoaderTimeout);
            // Hide immediately on load
            requestAnimationFrame(hideLoader);
        });
    });
});

// Function to create loader (only called if needed)
function createLoader() {
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
    return loaderContainer;
}

// Function to show loader
function showLoader() {
    const loader = document.getElementById('loader-container') || createLoader();
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
        loader.style.transition = 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        
        // Use shorter timeout for a faster transition
        setTimeout(() => {
            loader.style.display = 'none';
            document.body.classList.remove('loading');
            document.body.style.overflow = 'auto';
            const pageContent = document.querySelector('.page-transition');
            if (pageContent) {
                pageContent.classList.add('active');
            }
        }, 300);
    }
}
