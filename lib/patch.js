'use strict';

var shimmer = require('shimmer');

module.exports.bindAll = function bindAll(func) {
    return process.domain ? process.domain.bind(func) : func;
};

module.exports.bindEmitterAll = function bindEmitterAll(emitter) {
    process.domain ? process.domain.add(emitter) : emitter;
};
