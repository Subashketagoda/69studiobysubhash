const CACHE_NAME = 'admin-cache-v1';
const ASSETS = [
    '/admin.html',
    '/admin-app.css',
    '/admin-app.js',
    '/admin-manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            // Ensure no old caches remain
            caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k))))
        ])
    );
});

// Fetch Event (Offline support)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// Push Notification Event
self.addEventListener('push', (event) => {
    let data = { title: 'New Appointment', body: 'Someone just booked an appointment at 69 Studio!' };
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = { title: 'New Lead!', body: event.data.text() };
        }
    }
    
    const options = {
        body: data.body,
        icon: 'logo.png.PNG',
        badge: 'logo.png.PNG',
        vibrate: [200, 100, 200, 100, 200, 100, 400],
        tag: 'appointment-alert',
        renotify: true,
        data: { url: '/admin.html' }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            if (clientList.length > 0) {
                return clientList[0].focus();
            }
            return clients.openWindow('/admin.html');
        })
    );
});
