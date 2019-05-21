const MongoClient = require("mongodb").MongoClient;
//const watcher = require("./changeStream");

var _dbUser = null;

var CONNECTION_URI =
    "mongodb+srv://example:asdfasdf@agiledevelopment-1ppyn.mongodb.net/test?retryWrites=true";
var DATABASE = "forumdb";

var getDb = () => {
    return _dbUser;
};

var getObjectId = () => {
    return require("mongodb").ObjectID;
};

var init = callback => {
    MongoClient.connect(
        CONNECTION_URI,
        { useNewUrlParser: true },
        (err, client) => {
            if (err) {
                return console.log("Unable to connect to DB");
            }
            _dbUser = client.db(DATABASE);
            console.log("Successfully connected to MongoDB server");
            openStream();
            reply_openStream();
            console.log("Opened changestreams");
        }
    );
};

//const promises = require("./promises");
//const request = require("request");
const fetch = require("node-fetch");
const webpush = require("web-push");

/*
const vapidKeys = {
    publicKey:
        "BKyb0KGvc8HKy4A-RDJJ0_tZKUiXMlVcmBBhYSEz9U08Nc0xAuvA6uWv7ANEyJm6o0voRItkHhz5y0X0bEAw4Wo",
    privateKey: "LUZkyfprh3w6EHFNL9RrTLCAjLNp7rnnGbj--h_JsWc"
};
*/
const vapidKeys = webpush.generateVAPIDKeys();

// TODO: CHANGE ENDPOINT BEFORE DEPLOY
var subEndpoint = "https://quiet-brook-91223.herokuapp.com/api/getsubscribe";
// var subEndpoint = "http://localhost:8080/api/getsubscribe";

// formats replies notifications
async function formatNotif(change, pushSubscription) {
    if (change.ns.coll === "messages") {
        let ObjectID = getObjectId();
        let query = {
            _id: ObjectID(change.fullDocument.thread_id)
        };

        let thread = await getDb()
            .collection("messages")
            .findOne(query);
        console.log(thread);

        let payload = {
            title: `${change.fullDocument.username} posted in ${thread.title}`,
            icon: "/images/reply.png",
            body: `${change.fullDocument.date}\n${change.fullDocument.message}`,
            tag: change.fullDocument.thread_id,
            url: `/thread/${change.fullDocument.thread_id}`,
            renotify: false
        };
        //console.log(JSON.stringify(payload));

        // let pushSubscription = await fetch(subEndpoint).then(response => {
        //     return response.json();
        // });
        // console.log(pushSubscription.body);

        let notification = {
            pushSubscription: pushSubscription,
            payload: JSON.stringify(payload)
        };
        //console.log(notification)

        return notification;
    }
}

// opens changestream for threads
async function openStream() {
    var db = getDb();

    //var user = await promises.userPromise(user_id);

    const collection = db.collection("messages");

    const thread_changeStream = collection.watch([
        {
            $match: {
                // $and: [
                //     { "fullDocument.type": "reply" },
                //     {
                //         "fullDocument.thread_id": {
                //             $in: user.subscribed_threads
                //         }
                //     } //,
                //     //{ "fullDocument.username": { $ne: user.username } }
                // ]
                "fullDocument.type": "reply"
            }
        }
    ]);

    thread_changeStream.on("change", async change => {
        var db = getDb();
        var query = {
            subscribed_threads: change.fullDocument.thread_id
        };

        let user_array = await db.collection("users").find(query).toArray();
        var filtered_user_array = user_array.filter(user => user.username != change.fullDocument.username);
        
        // console.log(change);

        // let pushSubscription = await fetch(subEndpoint).then(response => {
        //     return response.json();
        // });

        for (var i=0; i<filtered_user_array.length; i++) {

            let pushSubscription = filtered_user_array[i].endpoint;

            let notification = await formatNotif(
                change,
                pushSubscription
            );

            let pushed = await webpush
                .sendNotification(
                    notification.pushSubscription,
                    notification.payload,
                    {
                        vapidDetails: {
                            subject: "https://quiet-brook-91223.herokuapp.com/",
                            publicKey: vapidKeys.publicKey,
                            privateKey: vapidKeys.privateKey
                        },
                        TTL: 86400
                    }
                )
                .catch(err => {
                    if (err) {
                        return err;
                    }
                });

            console.log(`Push: ${pushed.statusCode}`);
            console.log(`Username: ${filtered_user_array[i].username}`);
        }

        //await promises.updateUserPromise(user._id, item);
    });
}

// closes thread stream notifications
async function closeStream(user_id) {
    var db = getDb();

    //var user = await promises.userPromise(user_id);

    const collection = db.collection("messages");

    const thread_changeStream = collection.watch([
        {
            $match: {
                $and: [
                    { "fullDocument.type": "reply" },
                    {
                        "fullDocument.thread_id": {
                            $in: user.subscribed_threads
                        }
                    } //,
                    //{ "fullDocument.username": { $ne: user.username } }
                ]
            }
        }
    ]);
    thread_changeStream.close();
}

async function dm_formatNotif(change, pushSubscription) {
    if (change.ns.coll === "direct_message") {
        let payload = {
            title: `${
                change.fullDocument.sender_username
            } sent you a direct message!`,
            icon: "/images/speech-bubble.png",
            body: `${change.fullDocument.send_date}\n${
                change.fullDocument.message_body
            }`,
            tag: change.fullDocument._id,
            url: `/dms?view=${change.fullDocument.sender}`,
            renotify: true
        };
        //console.log(JSON.stringify(payload));

        // let pushSubscription = await fetch(subEndpoint).then(response => {
        //     return response.json();
        // });
        //console.log(pushSubscription.body);

        let notification = {
            pushSubscription: pushSubscription,
            payload: JSON.stringify(payload)
        };
        //console.log(notification)

        return notification;
    }
}

// DMs, not reply
async function reply_openStream() {
    var db = getDb();

    const collection = db.collection("direct_message");

    // var query = [
    //     {
    //         $match: { "fullDocument.recipient": user_id }
    //     }
    // ];

    const dm_changeStream = collection.watch();

    dm_changeStream.on("change", async change => {
        let query = { _id: change.fullDocument.recipient };

        let recipient = await db.collection("users").findOne(query);

        let pushSubscription = recipient.endpoint;

        console.log(pushSubscription);

        // console.log(change);

        // let pushSubscription = await fetch(subEndpoint).then(response => {
        //     return response.json();
        // });
        // console.log(pushSubscription.body);

        let dm_notification = await dm_formatNotif(
            change,
            pushSubscription
        );

        let pushed = await webpush
            .sendNotification(
                dm_notification.pushSubscription,
                dm_notification.payload,
                {
                    vapidDetails: {
                        subject: "https://quiet-brook-91223.herokuapp.com/",
                        publicKey: vapidKeys.publicKey,
                        privateKey: vapidKeys.privateKey
                    },
                    TTL: 86400
                }
            )
            .catch(err => {
                if (err) {
                    return err;
                }
            });

        console.log(`Push: ${pushed.statusCode}`);
        console.log(`Username: ${recipient.username}`);
        
    });
}

module.exports = {
    getDb: getDb,
    getObjectId: getObjectId,
    init: init,
    vapidKeys: vapidKeys
};
