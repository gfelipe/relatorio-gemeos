const newsImages = window.newsImages;
const babiesImages = window.babiesImages;
const mommyImages = window.mommyImages;
const nextStepsImages = window.nextStepsImages;

const images = [newsImages, babiesImages, mommyImages, nextStepsImages];
const sections = document.querySelectorAll('.section');

document.querySelectorAll('.image-badge').forEach((badge, idx) => {
    if (images[idx].length) {
        badge.classList.add('active');
        badge.children[1].innerHTML = `${images[idx].length} Fotos`;

        sections[idx].classList.add('has-image');
        sections[idx].addEventListener('click', () => {
            openOverlay(images[idx], 0);
        });
    }
});

let currentImages = [];
let currentImageIndex = 0;
let preloadedImages = {};
let isImageLoading = false;

// Preload images after page loads
window.addEventListener('load', () => {
    const allImages = [...babiesImages, ...mommyImages];
    for (const src of allImages) {
        const img = new Image();
        img.onload = () => {
            preloadedImages[src] = img;
        };
        img.onerror = () => {
            console.error('Failed to preload:', src);
        };
        img.src = src;
    }
});

function openOverlay(imageArray, index) {
    currentImages = imageArray;
    currentImageIndex = index;

    // Show overlay immediately
    const overlay = document.getElementById('imageOverlay');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Use requestAnimationFrame to ensure DOM is updated before loading image
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            updateImage();
        });
    });
}

function closeOverlay() {
    document.getElementById('imageOverlay').classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

function navigateImage(direction) {
    if (isImageLoading) return; // Prevent navigation while loading

    currentImageIndex += direction;
    if (currentImageIndex < 0) currentImageIndex = currentImages.length - 1;
    if (currentImageIndex >= currentImages.length) currentImageIndex = 0;
    updateImage();
}

function updateImage() {
    if (isImageLoading) return;

    isImageLoading = true;
    const img = document.getElementById('overlayImage');
    const spinner = document.getElementById('spinnerContainer');
    const newSrc = currentImages[currentImageIndex];

    // Update counter immediately
    document.getElementById('imageCounter').textContent = `${currentImageIndex + 1} / ${currentImages.length}`;

    // Disable navigation buttons
    document.getElementById('prevBtn').disabled = true;
    document.getElementById('nextBtn').disabled = true;

    // Show spinner and hide current image immediately
    img.classList.add('loading');
    spinner.classList.add('active');

    // Small delay to ensure spinner is visible on mobile
    setTimeout(() => {
        // Check if image is preloaded and ready
        if (preloadedImages[newSrc] && preloadedImages[newSrc].complete && preloadedImages[newSrc].naturalWidth > 0) {
            // Use preloaded image
            img.src = preloadedImages[newSrc].src;
            finishImageLoad();
        } else {
            // Load image fresh
            const tempImg = new Image();

            tempImg.onload = () => {
                img.src = tempImg.src;
                preloadedImages[newSrc] = tempImg;
                finishImageLoad();
            };

            tempImg.onerror = () => {
                console.error('Failed to load image:', newSrc);
                finishImageLoad();
            };

            tempImg.src = newSrc;
        }
    }, 50); // Small delay ensures spinner renders on mobile
}

function finishImageLoad() {
    const img = document.getElementById('overlayImage');
    const spinner = document.getElementById('spinnerContainer');

    // Use requestAnimationFrame for smooth transition
    requestAnimationFrame(() => {
        spinner.classList.remove('active');
        img.classList.remove('loading');

        // Enable navigation buttons
        document.getElementById('prevBtn').disabled = false;
        document.getElementById('nextBtn').disabled = false;

        isImageLoading = false;
    });
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
