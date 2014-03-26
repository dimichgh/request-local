request-local
=====
The module provides middleware and API to store request context information.

It should not be used by any module directly, i.e. should not be defined as a direct dependeciy by any module, but as a peerDependencies. This is to prevent conflicts that may arise from using multiple versions of this module.
Every app should include it as a direct depdency.

NOTE: if you want to use module, please use it in peerDependencies section, not dependencies.

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
app.use(require('request-local').create());
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
```