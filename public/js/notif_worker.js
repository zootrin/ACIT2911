/* eslint-disable linebreak-style */
/* eslint-disable indent */
/* eslint-disable quotes */
const cacheName = "notifCache";
const cacheURLS = ["/images/reply.png", "/images/speech-bubble.png"];

self.addEventListener("install", event => {
    // Perform install steps
    event.waitUntil(
        caches
            .open(cacheName)
            .then(cache => {
                console.log("Opened cache");
                return cache.addAll(cacheURLS);
            })
            .catch(error => {
                console.log(error);
            })
    );
});

this

self.addEventListener("fetch", function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            // Cache hit - return response
            if (response) {
                console.log(response);
                return response;
            }
            console.log(event.request)
            return fetch(event.request);
        })
    );
});
