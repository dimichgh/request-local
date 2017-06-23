'use strict';
var express = require('express');
var request = require('request');
var should = require('should');
var local = require('../');
var create = require('../middleware').create;
var mock = require('./mock');

describe('request-local, negative', function() {
    it('storoage is not yet setup, should fail', function(done) {

        (function (){
            local.get('A');
        }).should.throw();
        done();

    });

    describe('request-local', function() {

        var server;
        var app = express();
        app.use(create());
        // setting default context
        app.use(function(req, res, next) {
            local.data.An = 'a';
            local.data.Bn = { value: 'b'};
            local.data.Cn = 'c';
            next();
        });
        // setting custom sub-context
        app.use(function(req, res, next) {
            should.equal('a', local.data.An);
            should.equal('b', local.data.Bn.value);
            should.equal('c', local.data.Cn);
            next();
        });

        app.get('/normal', function(req, res) {
            var data = local.data;
            res.send('A:' + data.An +
                '\nB:' + JSON.stringify(data.Bn) +
                '\nC:' + data.Cn);
        });

        app.get('/error', function(req, res) {

            try {
                throw new Error('test error');
            }
            catch(err) {
                res.send('A:' + local.data.An +
                    '\nB:' + JSON.stringify(local.data.Bn) +
                    '\nC:' + local.data.Cn);
            }

        });

        before(function(done) {
            server = app.listen(7000, function() {
                done();
            });
        });

        after(function(done) {
            if (server) {
                server.close();
            }
            done();
        });

        it('normal test: context', function(done) {
            request('http://localhost:7000/normal', function(err, res, body) {
                if (err) {
                    done(err);
                    return;
                }
                body.should.include('A:a');
                body.should.include('B:{"value":"b"}');
                body.should.include('C:c');
                done();
            });
        });

        it('error test: context', function(done) {
            request('http://localhost:7000/error', function(err, res, body) {
                if (err) {
                    done(err);
                    return;
                }
                body.should.include('A:a');
                body.should.include('B:{"value":"b"}');
                body.should.include('C:c');
                done();
            });
        });

        it('simulation of multi-request env', function(done) {
            var counter = 0;
            function end() {
                counter++;
                if (counter === 3) {
                    done();
                }
            }

            var run = create();
            run(mock.request('url1'), mock.response(), function() {

                local.run(true, function(err, ctx) {
                    var req = local.data.request;
                    should.ok(req);
                    ctx.A = 'a';
                    should.ok(local.data.parent);

                    setTimeout(function() {
                        var req = local.data.request;
                        req.url.should.equal('url1');
                        local.data.A.should.equal('a');
                        should.ok(local.data.parent);
                        end();
                    }, 1500);
                });

                setTimeout(function() {
                    var req = local.data.request;
                    req.url.should.equal('url1');
                    should.ok(!local.data.A);
                    should.ok(!local.data.parent);
                    end();
                }, 1000);

                local.run(function(err, ctx) {
                    should.ok(!local.data.A);
                    should.ok(!local.data.request);
                    should.ok(!local.data.parent);
                    ctx.B = 'b';
                    setTimeout(function() {
                        should.ok(!local.data.request);
                        should.ok(!local.data.A);
                        should.ok(!local.data.parent);
                        local.data.B.should.equal('b');
                        end();
                    }, 500);
                });

            });
        });

        it('simulation of multi-request env based on middleware', function(done) {
            var counter = 0;
            function end() {
                counter++;
                if (counter === 3) {
                    done();
                }
            }
            var run = create();
            run(mock.request('url1'), mock.response(), function() {

                run(mock.request('url2'), mock.response(), function() {
                    setTimeout(function() {
                        var req = local.data.request;
                        req.url.should.equal('url2');
                        end();
                    }, 1500);
                });

                setTimeout(function() {
                    var req = local.data.request;
                    req.url.should.equal('url1');
                    end();
                }, 1000);

                run(mock.request('url3'), mock.response(), function() {
                    setTimeout(function() {
                        var req = local.data.request;
                        req.url.should.equal('url3');
                        end();
                    }, 500);
                });

            });
        });

    });

    describe('custom request local', function() {
        beforeEach(function () {
            while(process.domain) {
                process.domain.exit();
            }
        });

        it('simple test', function(done) {
            local.run(function() {
                local.data.foo = 'bar';
                should.equal('bar', local.data.foo);
                done();
            });
        });

        it('multiple locals', function(done) {
            (function() {var r = local.data.foo1;}).should.throw(/Local storage does not seem to have been initialized/);
            local.run(function() {
                local.data.foo1 = 'bar1';
                should.equal('bar1', local.data.foo1);

                local.run(true, function() {
                    should.ok(!local.data.foo2);
                    should.equal('bar1', local.data.foo1);
                    local.data.foo2 = 'bar2';
                    local.data.foo1 = 'bar1*';
                    should.equal('bar1*', local.data.foo1);
                    should.equal('bar2', local.data.foo2);

                    setTimeout(function () {
                        should.equal('bar2', local.data.foo2);
                        should.equal('bar1*', local.data.foo1);
                        done();
                    }, 70);

                });

                setTimeout(function () {
                    should.ok(!local.data.foo2);
                    should.equal('bar1', local.data.foo1);
                }, 50);

            });
        });

        it('local run method', function(done) {
            var rl = local.run(function(err, ctx) {
                ctx.foo = 'bar';
                should.equal('bar', ctx.foo);
                should.equal('bar', rl.data.foo);
                done();
            });
        });

        it('Samples', function(done) {
            var count = 0;
            var rl = local;
            function end() {
                count++;
                if (count === 3) {
                    done();
                }
            }
            rl.run(function(err, ctx) {
                rl.data.foo = 'bar';
                ctx.A = 'value';
                setTimeout(function() {
                    should.equal('bar', rl.data.foo); // should output 'bar'
                    should.equal('value', rl.data.A); // should output 'value'
                    end();
                }, 1000);
            });
            setTimeout(function() {
                (function() {console.log(rl.data.foo);}).should.throw(/Local storage does not seem to have been initialized/);
                (function() {console.log(rl.data.A);}).should.throw(/Local storage does not seem to have been initialized/);
                end();
            }, 1500);
            (function() {console.log(rl.data.foo);}).should.throw(/Local storage does not seem to have been initialized/);
            (function() {console.log(rl.data.A);}).should.throw(/Local storage does not seem to have been initialized/);
            end();
        });
    });
});
