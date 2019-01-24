'use strict';

var assert = require('assert');
var http = require('http');
var requestLocal = require('..');

describe('http use-cases', function () {
    let port;
    before(next => {
        const session = http.createServer((req, res) => {
        }).listen(0, () => {
            port = session.address().port;
            next();
        });
    });

    it('timeout', function (done) {
        function makeRequest(url, cb) {
            var req = http.get(url, function (res) { // TIMEOUT
                res.on('data', function (chunk) {
                });
                res.on('end', function () {
                    done(new Error('should have failed'));
                });
            });
            requestLocal.bindEmitterAll(req);

            req.on('error', function(e) {
                cb('TIMEDOUT');
            });

            // write data to request body
            setTimeout(function() {
                req.abort();
            }, 500);
        }

        var counter = 0;
        requestLocal.run(function () {
            requestLocal.data['ns2.val'] = 'val2';
            assert.equal('val2', requestLocal.data['ns2.val']);

            requestLocal.run(true, function () {
                requestLocal.data['test.timeout'] = 0xabad1dea;
                assert.equal('val2', requestLocal.data['ns2.val']);

                assert.equal(0xabad1dea, requestLocal.data['test.timeout']);
                assert.equal('val2', requestLocal.data['ns2.val']);
                makeRequest(`http://128.0.0.1:${port}`, function (err) {
                    assert.equal('TIMEDOUT', err);
                    assert.equal('val2', requestLocal.data['ns2.val']);
                    assert.equal(0xabad1dea, requestLocal.data['test.timeout']);
                    // retry
                    process.nextTick(function () {
                        makeRequest(`http://128.0.0.1:${port}`, function (err) {
                            assert.equal(0xabad1dea, requestLocal.data['test.timeout']);
                            assert.equal('val2', requestLocal.data['ns2.val']);
                            assert.equal('TIMEDOUT', err);
                            done();
                        });
                    });
                });

            });
        });

    });

    it('CONNREFUSED', function (done) {
        requestLocal.run(function () {
            var expected = 'some data';
            requestLocal.data['test.CONNREFUSED'] = expected;

            assert.equal(expected, requestLocal.data['test.CONNREFUSED']);
            var req = http.get('http://127.0.0.1:8088', function (res) { // REFUSED
                res.on('data', function (chunk) {
                });
                res.on('end', function () {
                    assert.equal(expected, requestLocal.data['test.CONNREFUSED']);
                });
            });
            requestLocal.bindEmitterAll(req);

            req.setTimeout(500, function() {
                req.abort();
            });

            req.on('error', function(e) {
                assert.equal(expected, requestLocal.data['test.CONNREFUSED']);
                done && done();
                done = undefined; // to avoid double error
            });

            // write data to request body
            req.write('data\n');
            req.end();
        });
    });

});
