const port = process.env.PORT || 8080;

const express = require("express");
const bodyParser = require("body-parser");
const hbs = require("hbs");
const _ = require("lodash");

const utils = require("./utils.js");
const register = require("./users.js");
const pass = require("./passport.js");
const forum = require("./forum.js");
const promises = require("./promises.js");
const dms = require("./messaging.js");

const app = express();

var server = app.listen(port, () => {
    console.log(`Server is up on the port ${port}`);
    utils.init();
});

hbs.registerPartials(__dirname + "/views/partials");

app.use(function(req, res, next) {
    res.header("Service-Worker-Allowed", "/");
    next();
});

app.use(express.static(__dirname + "/public"));
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

hbs.registerHelper("port", () => {
    return port;
});

hbs.registerHelper("year", () => {
    return new Date().getFullYear();
});

app.use(pass);
app.use(register);
app.use(forum);
app.use(dms);

// CHECKS AUTHENTICATION
checkAuthentication = (request, response, next) => {
    if (request.isAuthenticated()) {
        return next();
    }
    response.redirect("/login");
};

checkAuthentication_false = (request, response, next) => {
    if (request.isAuthenticated() != true) {
        return next();
    }
    response.redirect("/");
};

// Login Page
app.get("/login", (request, response) => {
    response.render("login.hbs", {
        title: "Login",
        heading: "Log In"
    });
});

// Logout Page
app.get("/logout", (request, response) => {
    request.logout();
    request.session.destroy(() => {
        response.clearCookie("connect.sid");
        response.redirect("/");
    });
});

// Register Page
app.get("/registration", checkAuthentication_false, (request, response) => {
    response.render("registration.hbs", {
        title: "Registration",
        heading: "Make an Account"
    });
});

// Forum page
app.get("/", async (request, response) => {
    var messages = await promises.messagePromise();

    response.render("forum.hbs", {
        title: "Home",
        heading: "Message Board",
        message: messages
    });
});

// Search Thread Page
app.get("/search", async (request, response) => {
    if (request.query.keyword == "") {
        return;
    }

    var threads = await promises.searchPromise(request.query.keyword, "thread");
    var replies = await promises.searchPromise(request.query.keyword, "reply");

    var replies_thread_ids = Object.keys(_.groupBy(replies, "thread_id"));

    var exist_flag = false;

    for (i = 0; i < replies_thread_ids.length; i++) {
        for (j = 0; j < replies.length; j++) {
            if (replies[j]._id == replies_thread_ids[i]) {
                exist_flag = true;
                break;
            }
        }
        if (exist_flag != true) {
            var queried_thread = await promises.threadPromise(
                replies_thread_ids[i]
            );
            threads.push(queried_thread);
        }
        exist_flag = false;
    }

    response.render("forum.hbs", {
        title: "Search",
        heading: `Search: ${request.query.keyword}`,
        message: threads
    });
});

// Adding new post
app.get("/new_post", checkAuthentication, (request, response) => {
    response.render("new_post.hbs", {
        title: "Post",
        heading: "Add a post"
    });
});

// Dynamically generated endpoint for threads
app.get("/thread/:id", async (request, response) => {
    var thread = await promises.threadPromise(request.params.id);
    var replies = await promises.replyPromise(request.params.id);

    var isOP = false;
    if (request.user != undefined) {
        if (request.user.username == thread.username) {
            isOP = true;
        }
    }

    response.render("thread.hbs", {
        title: "Thread",
        heading: thread.title,
        op_message: thread.message,
        poster: thread.username,
        date: thread.date,
        id: thread._id,
        reply: replies,
        isOP: isOP,
        thread: thread
    });
});

// Dynamically generated endpoint for user profiles
app.get("/user/:id", async (request, response) => {
    var user = await promises.userPromise(request.params.id);
    var thread = await promises.userthreadPromise(user.username);
    let title = `${user.username}'s profile`;
    let displaySettings = false;
    let userSettings;

    if (request.user !== undefined) {
        console.log(request.user.settings);
        if (request.user._id.toString() === request.params.id) {
            title = "My Account";
            displaySettings = true;
            let updatedUser = await promises.userPromise(request.user._id);
            userSettings = updatedUser.settings;
        }
    }

    response.render("user.hbs", {
        title: title,
        heading: user.username,
        user_id: user._id,
        thread: thread,
        displaySettings: displaySettings,
        userSettings: userSettings
    });
});

// Send new direct message
app.get("/new_dm/:id", checkAuthentication, (request, response) => {
    response.render("new_dm.hbs", {
        title: "Direct Message",
        heading: "Send a direct message",
        recipient_id: request.params.id
    });
});

// Logged in user's DMs
app.get("/dms", checkAuthentication, async (request, response) => {
    var dms = await promises.dmPromise(request.user._id.toString());

    // TODO: remove console.log?
    console.log(dms);

    // groups array elements into {otherUser_id:[messages]} objects
    let dmsByUsers = _.groupBy(
        dms.map(message => {
            message.users = message.users.filter(user => {
                return user !== request.user._id.toString();
            })[0];
            return message;
        }),
        "users"
    );

    // TODO: dmsByUsers isn't being used?
    console.log(dmsByUsers);

    response.render("dms.hbs", {
        title: "DM Inbox",
        heading: "Direct Message Inbox",
        dms: dms
    });
});

exports.closeServer = function() {
    server.close();
};

module.exports = server;