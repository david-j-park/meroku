var fs = require('fs-extra')
, util = require('util')
, async = require('async');

function log(buffer, level){
    level = level || 'INFO';
    console.log(level + ': ' + buffer.toString('utf8'));
}

module.exports = function(app, sourcePath, workDir, child){
    
    return {
        doBuild: function(cb){
            // prefer a local Dockerfile; fall back to standard
            var dockerFile = sourcePath + '/Dockerfile';
            
            if (!fs.existsSync(dockerFile)) {
                fs.copySync(workDir + '/Dockerfile', sourcePath + '/Dockerfile');
            }
            
            // execute docker build from command line
            log('*** Building docker image ***');
            
            var build = child.spawn('docker', ['build', '-f', dockerFile, '-t', util.format('%s/%s:%d',process.env.USER, app.info.name, app.info.version), sourcePath])
            , errs = [];

            build.on('error', function(err){
                log(err, "ERROR");
            })
            
            build.stdout.on('data', function(d){
                log(d);
            });
            
            build.stderr.on('data', function(d){
                errs.push(d);
                log(d, "ERROR");
            });
            
            build.on('close', function(code){
                if (code != 0) cb(errs, null);
                else cb(null, 'Build complete');
            })
        },
        runContainer: function(cb){
            var image = process.env.USER + '/' + app.info.name + ':' + app.info.version;
                        
            async.series([
                function(callback){
                    console.log('Stopping/removing existing container');
                    var rm = child.spawn('docker', ['rm', '-f', app.info.name]), errs = [];
                    
                    rm.stdout.on('data', function(d){
                        log(d);
                    });
                    
                    rm.on('error', function(d){
                        log(d, "ERROR");
                        errs.push(d);
                    })
                    
                    rm.stderr.on('data', function(d){
                        log(d, "ERROR");
                        errs.push(d);
                    })
                    
                    rm.on('close', function(code){
                        log('Old container stopped');
                        //TODO: make sure errs indicates that the container didn't exist
                        callback(null, 'stopped');
                    })
                },
                function(callback){
                    console.log('Building/running container.');
                    var run = child.spawn('docker', ['run', '--name', app.info.name, '-d', '-P', image]), errs = [];
                    
                    run.stdout.on('data', function(d){
                        log(d);
                    });
                    
                    run.stderr.on('data', function(d){
                        log(d, 'ERROR');
                        errs.push(d);
                    });
                    
                    run.on('close', function(code){
                        if(code !== 0) callback(errs, 'running');
                        else callback(null, 'running');
                    });
                    
                    run.on('error', function(d){
                        log(d, 'ERROR');
                        errs.push(d);
                    })
                },
                function(callback){
                    console.log('Getting port for http');
                    var ps = child.spawn('docker', ['port', app.info.name]), errs = [];
                    var output = "";
                    
                    ps.stdout.on('data', function(d){
                        log(d);
                        output += d.toString('utf8');
                    });
                    
                    ps.stderr.on('data', function(d){
                        log(d, 'ERROR');
                        errs.push(d);
                    });
                    
                    ps.on('error', function(d){
                        log(d, 'ERROR');
                        errs.push(d);
                    })
                    
                    ps.on('close', function(code){
                        if(code !== 0) callback(errs, null);
                        else {
                            var portre = /(\d{2,5})\/tcp -> .*:(\d{2,5})/;
                            var portInfo = output, httpPort;
                            var exposed = portInfo.split('/n');
                            exposed.forEach(function(val){
                                var match = portre.exec(val);
                                if ( match && match[1] == '8080') httpPort = match[2];
                            });
                            log('Running on port ' + httpPort);
                            callback(null, httpPort);
                        }
                    });
                }
            ], function(err, results){
                cb(err, results[2]);
            });
        }
    };
};