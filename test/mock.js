'use strict';

var EventEmitter = require('events').EventEmitter;

module.exports = {
    request: function(url, headers) {
        var req = new EventEmitter();
        req.headers = headers || {};
        req.url = url;
        req.setHeader = function(name, value) {
            this.headers[name] = value;
        };
        return req;
    },
    response: function() {
        return new EventEmitter();
    }
};
