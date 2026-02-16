// Zerox eSports Service Worker
// Enables offline functionality and app-like experience

const CACHE_NAME = 'zerox-esports-v2';
const urlsToCache = [
    '/Zerox-eSports-/',
    '/Zerox-eSports-/index.html',
    '/Zerox-eSports-/about.html',
    '/Zerox-eSports-/contact.html',
    '/Zerox-eSports-/careers.html',
    '/Zerox-eSports-/login.html',
    '/Zerox-eSports-/dashboard.html',
    '/Zerox-eSports-/wallet.html',
    '/Zerox-eSports-/assets/css/main.css',
    '/Zerox-eSports-/assets/css/components.css',
    '/Zerox-eSports-/assets/css/animations.css',
    '/Zerox-eSports-/assets/css/logo-animations.css',
    '/Zerox-eSports-/assets/css/forms.css',
    '/Zerox-eSports-/assets/css/premium-championship.css',
    '/Zerox-eSports-/assets/js/main.js',
    '/Zerox-eSports-/assets/js/forms.js',
    '/Zerox-eSports-/assets/js/animations.js',
    '/Zerox-eSports-/assets/images/logos/zerox-icon.jpg',
    '/Zerox-eSports-/assets/images/logos/zerox-shield.jpg',
    '/Zerox-eSports-/assets/images/logos/zerox-banner.jpg'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Zerox SW: Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request).catch(() => {
                    // Fallback for offline navigation
                    if (event.request.mode === 'navigate') {
                        return caches.match('/Zerox-eSports-/index.html');
                    }
                });
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
