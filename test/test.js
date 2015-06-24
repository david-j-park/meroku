var expect = require('chai').expect
, appRepository = require('../appRepository');

//mock childprocess object
var child = {};
child.exec = function(cmd, opts, cb){
    console.log(cmd);
    cb(null, cmd, null);
}

describe('Unit tests', function(){
   
    describe('App repository', function(){
        
        it('Should store a new app in Redis', function(done){
            appRepository.newApp('test', {a: 1, b: 2, version: 1}, {x: 3}, function(err, ok){
                expect(ok).to.equal(true);
                done();
            });
        });
        
        it('Should retrieve app details', function(done){
            appRepository.appInfo('test', function(err, obj){
                expect(obj.info.a).to.equal("1");
                expect(obj.env.x).to.equal("3");
                done();
            });
        });
        
        it('Should bump the app version up a notch', function(done){
            appRepository.bumpVersion('test', function(err, obj){
                expect(obj).to.equal(2);
                done();
            })
        })
        
        it('Should not retrieve non-existent app', function(done){
            appRepository.appInfo('faketest', function(err, obj){
                expect(obj.info).to.equal(null);
                done();
            })
        })
        
    });
    
    describe('Docker', function(){
        var docker;
        beforeEach(function(){
            docker = require('../docker')({
                info: {
                    name: 'test',
                    desc: 'This is a test',
                    version: 1
                },
                env: {
                    VAR: 'value'
                }
            }, '/tmp/file/src/path', '/tmp/file/path', child);
        });
        
        it('Should execute docker build', function(done){
            docker.doBuild(function(err, result){
                expect(err).to.equal(null);
                done();
            })
        });
        
        it('Should run a container', function(done){
            docker.runContainer(function(err, result){
                expect(err).to.equal(null);
                done();
            })
        })
        
    });
    
});