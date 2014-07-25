'use strict';

var request = require('request');
var should = require('should');
var local = require('../');
var create = require('../middleware').create;
var mock = require('./mock');
var _ = require('underscore');

var ns1 = local.create('custom1');
var ns2 = local.create('custom2');

describe('perf', function() {

	it('local', function(done) {

		function middleware(next) {
			ns1.data.C = ns1.data.A + ns1.data.B;
			next();
		}
		function func1(next) {
			ns1.data.C = ns1.data.C + ns1.data.A + ns1.data.B;
			next();
		}
		function func2(next) {
			ns1.data.C = ns1.data.C + ns1.data.A + ns1.data.B;
			next();
		}
		function test() {
			func1(function () {
				func2(function () {

				});
			});
		}

		ns1.run(function (err1, ctx1) {
			ns2.run(function (err2, ctx2) {
				ns1.data.A = 2;
				ns1.data.B = 4;
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
