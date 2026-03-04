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

// ── History Drawer ────────────────────────────────────

const EDITIONS = [
    { label: 'Fevereiro de 2026',       sub: '35 semanas',      href: 'index.html'           },
    { label: 'Janeiro de 2026',         sub: '31 semanas',      href: 'janeiro.html'         },
    { label: 'Dezembro de 2025',        sub: '26 semanas',      href: 'dezembro.html'        },
    { label: 'Dezembro de 2025 \u2728', sub: '22 semanas - Edição especial', href: 'dezembro-especial.html' },
    { label: 'Novembro de 2025',        sub: '20 semanas',      href: 'novembro.html'        },
    { label: 'Outubro de 2025',         sub: '16 semanas',      href: 'outubro.html'         },
];

(function buildHistoryDrawer() {
    const currentFile = location.pathname.split('/').pop() || 'index.html';

    // FAB
    const fab = document.createElement('button');
    fab.className = 'history-fab';
    fab.id = 'historyFab';
    fab.title = 'Edições anteriores';
    fab.innerHTML = '<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.95-2.05L6.63 18.37A8.955 8.955 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>';
    fab.addEventListener('click', toggleHistoryDrawer);

    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'history-backdrop';
    backdrop.id = 'historyBackdrop';
    backdrop.addEventListener('click', toggleHistoryDrawer);

    // Drawer
    const drawer = document.createElement('div');
    drawer.className = 'history-drawer';
    drawer.id = 'historyDrawer';

    const header = document.createElement('div');
    header.className = 'history-drawer-header';
    header.innerHTML = '<span>\uD83D\uDCC5 Edições Anteriores</span>';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'history-close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', toggleHistoryDrawer);
    header.appendChild(closeBtn);

    const list = document.createElement('ul');
    list.className = 'history-list';

    EDITIONS.forEach(({ label, sub, href }) => {
        const li = document.createElement('li');
        const isCurrent = href === currentFile;
        li.className = 'history-item' + (isCurrent ? ' history-item--current' : '');

        if (isCurrent) {
            li.innerHTML = '<span class="history-dot"></span>'
                + '<span class="history-label">' + label + ' <em>(atual)</em></span>';
        } else {
            const a = document.createElement('a');
            a.className = 'history-link';
            a.href = href;
            a.innerHTML = '<span class="history-dot"></span>'
                + '<span class="history-label">' + label + ' <small>' + sub + '</small></span>';
            li.appendChild(a);
        }
        list.appendChild(li);
    });

    drawer.appendChild(header);
    drawer.appendChild(list);
    document.body.appendChild(fab);
    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);
})();

function toggleHistoryDrawer() {
    const drawer = document.getElementById('historyDrawer');
    const backdrop = document.getElementById('historyBackdrop');
    const isOpen = drawer.classList.contains('active');
    drawer.classList.toggle('active', !isOpen);
    backdrop.classList.toggle('active', !isOpen);
}

