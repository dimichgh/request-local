# CHANGELOG

## next

## v1.0.4
* Fixed: should not bind undefined/null functions/emitters

## v1.0.3
* Added patching of ES6 Promise to avoid context switch when accessing shared data source
* Added tests for asyncawait based on node-fibers

## v1.0.2
* Added child request local to parent if any exists to allow propagation of errors to the parent domain

## v1.0.1
* Wrapped domain.create method to preserve request context

## v1.0.0
* Removed namespace support
* Switched to process.domain to maintain context

## v0.1.13
* Fixed: should not double patch when multiple versions are installed

## v0.1.12
* Fixed: should not bind the same callback twice.

## v0.1.11
* Fixed: patched Q promis fails with "has no method 'runAfter'".

## v0.1.10
* Fixed: Should avoid conflicts of imposing a context from one request to the other when common data source is accessed via promise.
