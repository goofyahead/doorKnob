module.exports = function initialize (params) {

    var db = params.database;
    var ObjectId = require('mongodb').ObjectID;
    
    module.authorize = function (req, res, next) {
        var challenge = req.query.challenge;
        var user = req.query.user;

        redisClient.get('user_session_' + user, function (err, item) {
            if (item == challenge) {
                redisClient.get('key_' + user, function (err, item) {
                    if (item == 1) {
                        next();
                    } else {
                        res.send(403, {message : "UNAUTHORIZE, request access"});
                    }
                });
            }
            else res.send(403, {message : "UNAUTHORIZE, request access"});
        });
    }

    return module;
}