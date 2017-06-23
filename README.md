request-local

![codecov](https://codecov.io/gh/dimichgh/request-local/branch/master/graph/badge.svg)](https://codecov.io/gh/dimichgh/request-local)
[![Build Status](https://travis-ci.org/dimichgh/request-local.svg?branch=master)](https://travis-ci.org/dimichgh/request-local) [![NPM](https://img.shields.io/npm/v/request-local.svg)](https://www.npmjs.com/package/request-local)
[![Downloads](https://img.shields.io/npm/dm/request-local.svg)](http://npm-stat.com/charts.html?package=request-local)
[![Known Vulnerabilities](https://snyk.io/test/github/dimichgh/request-local/badge.svg)](https://snyk.io/test/github/dimichgh/request-local)

The module provides middleware and API to store request context data.

It should not be used by any module directly, i.e. should not be defined as a direct dependency by any module, but as a peerDependencies. This is to prevent conflicts that may arise from using multiple versions of this module.
Every app should include it as a direct dependency.

NOTE: if you want to use the module in some other module, please use it in peerDependencies section, not dependencies.

Important: to make sure everything is patched before any other module is loaded, you need to put this as a first module require in your app entry point.

## Install

```
  npm install request-local --save
```
## Use
```
Module package.json:
    peerDependencies: {
    	"request-local": "~X.X.X"
	}

App package.json:
    dependencies: {
    	"request-local": "~X.X.X"
	}
```

## API

Middlware:
```javascript
app.use(require('request-local/middleware').create());
```

Set/getting attribute:
```javascript
// setitng using default namespace
require('request-local').data.foo = 'bar';

// getting from default namespace
console.log(require('request-local').data.foo);

// by default request local stores only request and response and you can access it this way
console.log(require('request-local').request.url);
console.log(require('request-local').response.headers);
```

## Special cases
Though domain is correctly handled by most of modules there is still some module or API like http, request. They may lose domain context in case of network error or other. In this case if you have callback or emitter that causes this, you can use the following API to bind context back:

* bindAll - binds callback function to all available contexts.
* bindEmitterAll - binds emitter to all available contexts.

The use of core http module:
```javascript
var requestLocal = require('request-local');
requestLocal.run(function (err, ctx) {
	ctx.myVar = 'val';
	var req = require('http').request('http://you/url', function (err, res) {
		console.log('the value is still there: ', requestLocal.data.myVar);
	});
	requestLocal.bindEmitterAll(req);

	req.setTimeout(function () {
		console.log('the value is still there: ', requestLocal.data.myVar);
		req.abort();
	});
	req.on('error', function (err) {
		console.log('the value is still there: ', requestLocal.data.myVar);
	});
	req.write('data');
	res.end();
});
```

Example of callback binding
```javascript
var requestLocal = require('request-local');
requestLocal.run(function (err, ctx) {
	ctx.myVar = 'val';
	require('request').get({
		uri: 'http://you/url',
		timeout: 900
	}, requestLocal.bindAll(function (err, res, body) {
		console.log('the value is still there: ', requestLocal.data.myVar);
	}));
});
```
