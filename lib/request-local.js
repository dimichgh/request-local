'use strict';
/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var patch = require('./patch');
var Domain = require('domain');
var assert = require('assert');

Domain.create = (function (original) {
    return function requestLocalCreateDomain() {
        var _domain = original.apply(Domain, arguments);
        // inherit parent context if any or create new one if root transaction
        _domain._rlCtx = process.domain && process.domain._rlCtx ?
            Object.create(process.domain._rlCtx) : {};
        return _domain;
    };
})(Domain.create);

Object.defineProperty(module.exports, 'data', {
    /*
     * Provide default/root namespace
     */
    get: function getMethod() {
        var ctx = process.domain ? process.domain._rlCtx : undefined;
        assert.ok(ctx, 'Local storage does not seem to have been initialized or in context, please make sure you use local storage middleware');
        return ctx;
    }
});

function isEventEmitter(obj) {
    return obj && obj.on && obj.emit;
}

/*
 * Create runtime request-local context.
 * @param requestLocal is a reference to request local object
 * @param emitter objects to bind local storage to
 * @param next is a callback function
 */
function runInternal(next) {
    var args = Array.prototype.slice.call(arguments);
    next = args.pop();

    var domain = Domain.create();
    // bind any other parameters passed
    for (var i = 0; i < args.length; i++) {
        domain.add(args[i]);
    }

    var parentDomain = process.domain;
    // hook to the parentDomain coontext for error dispatching if any
    // works in 0.12+
    // parentDomain && parentDomain.add(domain);

    // workaround for 0.10 to pipe error into parent domain
    domain.on('error', function domainError(err) {
        if (parentDomain) {
            return parentDomain.emit('error', err);
        }
        process.emit('uncaughtException', err);
    });

    domain.run(function () {
        // always set a new instance of context to preserve 'stack'
        // do not reuse existing
        var ctx = domain._rlCtx = {};
        process.nextTick(next.bind(null, null, ctx));
    });


}

/**
 * Create run in local context.
 * @param inherit is a flag that tells to inherit everything from parent context
 * @param next is callback within sub-local context
 */
module.exports.run = function run(inherit, /* emitter1, emitter2, ... ,*/ next) {
    var args = [].slice.call(arguments);
    inherit = args.length < 2 || isEventEmitter(inherit) ? null : args.shift();

    var parentCtx = inherit && process.domain._rlCtx || null;
    // remove next
    next = args.pop();
    // add callback
    args.push(function(err, ctx) {
        if (err) {
            next(err);
            return;
        }
        if (inherit) {
            Object.keys(parentCtx).forEach(function forEach(key) {
                ctx[key] = parentCtx[key];
            });
        }
        ctx.parent = parentCtx;
        next(err, ctx);
    });

    // make a call
    runInternal.apply(null, args);
    return this;
};

module.exports.bindAll = patch.bindAll;
module.exports.bindEmitterAll = patch.bindEmitterAll;
