const utils = require("./utils");
const promises = require("./promises");

async function openStream() {
    var db = utils.getDb();

    var user = await promises.userPromise();

    console.log(user);

    const collection = db.collection("messages");
    const changeStream = collection.watch(
        [{ $match: 
            { $and: [
                { 'fullDocument.type': 'reply' }
                // { 'fullDocument.thread_id': { $in: user.subscribed_threads}}
            ]}
            
            // match thread_id is in users subscribed array
        }]
    );

    changeStream.on('change', async change => {
        var user_info = await promises.userthreadPromise();

        console.log(change);
    });

    // stream for new messages
    // match current user id is the recipient
}

function closeStream() {
    var db = utils.getDb();
    const collection = db.collection("messages");
    const changeStream = collection.watch(
        [{
            $match: {
                'fullDocument.type': 'reply'
            }
        }]
    );
    changeStream.close();
}

module.exports = {
    open: openStream,
    close: closeStream
};