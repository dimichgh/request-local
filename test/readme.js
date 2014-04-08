var assert = require('assert');

describe('readme sample', function() {

	it('run', function(done) {
		this.timeout(4000);
		var count = 0;
		function end() {
			if (++count === 2)
				done();
		}
		function assertEqual(v1, v2) {
			if (v1 !== v2) {
				done(new Error(v1 + ' is not equal ' + v2));
			}
		}
		var local = require('../').create('MyRequestLocal').run(function(err, ctx) {
			local.data.A = 'a';
			local.run(true, function(err, ctx) {
				assertEqual('a', local.data.A);
				local.data.A = 'b';
				setTimeout(function() {
					assertEqual('b', local.data.A);
					end();
				}, 2000);
			});
			setTimeout(function() {
				assertEqual('a', local.data.A);
				end();
			}, 1000);	
		});

	});
});
