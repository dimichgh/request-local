'use strict';

var shimmer = require('shimmer');

module.exports.bindAll = function bindAll(func) {
    process.namespaces && Object.keys(process.namespaces).forEach(function (k) {
        var ns = process.namespaces[k];
        if (ns) {
            func = ns.bind(func);
        }
    });
    return func;
};

module.exports.bindEmitterAll = function bindEmitterAll(emitter) {
    process.namespaces && Object.keys(process.namespaces).forEach(function (k) {
        var ns = process.namespaces[k];
        if (ns) {
            ns.bindEmitter(emitter);
        }
    });
};

var wrapCallback;

if (!process.env.DISABLE_CLS_PATCH) {

    var m = require('module');
    var originalLoader = m._load;

    m._load = function(name, meta) {
        var mod = originalLoader.apply(m, arguments);

        switch(name) {
            case 'q':
                patchQ(mod);
                break;
            case 'bluebird':
                patchBluebird(mod);
                break;
            case './AsyncValue':
                if (meta && meta.id && meta.id.indexOf('raptor-async') !== -1) {
                    patchRaptorAsync(mod);
                }
            break;
        }

        return mod;
    };

}

function patchRaptorAsync(AsyncValue) {
    shimmer.wrap(AsyncValue.prototype, 'done', function nsWrapper(done) {
        return function nsDone(cb) {
            cb = exports.bindAll(cb);
            return done.call(this, cb);
        };
    });
}

function patchBluebird(Bluebird) {

    shimmer.wrap(Bluebird.prototype, '_then', function nsWrapper(_then) {
        return function nsAddCallbacks(didFulfill, didReject, didProgress) {
            var args = [].slice.call(arguments);
            if (typeof didFulfill === 'function') {
                args[0] = exports.bindAll(didFulfill);
            }
            if (typeof didReject === 'function') {
                args[1] = exports.bindAll(didReject);
            }
            if (typeof didProgress === 'function') {
                args[2] = exports.bindAll(didProgress);
            }
            return _then.apply(this, args);
        };
    });

}

function patchQ(Q) {
    var proto = Q && Q.makePromise && Q.makePromise.prototype;
    shimmer.wrap(proto, 'then', function (then) {
        return function nsThen(fulfilled, rejected, progressed) {
            if (typeof fulfilled === 'function') {
                fulfilled = exports.bindAll(fulfilled);
            }
            if (typeof rejected === 'function') {
                rejected = exports.bindAll(rejected);
            }
            if (typeof progressed === 'function') {
                progressed = exports.bindAll(progressed);
            }
            return then.call(this, fulfilled, rejected, progressed);
        };
    });

    shimmer.wrap(Q, 'nextTick', function (nextTick) {
        var wrapper = function nsNextTick(cb) {
            if (typeof cb === 'function') {
                cb = exports.bindAll(cb);
            }
            return nextTick.call(null, cb);
        };
        if (nextTick.runAfter) {
            wrapper.runAfter = nextTick.runAfter;
        }
        return wrapper;
    });
}
