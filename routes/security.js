module.exports = function initialize (params) {

    var redisClient = params.redis;
    
    module.authorize = function (req, res, next) {
        var challenge = req.get('Authorization');
        var user = req.get('user');

        redisClient.get('user_session_' + user, function (err, item) {
            if (item == challenge) {
                redisClient.get('key_' + user, function (err, item) {
                    if (item == 1) {
                        next();
                    } else {
                        res.status(404).send("UNAUTHORIZE");
                    }
                });
            }
            else res.status(404).send("UNAUTHORIZE");
        });
    }

    return module;
}