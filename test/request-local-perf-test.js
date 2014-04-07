var request = require('request');
var should = require('should');
var local = require('../');
var create = require('../middleware').create;
var mock = require('./mock');
var _ = require('underscore');

describe('perf', function() {

	it('local', function(done) {
		var clocal;

		function middleware(next) {
			clocal.data.C = clocal.data.A + clocal.data.B;
			next();
		}
		function func1(next) {
			clocal.data.C = clocal.data.C + clocal.data.A + clocal.data.B;
			next();
		}
		function func2(next) {
			clocal.data.C = clocal.data.C + clocal.data.A + clocal.data.B;
			next();
		}

		clocal = local.create('custom').run(function(err, ctx) {
			ctx.A = 2;
			ctx.B = 4;

			var start = Date.now();
			for(var i = 0; i < 1000000; i++) {
				var ctx = {
					A: 2,
					B: 4
				};
				middleware(function(ctx) {
					func1(function(ctx) {
						func2(function(ctx) {

						});
					});
				});		
			}
			console.log('total: ', Date.now() - start);
			done();
		});
	});

	it('non-local', function(done) {
		function middleware(ctx, next) {
			ctx.C = ctx.A + ctx.B;
			next(ctx);
		}
		function func1(ctx, next) {
			ctx.C = ctx.C + ctx.A + ctx.B;
			next(ctx);
		}
		function func2(ctx, next) {
			ctx.C = ctx.C + ctx.A + ctx.B;
			next(ctx);
		}

		var start = Date.now();
		for(var i = 0; i < 1000000; i++) {
			var ctx = {
				A: 2,
				B: 4
			};
			middleware(ctx, function(ctx) {
				func1(ctx, function(ctx) {
					func2(ctx, function(ctx) {

					});
				});
			});		
		}
		console.log('total: ', Date.now() - start);
		done();
	});

	it('non-local', function(done) {
		function middleware(ctx, next) {
			ctx.C = ctx.A + ctx.B;
			next(ctx);
		}
		function func1(ctx, next) {
			ctx.C = ctx.C + ctx.A + ctx.B;
			next(ctx);
		}
		function func2(ctx, next) {
			ctx.C = ctx.C + ctx.A + ctx.B;
			next(ctx);
		}

		var start = Date.now();
		for(var i = 0; i < 1000000; i++) {
			var ctx = {
				A: 2,
				B: 4
			};
			middleware(ctx, function(ctx) {
				func1(ctx, function(ctx) {
					func2(ctx, function(ctx) {

					});
				});
			});		
		}
		console.log('total: ', Date.now() - start);
		done();
	});

});
