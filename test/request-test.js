'use strict';

var assert = require('assert');
var request = require('request');
var requestLocal = require('..');

describe('request use-cases', function () {
    var server;


    it('timeout', function (done) {
        var counter = 0;
        requestLocal.run(function () {
            requestLocal.data.foo = 'bar';
            assert.equal('bar', requestLocal.data.foo);

            requestLocal.run(true, function () {

                requestLocal.data.qaz = 'qwe';
                assert.equal('bar', requestLocal.data.foo);
                assert.equal('qwe', requestLocal.data.qaz);

                request.get({
                    uri: 'http://128.0.0.1:8080',
                    timeout: 500
                }, requestLocal.bindAll(function (err) {
                    assert.ok(/TIMEDOUT$/.test(err.code));
                    assert.equal('bar', requestLocal.data.foo);
                    assert.equal('qwe', requestLocal.data.qaz);
                    // retry
                    process.nextTick(function () {
                        request({
                            uri: 'http://128.0.0.1:8080',
                            timeout: 500
                        }, requestLocal.bindAll(function (err) {
                            assert.ok(/TIMEDOUT$/.test(err.code));
                            assert.equal('bar', requestLocal.data.foo);
                            assert.equal('qwe', requestLocal.data.qaz);
                            done();
                        }));
                    });
                }));

            });
        });

    });

    it('CONNREFUSED', function (done) {
        requestLocal.run(function () {
            requestLocal.data.CONNREFUSED = '123';
            assert.equal('123', requestLocal.data.CONNREFUSED);

            request({
                uri: 'http://127.0.0.1:8080',
                timeout: 500
            }, requestLocal.bindAll(function (err, body, res) { // REFUSED
                assert.ok(err);
                assert.equal('ECONNREFUSED', err.code);
                assert.equal('123', requestLocal.data.CONNREFUSED);
                done();
            }));
        });
    });

});
