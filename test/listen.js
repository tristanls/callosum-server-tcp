/*

listen.js - callosumServer.listen() test

The MIT License (MIT)

Copyright (c) 2013 Tristan Slominski

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/

"use strict";

var net = require('net'),
    CallosumServer = require('../index.js');

var test = module.exports = {};

test['listen() starts a TCP server on localhost:4040 by default'] = function (test) {
    test.expect(1);
    var callosumServer = new CallosumServer();
    callosumServer.listen(function () {
        var client = net.connect({host: 'localhost', port: 4040}, function () {
            test.ok(true); // assert connection
            callosumServer.close(function () {
                test.done();
            });
        });
        client.on('error', function () {
            // catch test connection cut
        });
    });
};

test['listen() starts a TCP server on host:port from constructor options'] = function (test) {
    test.expect(1);
    var callosumServer = new CallosumServer({host: '127.0.0.1', port: 6744});
    callosumServer.listen(function () {
        var client = net.connect({host: '127.0.0.1', port: 6744}, function () {
            test.ok(true); // assert connection
            callosumServer.close(function () {
                test.done();
            });
        });
        client.on('error', function () {
            // catch test connection cut
        });
    });
};

test['listening server emits `slot request` when receiving a new connection'] = function (test) {
    test.expect(2);
    var callosumServer = new CallosumServer({host: 'localhost'});
    var client;
    callosumServer.on('slot request', function (callback) {
        test.ok(typeof callback === 'function');
        callback(undefined, 0);
        client.end();
        callosumServer.close(function () {
            test.done();
        });
    });
    callosumServer.listen(function () {
        client = net.connect({host: 'localhost', port: 4040}, function () {
            test.ok(true); // assert connection
        });
    });
};

test['listening server emits `connection` after associating it to assigned slot'] = function (test) {
    test.expect(4);
    var callosumServer = new CallosumServer({host: 'localhost'});
    var client;
    callosumServer.on('slot request', function (callback) {
        test.ok(typeof callback === 'function');
        callback(undefined, 0);
    });
    callosumServer.on('connection', function (connection) {
        test.ok(connection);
        test.equal(connection._slot, 0);
        client.end();
        callosumServer.close(function () {
            test.done();
        });
    });
    callosumServer.listen(function () {
        client = net.connect({host: 'localhost', port: 4040}, function () {
            test.ok(true); // assert connection
        });
    });
};

test['listening server emits `slot free` after a previous connection ends'] = function (test) {
    test.expect(5);
    var callosumServer = new CallosumServer({host: 'localhost'});
    var client;
    callosumServer.on('slot free', function (slot) {
        test.equal(slot, 171);
        callosumServer.close(function () {
            test.done();
        });        
    });
    callosumServer.on('slot request', function (callback) {
        test.ok(typeof callback === 'function');
        callback(undefined, 171);
    });
    callosumServer.on('connection', function (connection) {
        test.ok(connection);
        test.equal(connection._slot, 171);
        client.end();
    });
    callosumServer.listen(function () {
        client = net.connect({host: 'localhost', port: 4040}, function () {
            test.ok(true); // assert connection
        });
    });
};

test['listening server emits `slot free` after a previous connection errors'] = function (test) {
    test.expect(6);
    var callosumServer = new CallosumServer({host: 'localhost'});
    var client;
    callosumServer.on('slot free', function (slot) {
        test.equal(slot, 171);
        client.end();
        callosumServer.close(function () {
            test.done();
        });
    });
    callosumServer.on('slot request', function (callback) {
        test.ok(typeof callback === 'function');
        callback(undefined, 171);
    });
    callosumServer.on('connection', function (connection) {
        test.ok(connection);
        test.equal(connection._slot, 171);
        connection.emit('error', new Error("boom!"));
        test.strictEqual(connection._slot, undefined); // verify error cleared slot     
    });
    callosumServer.listen(function () {
        client = net.connect({host: 'localhost', port: 4040}, function () {
            test.ok(true); // assert connection
        });
    });
};

test['listening server responds to new connection with slot number and \\r\\n'] = function (test) {
    test.expect(2);
    var callosumServer = new CallosumServer({host: 'localhost'});
    callosumServer.on('slot request', function (callback) {
        callback(undefined, 13);
    });
    callosumServer.listen(function () {
        var client = net.connect({host: 'localhost', port: 4040}, function () {
            test.ok(true); // assert connection
        });
        client.on('data', function (chunk) {
            test.equal(chunk.toString('utf8'), '13\r\n');
            client.end();
            callosumServer.close(function () {
                test.done();
            });
        });
    });
};