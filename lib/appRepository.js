var redis = require('redis')
        , client = redis.createClient(process.env.REDIS_PORT || 6379, process.env.REDIS_HOST || '127.0.0.1')
        , async = require('async');

client.on('error', function(err) {
    console.log(err);
});

module.exports = {
    newApp: function(appname, info, environment, cb) {
        var ok = false;
        async.parallel({
            app: function(callback) {
                client.hmset('app:' + appname, info, function(err, obj) {
                    callback(err, obj);
                })
            },
            env: function(callback) {
                client.hmset('env:' + appname, environment, function(err, obj) {
                    callback(err, obj);
                })
            }
        }, function(err, results) {
            console.log("Result: " + results);
            if (err)
                console.log(err);
            else
                (ok = true);
            cb(err, ok);
        });
        return ok;
    },
    bumpVersion: function(appname, callback) {
        client.hincrby("app:" + appname, "version", 1, function(err, obj) {
            callback(err, obj);
        })
    },
    appInfo: function(appname, cb) {
        var appDetails, appEnvironment;
        async.series({
            app: function(callback) {
                client.hgetall("app:" + appname, function(err, obj) {
                    if (err)
                        callback(err);
                    else {
                        appDetails = obj;
                        callback(null);
                    }
                });
            },
            env: function(callback) {
                client.hgetall("env:" + appname, function(err, obj) {
                    if (err)
                        callback(err);
                    else {
                        appEnvironment = obj;
                        callback(null);
                    }
                })
            }
        }, function(err, results) {
            if (err)
                cb(err, null);
            else {
                cb(null, {info: appDetails, env: appEnvironment});
            }
        });

    }
}