const utils = require("./utils");
const promises = require("./promises");

async function openStream(user_id) {
    var db = utils.getDb();

    var user = await promises.userPromise(user_id);

    const collection = db.collection("messages");
    const thread_changeStream = collection.watch(
        [{ $match: 
            { $and: [
                { 'fullDocument.type': 'reply' },
                { 'fullDocument.thread_id': { $in: user.subscribed_threads }},
                { 'fullDocument.username': { $ne: user.username }}
            ]}
        }]
    );

    thread_changeStream.on('change', async change => {
        var item = {
            _id: change.fullDocument._id,
            thread_id: change.fullDocument.thread_id,
            message: change.fullDocument.message,
            read: false
        };

        await promises.updateUserPromise(user._id, item);
    });
}

async function closeStream(user_id) {
    var db = utils.getDb();

    var user = await promises.userPromise(user_id);

    const collection = db.collection("messages");

    const thread_changeStream = collection.watch(
        [{ $match: 
            { $and: [
                { 'fullDocument.type': 'reply' },
                { 'fullDocument.thread_id': { $in: user.subscribed_threads }},
                { 'fullDocument.username': { $ne: user.username }}
            ]}
        }]
    );
    thread_changeStream.close();
}

module.exports = {
    open: openStream,
    close: closeStream
};