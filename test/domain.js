'use strict';

var RequestLocal = require('..');
var Domain = require('domain');
var Assert = require('assert');

describe(__filename, function () {

    it('should create request context', function (next) {
        RequestLocal.run(function () {
            Assert.ok(process.domain._rlCtx);
            next();
        });
    });

    it('... should set context value', function (next) {
        RequestLocal.data.foo = 'bar';
        RequestLocal.data.qaz = 'qwe';
        Assert.equal('bar', process.domain._rlCtx.foo);
        Assert.equal('bar', RequestLocal.data.foo);
        Assert.equal('qwe', process.domain._rlCtx.qaz);
        Assert.equal('qwe', RequestLocal.data.qaz);
        next();
    });

    it('... should inherit from parent', function (next) {
        var domain = Domain.create();
        domain.run(function () {
            Assert.equal('bar', process.domain._rlCtx.foo);
            Assert.equal('bar', RequestLocal.data.foo);
            Assert.equal('qwe', process.domain._rlCtx.qaz);
            Assert.equal('qwe', RequestLocal.data.qaz);
            next();
        });
    });

    it('... should create child context while parent preserves its context values', function (next) {
        next = (function (counter, done) {
            return function () {
                counter--;
                if (counter <= 0) {
                    done();
                }
            };
        })(3, next);

        setTimeout(function outsideChild() {
            Assert.equal('bar', process.domain._rlCtx.foo);
            Assert.equal('bar', RequestLocal.data.foo);
            Assert.equal('qwe', process.domain._rlCtx.qaz);
            Assert.equal('qwe', RequestLocal.data.qaz);
            next();
        }, 100);

        RequestLocal.run(function () {
            Assert.equal(undefined, process.domain._rlCtx.foo);
            Assert.equal(undefined, RequestLocal.data.foo);
            Assert.equal(undefined, process.domain._rlCtx.qaz);
            Assert.equal(undefined, RequestLocal.data.qaz);
            next();
        });

        // parent values should be preserved
        try {
            Assert.equal('bar', process.domain._rlCtx.foo);
            Assert.equal('bar', RequestLocal.data.foo);
            Assert.equal('qwe', process.domain._rlCtx.qaz);
            Assert.equal('qwe', RequestLocal.data.qaz);
            next();
        }
        catch (err) {
            next(err);
        }
    });

    it('... should set/override some values', function (next) {
        RequestLocal.data.foo = 'zxc';
        Assert.equal('zxc', process.domain._rlCtx.foo);
        Assert.equal('zxc', RequestLocal.data.foo);
        // keep some from parent
        Assert.equal('qwe', process.domain._rlCtx.qaz);
        Assert.equal('qwe', RequestLocal.data.qaz);
        next();
    });

    it('... should exit main context', function (next) {
        process.domain.exit();
        Assert.ok(!process.domain);
        try {
            Assert.equal(undefined, RequestLocal.data.foo);
            next(new Error('Should have failed'));
        }
        catch (err) {
            next();
        }
    });

    describe('error catching use case', function () {
        var domain;
        var errorHandler;

        before(function (next) {
            domain = Domain.create();
            domain.on('error', function (err) {
                Assert.ok(errorHandler, 'Error handler should be set');
                errorHandler(err);
            });
            domain.run(next);
        });

        it('should create request context', function (next) {
            RequestLocal.run(function () {
                Assert.ok(process.domain._rlCtx);
                next();
            });
        });

        it('... should set context value ...', function (next) {
            RequestLocal.data.foo = 'bar';
            RequestLocal.data.qaz = 'qwe';
            Assert.equal('bar', process.domain._rlCtx.foo);
            Assert.equal('bar', RequestLocal.data.foo);
            Assert.equal('qwe', process.domain._rlCtx.qaz);
            Assert.equal('qwe', RequestLocal.data.qaz);
            next();
        });

        it('... should create another request context', function (next) {
            RequestLocal.run(function () {
                Assert.ok(process.domain._rlCtx);
                next();
            });
        });

        it('... should throw error', function (next) {
            errorHandler = function (err) {
                Assert.equal('Test error', err.message);
                Assert.equal(undefined, RequestLocal.data.foo);
                Assert.equal(undefined, RequestLocal.data.qaz);

                process.domain.exit();
                next();
            };

            setImmediate(function () {
                throw new Error('Test error');
            });
        });
    });

});
