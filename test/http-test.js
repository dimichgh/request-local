'use strict';

var assert = require('assert');
var http = require('http');
var requestLocal = require('..');
var createNamespace = require('continuation-local-storage').createNamespace;

var namespace = createNamespace('http');
var namespace2 = createNamespace('http2');

describe('http use-cases', function () {

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

            req.setTimeout(500, function() {
                req.abort();
                // now retry
                cb('TIMEDOUT');
            });

            req.on('error', function(e) {
            });

            // write data to request body
            req.write('data\n');
            req.end();            
        }

        var counter = 0;
        namespace2.run(function () {
            namespace2.set('ns2.val', 'val2');
            assert.equal('val2', namespace2.get('ns2.val'));

            namespace.run(function () {
                namespace.set('test.timeout', 0xabad1dea);
                assert.equal('val2', namespace2.get('ns2.val'));

                assert.equal(0xabad1dea, namespace.get('test.timeout'));
                assert.equal('val2', namespace2.get('ns2.val'));
                makeRequest('http://128.0.0.1:8080', function (err) {
                    assert.equal('TIMEDOUT', err);
                    assert.equal('val2', namespace2.get('ns2.val'));
                    assert.equal(0xabad1dea, namespace.get('test.timeout'));
                    // retry
                    process.nextTick(function () {
                        makeRequest('http://128.0.0.1:8080', function (err) {
                            assert.equal(0xabad1dea, namespace.get('test.timeout'));
                            assert.equal('val2', namespace2.get('ns2.val'));
                            assert.equal('TIMEDOUT', err);
                            done();
                        });
                    });
                });

            });      
        });
  
    });

    it('CONNREFUSED', function (done) {
        namespace.run(function () {
            namespace.set('test.CONNREFUSED', 0xabad1dea);

            assert.equal(0xabad1dea, namespace.get('test.CONNREFUSED'));
            var req = http.get('http://127.0.0.1:8080', function (res) { // REFUSED
                res.on('data', function (chunk) {
                });
                res.on('end', function () {
                    assert.equal(0xabad1dea, namespace.get('test.CONNREFUSED'));
                });
            });
            requestLocal.bindEmitterAll(req);

            req.setTimeout(500, function() {
                req.abort();
            });

            req.on('error', function(e) {
                assert.equal(0xabad1dea, namespace.get('test.CONNREFUSED'));
                done();
            });

            // write data to request body
            req.write('data\n');
            req.end();
        });        
    });

});