const utils = require("./utils.js");
const _ = require("lodash");

// Populates message board page with the titles of each
// message in the database
var messagePromise = () => {
    return new Promise((resolve, reject) => {
        var db = utils.getDb();

        db.collection("messages")
            .find(
                {
                    type: "thread"
                },
                {
                    _id: 0
                }
            )
            .toArray((err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result.reverse());
            });
    });
};

// Retrieves threads with keywords
var searchPromise = param_keywords => {
    return new Promise((resolve, reject) => {
        var db = utils.getDb();

        db.getCollection("direct_message")
            .find({
                message_body: {
                    $regex: `.*${param_keywords}.*`
                }
            })
            .toArray((err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
    });
};

// Retrieves thread details
var threadPromise = param_id => {
    return new Promise((resolve, reject) => {
        var db = utils.getDb();
        var ObjectId = utils.getObjectId();

        var query = {
            _id: ObjectId(param_id)
        };

        db.collection("messages").findOne(query, (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
};

// Retrieves all replies of a thread
var replyPromise = param_id => {
    return new Promise((resolve, reject) => {
        var db = utils.getDb();

        db.collection("messages")
            .find({
                thread_id: param_id
            })
            .toArray((err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
    });
};

// Retrieves user details
var userPromise = param_id => {
    return new Promise((resolve, reject) => {
        var db = utils.getDb();
        var ObjectId = utils.getObjectId();

        var query = {
            _id: ObjectId(param_id)
        };

        db.collection("users").findOne(query, (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
};

// Retrieves all threads of a user
var userthreadPromise = param_username => {
    return new Promise((resolve, reject) => {
        var db = utils.getDb();

        db.collection("messages")
            .find({
                username: param_username,
                type: "thread"
            })
            .toArray((err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
    });
};

// Retrieves a list of all DMs of a user
var dmPromise = param_id => {
    return new Promise((resolve, reject) => {
        var db = utils.getDb();

        db.collection("direct_message")
            .find({
                // finds messages where user_id in users
                users: {
                    $in: [param_id]
                }
            })
            .toArray((err, result) => {
                if (err) {
                    reject(err);
                }

                // groups array elements into {otherUser_id:[messages]} objects
                let dmsByUsers = _.groupBy(
                    result.map(message => {
                        message.users = message.users.filter(user => {
                            user !== param_id;
                        });
                    }),
                    "users"
                );

                resolve(dmsByUsers);
            });
    });
};

module.exports = {
    messagePromise: messagePromise,
    threadPromise: threadPromise,
    replyPromise: replyPromise,
    userPromise: userPromise,
    userthreadPromise: userthreadPromise,
    dmPromise: dmPromise,
    searchPromise: searchPromise
};
