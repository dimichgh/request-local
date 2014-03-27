var express = require('express');
var request = require('request');
var should = require('should');
var local = require('../');
var create = require('../middleware').create;
var mock = require('./mock');

describe('request-local, negative', function() {
	it('storoage is not yet setup, should fail', function(done) {

		(function(){
			local.get('A');
		}).should.throw();
		done();

	});
});

describe('request-local', function() {

	var server;
	var app = express();
	app.use(create());
	// setting default context 
	app.use(function(req, res, next) {
		local.data.An = 'a';
		local.data.Bn = { value: 'b'};
		local.data['Cn'] = 'c';
		next();
	});
	// setting custom sub-context
	app.use(function(req, res, next) {
		var ns = local.namespace('TestCtx');
		should.equal(null, ns.A);
		ns.data.A ='a';
		// test other way of setting/accessing data
		ns.B = { value: 'b'};
		ns['C'] = 'c';
		next();
	});

	app.get('/normal', function(req, res) {
		var data = local.data;
		res.send('An:' + data.An + 
			'\nBn:' + JSON.stringify(data.Bn) +
			'\nCn:' + data['Cn']);
	});

	app.get('/normal-subctx', function(req, res) {
		var ns = local.namespace('TestCtx');
		res.send('A:' + ns.data.A + 
			'\nB:' + JSON.stringify(ns.B) +
			'\nC:' + ns['C']);
	});

	app.get('/error-subctx', function(req, res) {

		try {
			throw new Error('test error');
		}
		catch(err) {
			var ns = local.namespace('TestCtx');
			res.send('A:' + ns.A + 
				'\nB:' + JSON.stringify(ns.B) +
				'\nC:' + ns['C']);
		}

	});

	before(function(done) {
		server = app.listen(7000, function() {
			done();
		});
	});

	after(function(done) {
		if (server)
			server.close();
		done();
	});

	it('normal test: sub-context', function(done) {
		request('http://localhost:7000/normal-subctx', function(err, res, body) {
			if (err) {
				done(err);
				return;
			}
			body.should.include('A:a');
			body.should.include('B:{"value":"b"}');
			body.should.include('C:c');
			done();
		});
	});

	it('error test: sub-context', function(done) {
		request('http://localhost:7000/error-subctx', function(err, res, body) {
			if (err) {
				done(err);
				return;
			}
			body.should.include('A:a');
			body.should.include('B:{"value":"b"}');
			body.should.include('C:c');
			done();
		});
	});

	it('normal test', function(done) {
		request('http://localhost:7000/normal', function(err, res, body) {
			if (err) {
				done(err);
				return;
			}
			body.should.include('An:a');
			body.should.include('Bn:{"value":"b"}');
			body.should.include('Cn:c');
			done();
		});
	});

	it('simulation of multi-request env', function(done) {
		var counter = 0;
		function end() {
			counter++;
			if (counter === 3)
				done();
		}
		create()(mock.request('url1'), mock.response(), function() {

			create()(mock.request('url2'), mock.response(), function() {
				setTimeout(function() {
					var req = local.data.request;
					req.url.should.equal('url2');
					end();
				}, 1500);				
			});

			setTimeout(function() {
				var req = local.data.request;
				req.url.should.equal('url1');
				end();
			}, 1000);

			create()(mock.request('url3'), mock.response(), function() {
				setTimeout(function() {
					var req = local.data.request;
					req.url.should.equal('url3');
					end();
				}, 500);				
			});

		});
	});

});