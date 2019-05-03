const express = require('express');
const utils = require('./utils');
const pass = require('./passport.js');

var router = express.Router();

router.use(pass);

router.post('/add_dm', add_dm);

function get_date() {
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth();
    var year = date.getFullYear();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    current_date = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

    return current_date;
}

function add_dm(request, response) {
    var message_body = request.body.message_body;
    var sender = request.user._id;
    var recipient = request.body.recipient_id;

    var db = utils.getDb();
    var ObjectId = utils.getObjectId();

    // generates ID-like for querying
    let users = [request.user._id.toString(), recipient].sort();

    db.collection('direct_message').insertOne({
        message_body: message_body,
        sender: sender,
        recipient: ObjectId(recipient),
        send_date: get_date(),
        users: users
    }, (err, result) => {
        if (err) {
            response.send('Unable to send direct message');
        }
        response.redirect(`/user/${recipient}`);
    });
}


module.exports = router;
