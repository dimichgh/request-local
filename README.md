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

// getting from default namespace
console.log(require('request-local').data.foo);

// getting from custom namespace
console.log(require('request-local').namespace('MyNamespace').data.foo);

// by default request local stores only request and response and you can access it this way
console.log(require('request-local').request.url);
console.log(require('request-local').response.headers);
```

## Advanced usage:
Custom request local
```javascript
var local = require('request-local').create('MyRequestLocal');
local.run(local, function(err, ctx) {
	local.data.foo = 'bar';
	ctx.A = 'value';
	setTimeout(function() {
		console.log(local.data.foo); // should output 'bar'
		console.log(local.data.A); // should output 'value'
	}, 1000);
});
console.log(local.data.foo); // should throw error
console.log(local.data.A); // should throw error

// bind request and response or any other event emitting objects to request local context
var requestLocal = require('request-local').create('MyRequestLocalOther');
requestLocal.run(req, res, new require('events').EventEmitter(), function(err, ctx) {
	...
});
```

// create sub-local context
```javascript
var local = require('request-local').create('MyRequestLocal').run(function(err, ctx) {
	local.data.A = 'a';
	// run sub-context and inherit from parent
	local.run(true, function(err, ctx) {
		console.log(local.data.A);  // prints 'a'
		local.data.A = 'b';
		setTimeout(function() {
			console.log(local.data.A);  // prints 'b'
		}, 2000);
	});
	setTimeout(function() {
		console.log(local.data.A);  // prints 'a'
	}, 1000);	
});
```