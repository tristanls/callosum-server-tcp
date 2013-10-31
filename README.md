# callosum-server-tcp

_Stability: 1 - [Experimental](https://github.com/tristanls/stability-index#stability-1---experimental)_

[![NPM version](https://badge.fury.io/js/callosum-server-tcp.png)](http://npmjs.org/package/callosum-server-tcp)

TCP Server for [Callosum](https://github.com/tristanls/callosum): a self-balancing distributed services protocol.

## Usage

```javascript
var CallosumServer = require('callosum-server-tcp');
var callosumServer = new CallosumServer({
    host: 'localhost',
    port: 4040
});

callosumServer.on('connection', function (conn) {
    // one of the active connections from clients that has been assigned a slot
    // do stuff with `conn` 
});

callosumServer.on('slot request', function (callback) {
    // assign a new slot
    var slot = /* pick lowest slot available (probably from a heap), ex: */ 0;
    return callback(null, slot); 
});

callosumServer.on('slot free', function (slot) {
    // free the slot
    // probably put it back on the heap 
});

callosumServer.listen(function () {
    console.log('server listening...'); 
});
```

## Tests

    npm test

## Overview

TCP Server for [Callosum](https://github.com/tristanls/callosum), which is an open-source implementation of [Indeed's Boxcar: A self-balancing distributed services protocol](http://engineering.indeed.com/blog/2012/12/boxcar-self-balancing-distributed-services-protocol/).

### Callosum TCP Server Protocol

When a new client connects to a TCP CallosumServer, the server will respond with the slot number assigned to the connection by sending a slot number followed by `\r\n`. For example, for slot `13`:

    13\r\n

This is all the information necessary for a client to either accept the slot, and keep the connection, or reject the slot by breaking the connection.

## Documentation

### CallosumServer

  * [CallosumServer.listen(options, \[callback\])](#callosumserverlistenoptions-callback)
  * [new CallosumServer(options)](#new-callosumserveroptions)
  * [callosumServer.close(\[callback\])](#callosumserverclosecallback)
  * [callosumServer.listen(\[callback\])](#callosumserverlistencallback)
  * [Event 'connection'](#event-connection)
  * [Event 'error'](#event-error)
  * [Event 'slot free'](#event-slot-free)
  * [Event 'slot request'](#event-slot-request)

### CallosumServer.listen(options, [callback])

  * `options`: See `new CallosumServer(options)` `options`.
  * `callback`: See `callosumServer.listen(callback)` `callback`.
  * Return: _Object_ An instance of CallosumServer with server running.

Creates a new CallosumServer and starts the server.

### new CallosumServer(options)

  * `options`: _Object_
    * `host`: _String_ _(Default: undefined)_ Hostname for the server to listen on. If not specified, the server will accept connections directed to any IPv4 address (`INADDR_ANY`).
    * `port`: _Integer_ _(Default: 4040)_ Port number for the server to listen on.

Creates a new CallosumServer instance.

### callosumServer.close([callback])

  * `callback`: _Function_ _(Default: undefined)_ `function () {}` Optional callback to call once the server is stopped.

Stops the server from accepting new connections.

### callosumServer.listen([callback])

  * `callback`: _Function_ _(Default: undefined)_ `function () {}` Optional callback to call once the server is up.

Starts the server to listen to new connections.

### Event `connection`

  * `function (connection) {}`
    * `connection`: _Socket object_ The connection object.

Emitted once the connection is assigned a new slot via a `callback` to the `slot request` event.

### Event `error`

  * `function (error) {}`
    * `error`: _Object_ An error that occurred.

Emitted when CallosumServer encounters an error. If no handler is registered, an exception will be thrown.

### Event `slot free`

  * `function (slot) {}`
    * `slot`: _Integer_ Slot number to free.

Emitted when the a connection with previously assigned `slot` is broken.

### Event `slot request`

  * `function (callback) {}`
    * `callback`: _Function_ `function (error, slot) {}` The callback to call with the next available slot number.

Emitted when a new connection from a client is made.

## Sources

  * [Boxcar: A self-balacing distributed services protocol](http://engineering.indeed.com/blog/2012/12/boxcar-self-balancing-distributed-services-protocol/)
  * [@IndeedEng: Boxcar: A self-balancing distributed services protocol](https://engineering.indeed.com/blog/2013/10/october30-indeedeng-talk/)