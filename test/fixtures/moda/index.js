'use strict';

var Assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var rl = require('./node_modules/request-local');
rl.bindAll(function () {});
rl.bindEmitterAll(new EventEmitter());
Assert.ok(!require('./node_modules/request-local/lib/patch')._patched, 'Should not be double patched');
