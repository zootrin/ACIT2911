/* eslint-disable linebreak-style */
/* eslint-disable indent */
/* eslint-disable quotes */

if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
        navigator.serviceWorker.register("/js/notif_worker.js").then(
            function(registration) {
                // Registration was successful
                console.log(
                    "ServiceWorker registration successful with scope: ",
                    registration.scope
                );
            },
            function(err) {
                // registration failed :(
                console.log("ServiceWorker registration failed: ", err);
            }
        );
    });
}

if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function(result) {
        console.log(result);
    });
}