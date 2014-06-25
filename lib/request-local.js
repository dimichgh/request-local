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
var cls = require('continuation-local-storage');
var assert = require('assert');

/*
 * Defines namespace class that allows on-the-fly resoluton to the current request local
 */
function Namespace(name, requestLocal) {
    this.requestLocal = requestLocal;
    this.name = name;
}

Namespace.prototype = {
    get data() {
        var self = this;
        var data = this.requestLocal.data;
        if (this.name) {
            data = data[self.name] || (function() {
                var newData = {
                    get data() {
                        return this;
                    }
                };
                // preserve references to request and response objects
                newData.request = data.request;
                newData.response = data.response;
                return data[self.name] = newData;
            })();
        }
        return data;
    }
};

function LocalStorage(name) {
    this.ns = cls.getNamespace(name) || cls.createNamespace(name);
}

LocalStorage.prototype = {
    /*
     * Provide default/root namespace
     */
    get data() {
        var ctx = this.ns.get('base-ctx');
        assert.ok(ctx, 'Local storage does not seem to have been initialized or in context, please make sure you use local storage middleware');
        return ctx;
    }    
};

/*
 * Access or create namespace if not existant
 */
LocalStorage.prototype.namespace = function namespace(name) {
    return new Namespace(name, this);
};

function isEventEmitter(obj) {
    return obj && obj.on && obj.emit;
}

/*
 * Create runtime request-local context.
 * @param requestLocal is a reference to request local object
 * @param emitter objects to bind local storage to
 * @param next is a callback function
 */
function runInternal(requestLocal, next) {
    var args = Array.prototype.slice.call(arguments);
    next = args.pop();
    requestLocal = args.shift(); // remove requestLocal reference

    // bind any other parameters passed
    for (var i = 0; i < args.length; i++) {
        requestLocal.ns.bindEmitter(args[i]);
    }

    requestLocal.ns.run(function () {
        // always set a new instance of context to preserve 'stack'
        // do not reuse existing
        var ctx = {};
        requestLocal.ns.set('base-ctx', ctx);
        process.nextTick(next.bind(null, null, ctx));
    });
}

/**
 * Create run in local context.
 * @param inherit is a flag that tells to inherit everything from parent context
 * @param next is callback within sub-local context
 */
LocalStorage.prototype.run = function run(inherit, /* emitter1, emitter2, ... ,*/ next) {
    var args = Array.prototype.slice.call(arguments);
    var inherit = args.length < 2 || isEventEmitter(inherit) ? null : args.shift();

    var parentCtx = inherit && this.data || null;
    // remove next
    var next = args.pop();
    // add this
    args.unshift(this);
    // add callback
    args.push(function(err, ctx) {
        if (err) {
            next(err);
            return;
        }
        if (inherit) {
            for (var key in parentCtx) {
                ctx[key] = parentCtx[key];
            }
        }
        ctx.parent = parentCtx;
        next(err, ctx);
    });

    // make a call
    runInternal.apply(null, args);
    return this;
};

module.exports = new LocalStorage('_default_request_local_');

/*
 * Create custom local storage
 */
module.exports.create = function create(name) {
    return new LocalStorage(name);
};
