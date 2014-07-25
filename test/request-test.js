'use strict';

var assert = require('assert');
var request = require('request');
var requestLocal = require('..');
var createNamespace = require('continuation-local-storage').createNamespace;

var namespace = createNamespace('request1');
var namespace2 = createNamespace('request2');

describe('request use-cases', function () {
    var server;


    it('timeout', function (done) {
        var counter = 0;
        namespace2.run(function () {
            namespace2.set('ns2.val', 'val2');
            assert.equal('val2', namespace2.get('ns2.val'));

            namespace.run(function () {
                namespace.set('test.timeout', 0xabad1dea);
                assert.equal('val2', namespace2.get('ns2.val'));

                assert.equal(0xabad1dea, namespace.get('test.timeout'));
                assert.equal('val2', namespace2.get('ns2.val'));
                request.get({
                    uri: 'http://128.0.0.1:8080',
                    timeout: 500
                }, requestLocal.bindAll(function (err) {
                    assert.ok(/TIMEDOUT$/.test(err.code));
                    assert.equal('val2', namespace2.get('ns2.val'));
                    assert.equal(0xabad1dea, namespace.get('test.timeout'));
                    // retry
                    process.nextTick(function () {
                        request({
                            uri: 'http://128.0.0.1:8080',
                            timeout: 500
                        }, requestLocal.bindAll(function (err) {
                            assert.equal(0xabad1dea, namespace.get('test.timeout'));
                            assert.equal('val2', namespace2.get('ns2.val'));
                            assert.ok(/TIMEDOUT$/.test(err.code));
                            done();
                        }));
                    });
                }));

            });      
        });
  
    });

    it('CONNREFUSED', function (done) {
        namespace.run(function () {
            namespace.set('test.CONNREFUSED', 0xabad1dea);

            assert.equal(0xabad1dea, namespace.get('test.CONNREFUSED'));
            request({
                uri: 'http://127.0.0.1:8080',
                timeout: 500
            }, requestLocal.bindAll(function (err, body, res) { // REFUSED
                assert.ok(err);
                assert.equal('ECONNREFUSED', err.code);
                assert.equal(0xabad1dea, namespace.get('test.CONNREFUSED'));
                done();
            }));
        });        
    });

});