'use strict';

var RequestLocal = require('..');

var Assert = require('assert');
var Async = require('async');

if (global.Promise) {
    describe(__filename, function () {

        it('should not conflict two requests accessing the same data via promise, then(resolve)', function (done) {
            var cache;
            function getCommonData() {
                if (cache) {
                    return cache;
                }

                return cache = new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        resolve('data');
                    }, 100);
                });
            }

            function request(name, cb) {
                Async.series([
                    function setup(next) {
                        RequestLocal.run(function (err, ctx) {
                            ctx.name = name;
                            next();
                        });
                    },
                    function data(next) {
                        getCommonData().then(next);
                    },
                ], function greet() {

                    cb(null, 'hello ' + RequestLocal.data.name);
                });
            }

            Async.parallel({
                John: request.bind(null, 'John'),
                Bob: request.bind(null, 'Bob')
            }, function validate(err, greets) {
                Assert.ok(!err, err && err.stack);
                try {
                    Assert.equal('hello John', greets.John);
                    Assert.equal('hello Bob', greets.Bob);
                }
                catch (e) {
                    return done(e);
                }
                done();
            });
        });

        it('should preserve context', function (done) {
            var cache;
            function getCommonData() {
                if (cache) {
                    return cache;
                }

                return cache = new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        resolve('data');
                    }, 100);
                });
            }

            function request(name, cb) {
                Async.series([
                    function setup(next) {
                        RequestLocal.run(function (err, ctx) {
                            ctx.name = name;
                            next();
                        });
                    },
                ], function greet() {

                    cb(null, 'hello ' + RequestLocal.data.name);
                });
            }

            Async.parallel({
                John: request.bind(null, 'John'),
                Bob: request.bind(null, 'Bob')
            }, function validate(err, greets) {
                Assert.ok(!err, err && err.stack);
                try {
                    Assert.equal('hello John', greets.John);
                    Assert.equal('hello Bob', greets.Bob);
                }
                catch (e) {
                    return done(e);
                }
                done();
            });
        });

        it('should not conflict two requests accessing the same data via promise and rejected in then', function (done) {
            var cache;
            function getCommonData() {
                if (cache) {
                    return cache;
                }

                return cache = new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        reject(new Error('Test error'));
                    }, 100);
                });
            }

            function request(name, cb) {
                Async.series([
                    function setup(next) {
                        RequestLocal.run(function (err, ctx) {
                            ctx.name = name;
                            next();
                        });
                    },
                    function data(next) {
                        getCommonData().then(function noop() {}, function (err) {
                            Assert.ok(err);
                            Assert.equal('Test error', err.message);
                            next();
                        }).catch(next);
                    },
                ], function greet() {
                    cb(null, 'hello ' + RequestLocal.data.name);
                });
            }

            Async.parallel({
                John: request.bind(null, 'John'),
                Bob: request.bind(null, 'Bob')
            }, function validate(err, greets) {
                Assert.ok(!err, err && err.stack);
                try {
                    Assert.equal('hello John', greets.John);
                    Assert.equal('hello Bob', greets.Bob);
                }
                catch (e) {
                    return done(e);
                }
                done();
            });
        });

        it('should not conflict two requests accessing the same data via promise and get rejected coming via catch function', function (done) {
            var cache;
            function getCommonData() {
                if (cache) {
                    return cache;
                }

                return cache = new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        reject(new Error('Test error'));
                    }, 100);
                });
            }

            function request(name, cb) {
                Async.series([
                    function setup(next) {
                        RequestLocal.run(function (err, ctx) {
                            ctx.name = name;
                            next();
                        });
                    },
                    function data(next) {
                        getCommonData()
                        .catch(function (err) {
                            Assert.ok(err);
                            Assert.equal('Test error', err.message);
                            next();
                        })
                        .then(function (data) {
                            next(new Error('Should not happen'));
                        });
                    },
                ], function greet() {
                    cb(null, 'hello ' + RequestLocal.data.name);
                });
            }

            Async.parallel({
                John: request.bind(null, 'John'),
                Bob: request.bind(null, 'Bob')
            }, function validate(err, greets) {
                Assert.ok(!err, err && err.stack);
                try {
                    Assert.equal('hello John', greets.John);
                    Assert.equal('hello Bob', greets.Bob);
                }
                catch (e) {
                    return done(e);
                }
                done();
            });
        });

        it('should not conflict two requests accessing the same data via promise and get rejected and trigger onReject in then', function (done) {
            var cache;
            function getCommonData() {
                if (cache) {
                    return cache;
                }

                return cache = new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        reject(new Error('Test error'));
                    }, 100);
                });
            }

            function request(name, cb) {
                Async.series([
                    function setup(next) {
                        RequestLocal.run(function (err, ctx) {
                            ctx.name = name;
                            next();
                        });
                    },
                    function data(next) {
                        getCommonData()
                        .then(function (data) {
                            next(new Error('Should not happen'));
                        }, function (err) {
                            Assert.ok(err);
                            Assert.equal('Test error', err.message);
                            next();
                        });
                    },
                ], function greet() {
                    cb(null, 'hello ' + RequestLocal.data.name);
                });
            }

            Async.parallel({
                John: request.bind(null, 'John'),
                Bob: request.bind(null, 'Bob')
            }, function validate(err, greets) {
                Assert.ok(!err, err && err.stack);
                try {
                    Assert.equal('hello John', greets.John);
                    Assert.equal('hello Bob', greets.Bob);
                }
                catch (e) {
                    return done(e);
                }
                done();
            });
        });
    });

}
