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
    document.getElementById('imageOverlay').classList.add('active');
    updateImage();
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
    beforeImageUpdate();
    const img = document.getElementById('overlayImage');
    img.src = ''; // Clear current image
    const spinner = document.getElementById('spinnerContainer');
    const newSrc = currentImages[currentImageIndex];

    // If image is preloaded, show it immediately
    if (preloadedImages[newSrc] && preloadedImages[newSrc].complete) {
        img.src = newSrc;
        spinner.classList.remove('active');
        img.classList.remove('loading');

        afterImageUpdate();
        return;
    }

    // Show spinner and hide image
    spinner.classList.add('active');
    img.classList.add('loading');

    img.onload = function() {
        spinner.classList.remove('active');
        img.classList.remove('loading');
        afterImageUpdate();
    };
    img.src = newSrc;
}

function beforeImageUpdate() {
    // Update counter
    document.getElementById('imageCounter').textContent = `${currentImageIndex + 1} / ${currentImages.length}`;

    document.getElementById('prevBtn').disabled = true;
    document.getElementById('nextBtn').disabled = true;
}
function afterImageUpdate() {
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
