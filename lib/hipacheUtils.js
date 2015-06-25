var redis = require('redis')
        , client = redis.createClient(process.env.REDIS_PORT || 6379, process.env.REDIS_HOST || '127.0.0.1')
        , async = require('async');

var tld = process.env.HIPACHE_TLD || '.merokuapps.dev';

module.exports = {
    registerAppListener: function(appname, url, cb) {
        var key = 'frontend:' + appname + tld;
        async.auto({
            verify: function(callback){
                client.exists(key, function(err, result){
                    console.log('Exists? ' + result);
                    callback(null, result);
                });
            },
            registerNew: ['verify', function(callback, results){
                    if (results['verify'] == 0) client.rpush(key, appname, function(err, res){
                        console.log('Did not exist');
                        callback(err, true);
                    });
                    else callback(null, true);
            }],
            addListener: ['registerNew', function(callback, results){
                    client.lset(key, 1, url, function(err, res){
                        if (err) client.rpush(key, url, function(e, r){
                            callback(e, r);
                        });
                        else callback(err, res);
                    });
            }]
            
        }, function(err, results){
            if (err) console.log(err);
            else console.log('Endpoint registered.');
            cb (err, appname + tld);            
        });
        
    }

};