const WebSocketClient = require('websocket').client;

let prevBid, prevAsk;

const Binance = (appConnection, arbitrage) => {
    const client = new WebSocketClient();

    client.on('connectFailed', function(error) {
        console.log('Connect Error: ' + error.toString());
    });
    
    client.on('connect', function(connection) {
        console.log('WebSocket Client Connected');

        const subscribe = {
            "method": "SUBSCRIBE",
            "params": [
                "btcusdt@bookTicker"
            ],
            "id": 1
          }

        connection.send(JSON.stringify(subscribe));

        connection.on('error', function(error) {
            console.log("Connection Error: " + error.toString());
        });
        connection.on('close', function() {
            console.log('echo-protocol Connection Closed');
        });
        connection.on('message', function(message) {
            const parsedData = JSON.parse(message.utf8Data);
            if (!parsedData.b) {
                console.log('BINANCE:', parsedData);
            } else if (prevBid !== parsedData.b || prevAsk !== parsedData.a) {
                arbitrage.updatePrice(parsedData.b, parsedData.a, 'Binance');
                appConnection.sendUTF(JSON.stringify({
                    type: 'tick',
                    exchange: 'Binance',
                    bid: parsedData.b,
                    ask: parsedData.a,
                }));
            }
        });
    });

    client.connect('wss://stream.binance.com/ws');
};

module.exports = Binance;
