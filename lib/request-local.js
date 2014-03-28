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
'use strict';
var cls = require('continuation-local-storage');
var assert = require('assert');

function LocalStorage(name) {
    this._ns = cls.createNamespace(name);    
}

LocalStorage.prototype = {
    /*
     * Provide default/root namespace
     */
    get data() {
        var ctx = this._ns.get('base-ctx');
        assert.ok(ctx, 'Local storage does not seem to have been initialized or in context, please make sure you use local storage middleware');
        return ctx;
    }    
};



/*
 * Creates request local storage used in middleware
 */
LocalStorage.prototype.run = function run(req, res, next) {    
    var self = this;   
    self._ns.bindEmitter(req);
    self._ns.bindEmitter(res);

    self._ns.run(function () {
        // always set a new instance of context to preserve 'stack'
        // do not reuse existing
        self._ns.set('base-ctx', {
            request: req,
            response: res
        });
        next();
    });
};

/*
 * Access or create namespace if not existant
 */
LocalStorage.prototype.namespace = function namespace(name) {
    var data = this.data;
    if (name) {
        data = data[name] || (function() {
            var newData = {
                get data() {
                    return this;
                }
            };
            // preserve references to request and response objects
            newData.request = data.request;
            newData.response = data.response;
            return data[name] = newData;
        })();
    }
    return data;
};

var requestLocal = module.exports = new LocalStorage('_default_request_local_');

/*
 * Create custom local storage
 */
module.exports.create = function create(name) {
    var local = new LocalStorage(name);
    var runInLocalCtx = module.exports.run.bind(null, local);
    local.run = function() {
        runInLocalCtx.apply(null, Array.prototype.slice.call(arguments));
        return local;
    };
    return local;
}

/*
 * Create runtime request-local context.
 * @param requestLocal is a reference to request local object
 * @param emitter objects to bind local storage to
 * @param next is a callback function
 */
module.exports.run = function run() {
    var args = Array.prototype.slice.call(arguments);
    var requestLocal = args.shift(); 
    var next = args.pop();
    // bind any other parameters passed
    for (var i = 0; i < args.length; i++) {
        requestLocal._ns.bindEmitter(args[i]);
    }

    requestLocal._ns.run(function () {
        // always set a new instance of context to preserve 'stack'
        // do not reuse existing
        var ctx = {};
        requestLocal._ns.set('base-ctx', ctx);
        process.nextTick(next.bind(null, null, ctx));
    });
};
