'use strict';

var assert = require('assert');
var http = require('http');
var createNamespace = require('continuation-local-storage').createNamespace;

var namespace = createNamespace('http');

describe('http use-cases', function () {

    it('timeout', function (done) {
        var counter = 0;
        namespace.run(function () {
            namespace.set('test.timeout', 0xabad1dea);

            assert.equal(0xabad1dea, namespace.get('test.timeout'));
            // var req = http.get('http://127.0.0.1:8080', function (res) { // REFUSED
            var req = http.get('http://128.0.0.1:8080', function (res) { // TIMEOUT
                res.on('data', function (chunk) {
                });
                res.on('end', function () {
                    assert.equal(0xabad1dea, namespace.get('test.timeout'));
                    done();
                });
            });

            req.setTimeout(500, function() {
                req.abort();
            });

            req.on('error', function(e) {
                assert.equal(0xabad1dea, namespace.get('test.timeout'));
                done();
            });

            // write data to request body
            req.write('data\n');
            req.end();
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