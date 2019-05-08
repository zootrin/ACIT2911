/* eslint-disable linebreak-style */
/* eslint-disable indent */
/* eslint-disable quotes */

const vapidKey = {
    publicKey:
        "BB578D2Rd51VtTYFdzPWrDk4w8QZqyBozw1nQG6_SnOcdtkljFuxWTENuQuUBeAooD4fHRVr5ivXyEKTtqkfC_I",
    privateKey: "EdEftJLnIcGhQth3bTS1rHp_FIDnVu75SNOw5L2F9z4"
};

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}


function registerWorker() {
    return navigator.serviceWorker
        .register("/js/notif_worker.js", { scope: "/" })
        .then(function(registration) {
            // Registration was successful
            console.log(
                "ServiceWorker registration successful with scope: ",
                registration.scope
            );

            /*
            registration.pushManager
                .getSubscription()
                .then(PushSubscription => {
                    if (PushSubscription) {
                        return console.log(PushSubscription.endpoint);
                    } else {
                        console.log("No push!")
                    }
                });
            */

            return registration;
        })
        .catch(err => {
            // registration failed
            console.log("ServiceWorker registration failed: ", err);
        });
}

if ("serviceWorker" in navigator && "PushManager" in window) {
    //window.addEventListener("load", registerWorker());
    if (navigator.serviceWorker.controller) {
        console.log("Working: ", navigator.serviceWorker.controller);
    } else {
        registerWorker();
    }
}

/*
if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function(result) {
        console.log(result);
    });
}
*/
