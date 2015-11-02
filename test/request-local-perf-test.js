'use strict';

var request = require('request');
var should = require('should');
var local = require('../');
var create = require('../middleware').create;
var mock = require('./mock');
var _ = require('underscore');

describe('perf', function() {

	it('local', function(done) {

		function middleware(next) {
			local.data.C = local.data.A + local.data.B;
			next();
		}
		function func1(next) {
			local.data.C = local.data.C + local.data.A + local.data.B;
			next();
		}
		function func2(next) {
			local.data.C = local.data.C + local.data.A + local.data.B;
			next();
		}
		function test() {
			func1(function () {
				func2(function () {

				});
			});
		}

		local.run(function (err1, ctx1) {
			local.run(function (err2, ctx2) {
				local.data.A = 2;
				local.data.B = 4;
				var start = Date.now();
				for(var i = 0; i < 1000000; i++) {
					middleware(test);
				}
				console.log('cls total: ', Date.now() - start);
				done();
			});
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


		var ctx = {
			A: 2,
			B: 4
		};

		var start = Date.now();
		for(var i = 0; i < 1000000; i++) {
			middleware(ctx, function test(ctx) {
				func1(ctx, function(ctx) {
					func2(ctx, function(ctx) {

					});
				});
			});
		}
		console.log('non-cls total: ', Date.now() - start);
		done();
	});

});
