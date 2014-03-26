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
var ns = cls.createNamespace('DefaultNamespace');
var assert = require('assert');

module.exports = { 
    /*
     * Provide default/root namespace
     */
    get data() {
        var ctx = ns.get('base-ctx');
        assert.ok(ctx, 'Local storage does not seem to have been initialized, please make sure you use local storage middleware');
        return ctx;
    }
};

module.exports.namespace = function namespace(name) {
    var data = this.data;
    if (name) {
        data = data[name] || (function() {
        	var newData = {
        		get data() {
        			return this;
        		}
        	};
        	newData.request = data.request;
        	newData.response = data.response;
        	return data[name] = newData;
        })();
    }
    return data;
};

module.exports.create = function create() {
	return function create(req, res, next) {	    
	    ns.bindEmitter(req);
	    ns.bindEmitter(res);

	    ns.run(function () {
	        // always set a new instance of context to preserve 'stack'
	        // do not reuse existing
	        ns.set('base-ctx', {
	            request: req,
	            response: res
	        });
	        next();
	    });
	};
};