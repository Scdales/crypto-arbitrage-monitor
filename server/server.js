const webSocketsServerPort = 1337;
const webSocketServer = require('websocket').server;
const http = require('http');

const Arbitrage = require('./scripts/arbitrage');
let arbitrage;

const Bittrex = require('./scripts/bittrex');
const Coinbase = require('./scripts/coinbase');
const Huobi = require('./scripts/huobi');
const Binance = require('./scripts/binance');

const server = http.createServer();
server.listen(webSocketsServerPort);

const wsServer = new webSocketServer({
    httpServer: server
});

const originIsAllowed = (origin) => {
    return true;
};

wsServer.on('request', function(request) {
    console.log((new Date()) + ' Recieved a new connection from origin ' + request.origin + '.');
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }
    const connection = request.accept(null, request.origin);

    arbitrage = new Arbitrage(connection);
    Bittrex(connection, arbitrage);
    Coinbase(connection, arbitrage);
    Huobi(connection, arbitrage);
    Binance(connection, arbitrage);

    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            console.log(JSON.parse(message.binaryData));
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

console.log('Websocket listening on port:', webSocketsServerPort);