'use strict';

/*
 * This is borowed from cls-q module and expanded till cls is fixed for the given use-cases below.
 */
var shimmer = require('shimmer');

// registered CLS names
var names = [];
// intercept all require calls that import 'q' module and patch them
var qModules = [];
var requestModules = [];

if (!process.env.DISABLE_CLS_PATCH) {

    var m = require('module');
    var originalLoader = m._load;
    m._load = function(name) {
        var mod = originalLoader.apply(m, arguments);

        if (name === 'q') {
            // remember it for patching
            interceptQ(mod);
        }
        else if (name === 'continuation-local-storage') {
            // remember it for patching
            interceptCls(mod);
        }
        
        return mod;
    };

    // now check for cls and q modules that are already loaded and hook to them
    for (var key in require.cache) {
        if (/q\/q\.js$/.test(key)) {
            interceptQ(require.cache[key].exports);
        }
        else if (/continuation-local-storage\/context\.js$/.test(key)) {
            interceptCls(require.cache[key].exports);
        }
    }
}

function interceptCls(cls) {
    var createNamespace = cls.createNamespace;
    cls.createNamespace = function (name) {
        var ns = createNamespace(name);
        names.push(ns);
        patchNS(ns);
        return ns;
    };
}

function interceptQ(q) {
    qModules.push(q);
    names.forEach(function (ns) {
        patchClsVsQ(ns, q);
    });
}

function patchNS(ns) {
    qModules.forEach(function (Q) {
        patchClsVsQ(ns, Q);
    });
    
    return ns;
}

function patchClsVsQ(ns, Q) {
    if (typeof ns.bind !== 'function') {
        throw new TypeError("must include namespace to patch Q against");
    }

    Q = Q || require('q');

    var proto = Q && Q.makePromise && Q.makePromise.prototype;
    shimmer.wrap(proto, 'then', function (then) {
        return function nsThen(fulfilled, rejected, progressed) {
            if (typeof fulfilled === 'function') {
                fulfilled = ns.bind(fulfilled);
            }
            if (typeof rejected === 'function') {
                rejected = ns.bind(rejected);
            }
            if (typeof progressed === 'function') {
                progressed = ns.bind(progressed);
            }
            return then.call(this, fulfilled, rejected, progressed);
        };
    });

    shimmer.wrap(Q, 'nextTick', function (nextTick) {
        return function nsNextTick(cb) {
            if (typeof cb === 'function') {
                cb = ns.bind(cb);
            }
            return nextTick.call(null, cb);
        };
    });
}

module.exports.bindAll = function bindAll(func) {
    names.forEach(function (ns) {
        func = ns.bind(func);
    });
    return func;
};

module.exports.bindEmitterAll = function bindEmitterAll(emitter) {
    names.forEach(function (ns) {
        ns.bindEmitter(emitter);
    });
};