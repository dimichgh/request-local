'use strict';
require('continuation-local-storage');
var assert = require('assert');

var rl = require('../');
var q = require('q');

describe('cls test', function() {


    it('run', function(done) {
        var counter = 0;
        function next() {
            counter++;
            counter === 6 && done();
        }
        function assertEqual(v1, v2) {
            if (v1 !== v2) {
                done(new Error(v1 + ' is not equal ' + v2));
            }
        }


        rl.run(function(err, ctx) {

        var deferred = q.defer();


            rl.data.A = 'a';
            assertEqual('a', rl.data.A);
            rl.data.A = 'b';
            assertEqual('b', rl.data.A);
            deferred.promise.then(function () {
                assertEqual('b', rl.data.A);
                next();
            });
            q.nextTick(function() {

                deferred.promise.then(function () {
                    assertEqual('b', rl.data.A);
                    next();
                });
                assertEqual('b', rl.data.A);
                process.nextTick(function() {
                    process.nextTick(function() {

                        assertEqual('b', rl.data.A);
                        process.nextTick(function() {
                            process.nextTick(function() {
                                deferred.promise.then(function () {
                                    assertEqual('b', rl.data.A);
                                    next();
                                });

                                assertEqual('b', rl.data.A);
                                process.nextTick(function() {
                                    process.nextTick(function() {
                                        deferred.promise.then(function () {
                                            assertEqual('b', rl.data.A);
                                            next();
                                        });
                                        assertEqual('b', rl.data.A);
                                        deferred.resolve();
                                        next();
                                    });
                                });

                            });
                        });

                    });
                });

            });

        deferred.promise.then(function() {
            assertEqual('b', rl.data.A);
            next();
        });

        });



    });
});
