request-local
=====
The module provides middleware and API to store request context data.

It should not be used by any module directly, i.e. should not be defined as a direct dependeciy by any module, but as a peerDependencies. This is to prevent conflicts that may arise from using multiple versions of this module.
Every app should include it as a direct depdency.

NOTE: if you want to use the module in some other module, please use it in peerDependencies section, not dependencies.

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

// setting using custom namespace
require('request-local').namespace('MyNamespace').data.foo = 'bar';

// setting using custom namespace, shorter version
require('request-local').namespace('MyNamespace').foo = 'bar';

// getting from default namespace
console.log(require('request-local').data.foo);

// getting from custom namespace
console.log(require('request-local').namespace('MyNamespace').data.foo);

// getting from custom namespace, shorter version
console.log(require('request-local').namespace('MyNamespace').foo);

// by default request local stores only request and response and you can access it this way
console.log(require('request-local').request.url);
console.log(require('request-local').response.headers);
```

## Advanced usage:
Custom request local
```javascript
var local = require('request-local').create('MyRequestLocal');
require('request-local').run(local, function(err, ctx) {
	local.data.foo = 'bar';
	ctx.A = 'value';
	setTimeout(function() {
		console.log(local.data.foo); // should output 'bar'
		console.log(local.data.A); // should output 'value'
	}, 1000);
});
console.log(local.data.foo); // should throw error
console.log(local.data.A); // should throw error

// other way to run request local context
var localOther = require('request-local').create('MyRequestLocalOther');
localOther.run(function(err, ctx) {
	...
});

// bind request and response or any other event emitting objects to request local context
var requestLocal = require('request-local').create('MyRequestLocalOther');
requestLocal.run(req, res, new require('events').EventEmitter(), function(err, ctx) {
	...
});
```