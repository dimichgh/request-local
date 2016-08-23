'use strict';

var Assert = require('assert');
var Domain = require('domain');
var RequestLocal = require('..');

describe(__filename, function () {
    before(function (next) {
        var domain = Domain.create();
        domain.run(next);
    });

    after(function () {
        while(process.domain) {
            process.domain.exit();
        }
    });

    it('should not bind undefined', function () {
        Assert.equal(undefined, RequestLocal.bindAll(undefined));
    });

    it('should not bind null', function () {
        Assert.equal(null, RequestLocal.bindAll(null));
    });

    it('should not bind undefined emitter', function () {
        Assert.equal(undefined, RequestLocal.bindEmitterAll(undefined));
    });

    it('should not bind null emitter', function () {
        Assert.equal(null, RequestLocal.bindEmitterAll(null));
    });

});
