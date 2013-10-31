/*

index.js - "callosum-server-tcp": TCP server for Callosum: a self-balancing 
                   distributed services protocol

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

var events = require('events'),
    net = require('net'),
    util = require('util');

/*
  * `options`: _Object_
    * `host`: _String_ _(Default: 'undefined')_ Host for the server to 
            listen on. If not specified, the server will accept connections 
            directed to any IPv4 address (`INADDR_ANY`).
    * `port`: _Integer_ _(Default: 4040)_ Port number for the server to listen on.
*/
var CallosumServer = module.exports = function CallosumServer (options) {
    var self = this;
    events.EventEmitter.call(self);
    
    options = options || {};

    self.host = options.host;
    self.port = options.port || 4040;

    self.server = null;
};

util.inherits(CallosumServer, events.EventEmitter);

/*
  * `options`: See `new CallosumServer(options)` `options`.
  * `callback`: See `callosumServer.listen(callback)` `callback`.
  * Return: _Object_ An instance of CallosumServer with server listening on host
          and port as specified in options or defaults.
*/        
CallosumServer.listen = function (options, callback) {
    var callosumServer = new CallosumServer(options);
    callosumServer.listen(callback);
    return callosumServer;
};

/*
  * `callback`: _Function_ _(Default: undefined)_ Optional callback to call once
      the server is stopped.
*/
CallosumServer.prototype.close = function close (callback) {
    var self = this;
    if (self.server)
        self.server.close(callback);
};

/*
  * `callback`: _Function_ _(Default: undefined)_ `function () {}` Optional 
          callback to call once the server is up.
*/
CallosumServer.prototype.listen = function listen (callback) {
    var self = this;

    self.server = net.createServer();
    self.server.on('connection', function (connection) {
        self.emit('slot request', function (error, slot) {
            connection._slot = slot;
            var message = "" + slot + "\r\n";
            connection.write(message);
            var freeAssignedSlot = function freeAssignedSlot () {
                if (connection._slot !== undefined) {
                    self.emit('slot free', connection._slot);
                    delete connection._slot;
                }
            };

            connection.on('close', freeAssignedSlot);
            connection.on('end', freeAssignedSlot);
            connection.on('error', freeAssignedSlot);
            self.emit('connection', connection);
        });
    });
    self.server.on('error', function (error) {
        self.emit('error', error);
    });
    self.server.listen(self.port, self.host, callback);
};