/* eslint-disable linebreak-style */
/* eslint-disable indent */
/* eslint-disable quotes */

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

function subscribePush(registration) {
    

}

if ("serviceWorker" in navigator && "PushManager" in window) {
    window.addEventListener("load", registerWorker());
}

/*
if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function(result) {
        console.log(result);
    });
}
*/
