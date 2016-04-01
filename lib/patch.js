'use strict';

var shimmer = require('shimmer');

module.exports.bindAll = function bindAll(func) {
    return process.domain ? process.domain.bind(func) : func;
};

module.exports.bindEmitterAll = function bindEmitterAll(emitter) {
    process.domain ? process.domain.add(emitter) : emitter;
};

if (global.Promise) {
    Promise.prototype.then = (function (original) {
        return function _then() {
            var args = [].slice.call(arguments);
            args = args.map(function map(fn) {
                return module.exports.bindAll(fn);
            });
            return original.apply(this, args);
        };
    })(Promise.prototype.then);

    Promise.prototype.catch = (function (original) {
        return function _catch() {
            var args = [].slice.call(arguments);
            args = args.map(function map(fn) {
                return module.exports.bindAll(fn);
            });
            return original.apply(this, args);
        };
    })(Promise.prototype.catch);

}
