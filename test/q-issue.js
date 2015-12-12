'use strict';

var Q = require('q');
var Assert = require('assert');

describe.skip("Q security issue when accessing common data via promise", function () {
    var Domain = require("domain");

    var cache;
    function getCommonData(reject) {
        if (cache) {
            return cache;
        }

        var deferred = Q.defer();

        setTimeout(function () {
            if (reject) {
                return deferred.reject(new Error("test error"));
            }
            deferred.resolve("data");
        }, 100);

        cache = deferred.promise;
        return cache;
    }

    function setupContext(name, next) {
        var domain = Domain.create();
        domain.run(function () {
            domain.testName = name;

            next();
        });
    }

    function validate(expected, done) {
        try {
            Assert.equal(expected, process.domain.testName);
        }
        catch (err) {
            return done(err);
        }
        done();
    }

    function request(name, reject, done) {
        setupContext(name, function () {
            // now access common data
            getCommonData(reject).then(function () {
                // validate context
                validate(name, done);
            }, function (err) {
                validate(name, done);
            });
        });
    }

    function countDone(count, done) {
        return function _done(err) {
            if (err) {
                count = -1; // skip the rest
                return done(err);
            }
            count--;
            if (!count) {
                done();
            }
        };
    }

    it("one domain should not impose its domain context onto the other domain context via common promise, resolve", function (done) {
        cache = undefined;
        done = countDone(2, done);

        setImmediate(request.bind(null, "John", false, done));
        setImmediate(request.bind(null, "Bob", false, done));
    });

    it("one domain should not impose its domain context onto the other domain context via common promise, reject", function (done) {
        cache = undefined;
        done = countDone(2, done);

        setImmediate(request.bind(null, "John", true, done));
        setImmediate(request.bind(null, "Bob", true, done));
    });

});
