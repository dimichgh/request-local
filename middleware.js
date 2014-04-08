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

var local = require('./lib/request-local');

module.exports.create = function create() {
	// one can always create their own middleware with custom request-local
	return function requestLocal(req, res, next) {
		local.run(req, res, function(err, ctx) {
			if (err) {
				return next(err);
			}
			ctx.request = req;
			ctx.response = res;
			next();
		});
	};
};