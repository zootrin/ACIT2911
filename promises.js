const utils = require('./utils.js');
const _ = require("lodash")

// Populates message board page with the titles of each 
// message in the database
var messagePromise = () => {
    return new Promise((resolve, reject) => {
        var db = utils.getDb();

        db.collection('messages').find({
            type: 'thread'
        }, {
            _id: 0
        }).toArray((err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result.reverse());
        });
    });
};

// Retrieves threads with keywords
var searchPromise = (param_keywords) => {
    return new Promise((resolve, reject) => {
        var db = utils.getDb();
        
        db.getCollection('direct_message').find({
            "message_body": {
                $regex: `.*${param_keywords}.*`
            }
        }).toArray((err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
};

// Retrieves thread details
var threadPromise = (param_id) => {
    return new Promise((resolve, reject) => {
        var db = utils.getDb();
        var ObjectId = utils.getObjectId();

        var query = {
            _id: ObjectId(param_id)
        };

        db.collection('messages').findOne(query, (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
};

// Retrieves all replies of a thread
var replyPromise = (param_id) => {
    return new Promise ((resolve, reject) => {
        var db = utils.getDb();

        db.collection('messages').find({
            thread_id: param_id
        }).toArray((err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
};

// Retrieves user details
var userPromise = (param_id) => {
    return new Promise ((resolve, reject) => {
        var db = utils.getDb();
        var ObjectId = utils.getObjectId();

        var query = {
            _id: ObjectId(param_id)
        };

        db.collection('users').findOne(query, (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
};

// Retrieves all threads of a user
var userthreadPromise = (param_username) => {
    return new Promise((resolve, reject) => {
        var db = utils.getDb();

        db.collection('messages').find({
            username: param_username,
            type: 'thread'
        }).toArray((err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
};

var getUserDMs = async param_id => {
    return new Promise((resolve, reject) => {
        try {
            let db = utils.getDb();
            let allDMs = {};

            let sentDMs = _.groupBy(await db
                .collection("direct_message")
                .find({
                    sender: param_id
                })
                .toArray(), 'recipient')
            let recievedDMs = _.groupBy(await db
                .collection("direct_message")
                .find({
                    recipient: param_id
                })
                .toArray(), 'sender')
            
            for (let key of sentDMs) {
                allDMs[key] += sentDMs[key]
            }
            for (let key of recievedDMs) {
                allDMs[key] += recievedDMs[key]
            }

            for (let key of allDMs) {
                allDMs[key] = allDMs[key].sort((prev, next) => {
                    if (prev < next) {
                        return -1
                    }
                    if (prev > next) {
                        return 1
                    }
                    return 0
                })
            }
            resolve(allDMs)
        } catch (err) {
            reject(err);
        }
    });
};

// Retrieves a list of all DMs of a user
var dmPromise = (param_id) => {
    return new Promise((resolve, reject) => {
        var db = utils.getDb();

        db.collection('direct_message').find({
            recipient: param_id
        }).toArray((err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
};

module.exports = {
    messagePromise: messagePromise,
    threadPromise: threadPromise,
    replyPromise: replyPromise,
    userPromise: userPromise,
    userthreadPromise: userthreadPromise,
    getUserDMs: getUserDMs,
    dmPromise: dmPromise,
    searchPromise: searchPromise
};