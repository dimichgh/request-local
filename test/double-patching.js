'use strict';

var Path = require('path');
var Shelljs = require('shelljs');

describe('description', function() {
    var cwd = process.cwd();

    before(function (done) {
        Shelljs.cd(Path.resolve(__dirname, 'fixtures/moda'));
        if (Shelljs.exec('npm install').code !== 0) {
            done(new Error('Failed to install module A'));
        }
        done();
    });

    after(function () {
        Shelljs.cd(cwd);
    });

    it('should not double load the same module patch', function () {
        require('./fixtures/moda');
    });
});
