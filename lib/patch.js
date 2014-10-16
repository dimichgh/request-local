'use strict';

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