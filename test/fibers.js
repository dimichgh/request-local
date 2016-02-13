'use strict';

var RequestLocal = require('..');
var Promises = require('bluebird');

var Assert = require('assert');
var Async = require('async');

var async = require('asyncawait/async');
var await = require('asyncawait/await');

describe(__filename, function () {
    it('should not conflict two requests accessing the same data via promise, then(resolve)', function (done) {
        var cache;
        function getCommonData() {
            if (cache) {
                return cache;
            }

            var deferred = Promises.defer();

            setTimeout(function () {
                deferred.resolve('data');
            }, 100);

            return cache = deferred.promise;
        }

        function request(name, cb) {
            RequestLocal.run(function (err, ctx) {
                ctx.name = name;

                async(function () {
                    var val = await(getCommonData());
                    Assert.equal('data', val);

                    Assert.equal(name, RequestLocal.data.name);
                    return RequestLocal.data.name;
                })()
                .then(function (greetingName) {
                    Assert.equal(greetingName, RequestLocal.data.name);
                    Assert.equal(name, RequestLocal.data.name);
                    Assert.equal(name, greetingName);
                    cb(null, 'hello ' + RequestLocal.data.name);
                })
                .catch(cb);
            });

        }

        async.cps(await.bind(null, {
            John: request.bind(null, 'John'),
            Bob: request.bind(null, 'Bob')
        }))(function validate(err, greets) {
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

            var deferred = Promises.defer();

            setTimeout(function () {
                deferred.reject(new Error('Test error'));
            }, 100);

            return cache = deferred.promise;
        }

        function request(name, cb) {
            RequestLocal.run(function (err, ctx) {
                ctx.name = name;

                async(function () {
                    var val = await(getCommonData());
                    Assert.equal('data', val);

                    Assert.equal(name, RequestLocal.data.name);
                    return RequestLocal.data.name;
                })()
                .then(function (greetingName) {
                    cb(new Error('Should not happen'));
                })
                .catch(function (err) {
                    Assert.ok(err);
                    Assert.equal('Test error', err.message);
                    cb(null, 'hello ' + RequestLocal.data.name);
                });
            });

        }

        async.cps(await.bind(null, {
            John: request.bind(null, 'John'),
            Bob: request.bind(null, 'Bob')
        }))(function validate(err, greets) {
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
