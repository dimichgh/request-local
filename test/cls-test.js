var assert = require('assert');

var nextTick = (function nextTick() {
	var task = null;
	function level1() {
		process.nextTick(task);
	}

	return function(t) {
		task = t;

		level1();
	}
})();
var rl = require('../').create('MyRequestLocal');
var q = require('q');

describe('cls test', function() {


	it('run', function(done) {
		function assertEqual(v1, v2) {
			if (v1 !== v2) {
				done(new Error(v1 + ' is not equal ' + v2));
			}
		}
		rl.run(function(err, ctx) {
			rl.data.A = 'a';
			assertEqual('a', rl.data.A);
			rl.data.A = 'b';
			q.nextTick(function() {

				assertEqual('b', rl.data.A);
				nextTick(function() {
			nextTick(function() {

				assertEqual('b', rl.data.A);
				nextTick(function() {
			nextTick(function() {

				assertEqual('b', rl.data.A);
				nextTick(function() {
			nextTick(function() {

				assertEqual('b', rl.data.A);
				q.nextTick(function() {
					try {
						assertEqual('b', rl.data.A);
						done();
					}
					catch(err) {
						done(err);
					}
				});

			});
				});

			});
				});

			});
				});

			});
		});

	});
});
