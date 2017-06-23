'use strict';

var shimmer = require('shimmer');

module.exports.bindAll = function bindAll(func) {
    if (func) {
        return process.domain ? process.domain.bind(func) : func;
    }
    return func;
};

module.exports.bindEmitterAll = function bindEmitterAll(emitter) {
    if (emitter) {
        process.domain ? process.domain.add(emitter) : emitter;
    }
    return emitter;
};

if (global.Promise) {
    Promise.prototype.then = (function (original) {
        return function _then(onResolve, onReject) {
            if (!arguments[0]) {
                return original.apply(this, arguments);
            }
            arguments[0] = module.exports.bindAll(arguments[0]);
            if (arguments[1]) {
                arguments[1] = module.exports.bindAll(arguments[1]);
            }
            return original.apply(this, arguments);
        };
    })(Promise.prototype.then);

    Promise.prototype.catch = (function (original) {
        return function _catch() {
            arguments[0] = module.exports.bindAll(arguments[0]);
            return original.apply(this, arguments);
        };
    })(Promise.prototype.catch);

}
