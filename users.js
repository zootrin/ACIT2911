const express = require("express");
var utils = require("./utils");
const passport = require('passport');

var router = express.Router();

router.post("/saveUser", saveUser);
router.post("/updateUser", updateUser);

module.exports = router;

function saveUser(request, response) {
    var email = request.body.email;
    var username = request.body.username;
    var password = request.body.password;

    var db = utils.getDb();

    var query = {
        $or: [{ email: email }, { username: username }]
    };

    db.collection("users")
        .find(query)
        .toArray((err, result) => {
            if (result.length > 0) {
                setTimeout(function() {
                    return response.redirect("/registration");
                }, 2500);
            } else if (result.length == 0) {
                db.collection("users").insertOne(
                    {
                        email: email,
                        username: username,
                        password: password,
                        settings: {
                            showEmail: false,
                            showName: false,
                            enableNotifs: false
                        }
                    },
                    (err, result) => {
                        if (err) {
                            response.send("Unable to register user");
                        }
                        response.redirect("/login");
                    }
                );
            }
        });
}

function updateUser(request, response) {
    let settings = {
        showEmail: Boolean(request.body.showEmail),
        showName: Boolean(request.body.showName),
        enableNotifs: Boolean(request.body.enableNotifs)
    };

    let db = utils.getDb();

    db.collection("users").findOneAndUpdate(
        { _id: request.user._id },
        {
            $set: {settings: settings}
        },
        (err, result) => {
            response.redirect(`/user/${request.user._id.toString()}`);
        }
    );
}
