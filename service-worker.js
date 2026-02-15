// Zerox eSports Service Worker
// Enables offline functionality and app-like experience

const CACHE_NAME = 'zerox-esports-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/about.html',
    '/contact.html',
    '/careers.html',
    '/assets/css/main.css',
    '/assets/css/components.css',
    '/assets/css/animations.css',
    '/assets/css/logo-animations.css',
    '/assets/css/forms.css',
    '/assets/js/main.js',
    '/assets/images/logos/zerox-icon.jpg',
    '/assets/images/logos/zerox-shield.jpg',
    '/assets/images/logos/zerox-banner.jpg'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
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
                return fetch(event.request);
            }
            )
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
