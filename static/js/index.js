const babiesImages = [
    'static/2025-11/babies/IMG_7874.jpg',
    'static/2025-11/babies/IMG_7875.jpg'
];

const mommyImages = [
    'static/2025-11/mommy/IMG_7880.jpg'
];

let currentImages = [];
let currentImageIndex = 0;
let preloadedImages = {};

// Preload images after page loads
window.addEventListener('load', () => {
    const allImages = [...babiesImages, ...mommyImages];
    allImages.forEach(src => {
        const img = new Image();
        img.src = src;
        preloadedImages[src] = img;
    });
});

// Get all sections
const sections = document.querySelectorAll('.section');

// Add click event to 2nd section (index 1) for babies
sections[1].addEventListener('click', () => {
    openOverlay(babiesImages, 0);
});

// Add click event to 3rd section (index 2) for mommy
sections[2].addEventListener('click', () => {
    openOverlay(mommyImages, 0);
});

function openOverlay(imageArray, index) {
    currentImages = imageArray;
    currentImageIndex = index;
    updateImage();
    document.getElementById('imageOverlay').classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeOverlay() {
    document.getElementById('imageOverlay').classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

function navigateImage(direction) {
    currentImageIndex += direction;
    if (currentImageIndex < 0) currentImageIndex = currentImages.length - 1;
    if (currentImageIndex >= currentImages.length) currentImageIndex = 0;
    updateImage();
}

function updateImage() {
    const img = document.getElementById('overlayImage');
    const spinner = document.getElementById('imageSpinner');
    const newSrc = currentImages[currentImageIndex];

    // Show spinner and hide image
    spinner.classList.add('active');
    img.classList.add('loading');

    // Update counter
    document.getElementById('imageCounter').textContent = `${currentImageIndex + 1} / ${currentImages.length}`;

    // If image is preloaded, show it immediately
    if (preloadedImages[newSrc] && preloadedImages[newSrc].complete) {
        img.src = newSrc;
        spinner.classList.remove('active');
        img.classList.remove('loading');
    } else {
        // Load image with spinner
        img.onload = function() {
            spinner.classList.remove('active');
            img.classList.remove('loading');
        };
        img.src = newSrc;
    }

    // Update navigation buttons
    document.getElementById('prevBtn').disabled = false;
    document.getElementById('nextBtn').disabled = false;
}

// Close overlay when clicking outside the image
document.getElementById('imageOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'imageOverlay') {
        closeOverlay();
    }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('imageOverlay');
    if (overlay.classList.contains('active')) {
        if (e.key === 'Escape') closeOverlay();
        if (e.key === 'ArrowLeft') navigateImage(-1);
        if (e.key === 'ArrowRight') navigateImage(1);
    }
});
