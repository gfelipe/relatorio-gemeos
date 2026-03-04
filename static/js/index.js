const newsImages = window.newsImages;
const babiesImages = window.babiesImages;
const mommyImages = window.mommyImages;
const nextStepsImages = window.nextStepsImages;

const images = [newsImages, babiesImages, mommyImages, nextStepsImages];
const sections = document.querySelectorAll('.section');

function isVideo(src) {
    return /\.(mp4|webm|ogg|mov)$/i.test(src);
}

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

// Preload images after page loads (skip videos)
window.addEventListener('load', () => {
    const allImages = [...newsImages, ...babiesImages, ...mommyImages].filter(src => !isVideo(src));
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

    const overlay = document.getElementById('imageOverlay');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            updateImage();
        });
    });
}

function closeOverlay() {
    const video = document.getElementById('overlayVideo');
    video.pause();
    video.src = '';

    document.getElementById('imageOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

function navigateImage(direction) {
    if (isImageLoading) return;

    currentImageIndex += direction;
    if (currentImageIndex < 0) currentImageIndex = currentImages.length - 1;
    if (currentImageIndex >= currentImages.length) currentImageIndex = 0;
    updateImage();
}

function updateImage() {
    if (isImageLoading) return;

    isImageLoading = true;
    const img = document.getElementById('overlayImage');
    const video = document.getElementById('overlayVideo');
    const spinner = document.getElementById('spinnerContainer');
    const newSrc = currentImages[currentImageIndex];

    // Update counter immediately
    document.getElementById('imageCounter').textContent = `${currentImageIndex + 1} / ${currentImages.length}`;

    // Disable navigation buttons
    document.getElementById('prevBtn').disabled = true;
    document.getElementById('nextBtn').disabled = true;

    video.pause();

    img.classList.add('loading');
    video.classList.add('loading');
    spinner.classList.add('active');

    setTimeout(() => {
        if (isVideo(newSrc)) {
            img.style.display = 'none';
            video.style.display = '';
            video.src = newSrc;
            video.load();
            video.oncanplay = () => finishImageLoad();
            video.onerror = () => {
                console.error('Failed to load video:', newSrc);
                finishImageLoad();
            };
        } else {
            video.style.display = 'none';
            img.style.display = '';

            if (preloadedImages[newSrc] && preloadedImages[newSrc].complete && preloadedImages[newSrc].naturalWidth > 0) {
                img.src = preloadedImages[newSrc].src;
                finishImageLoad();
            } else {
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
        }
    }, 50);
}

function finishImageLoad() {
    const img = document.getElementById('overlayImage');
    const video = document.getElementById('overlayVideo');
    const spinner = document.getElementById('spinnerContainer');

    requestAnimationFrame(() => {
        spinner.classList.remove('active');
        img.classList.remove('loading');
        video.classList.remove('loading');

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
