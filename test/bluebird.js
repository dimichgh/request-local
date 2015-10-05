'use strict';

var RequestLocal = require('..');

var Assert = require('assert');
var Async = require('async');
var Promises = require('bluebird');

describe(__filename, function () {
    it('should not conflict two requests accessing the same data via promise', function (done) {
        var cache;
        function getCommonData() {
            if (cache) {
                // return cache;
            }

            var deferred = Promises.defer();

            setTimeout(function () {
                deferred.resolve('data');
            }, 100);

            return cache = deferred.promise;
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
                    getCommonData().then(function (data) {
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
            Assert.equal('hello John', greets.John);
            Assert.equal('hello Bob', greets.Bob);
            done();
        });
    });

    it('should not conflict two requests accessing the same data via promise and get rejected', function (done) {
        var cache;
        function getCommonData() {
            if (cache) {
                // return cache;
            }

            var deferred = Promises.defer();

            setTimeout(function () {
                deferred.reject(new Error('Test error'));
            }, 100);

            return cache = deferred.promise;
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
                    getCommonData().catch(function (err) {
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
            Assert.equal('hello John', greets.John);
            Assert.equal('hello Bob', greets.Bob);
            done();
        });
    });
});
