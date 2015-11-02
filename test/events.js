'use strict';

var RequestLocal = require('..');

var Assert = require('assert');
var Async = require('async');
var EventEmitter = require('events').EventEmitter;

describe(__filename, function () {
    it('should not conflict two requests accessing the same data via promise', function (done) {
        var cache;
        function getCommonData(cb) {
            cb = RequestLocal.bindAll(cb);
            if (cache) {
                return cache.once('data', cb);
            }

            cache = new EventEmitter();
            cache.once('data', cb);
            setTimeout(function () {
                cache.emit('data', 'some data');
            }, 100);
        }

        function request(name, cb) {
            Async.series([
                function setup(next) {
                    RequestLocal.run(function (err, ctx) {
                        ctx.name = name;
                        next();
                    });
                },
                getCommonData,
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
