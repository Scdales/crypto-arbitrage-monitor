const WebSocketClient = require('websocket').client;

let prevBid, prevAsk;

const Coinbase = (appConnection, arbitrage) => {
    const client = new WebSocketClient();

    client.on('connectFailed', function(error) {
        console.log('Connect Error: ' + error.toString());
    });
    
    client.on('connect', function(connection) {
        console.log('WebSocket Client Connected');

        const subscribe = {
            "type": "subscribe",
            "channels": [
                {
                    "name": "ticker",
                    "product_ids": [
                        "BTC-USD"
                    ]
                }
            ]
        }

        connection.sendUTF(JSON.stringify(subscribe));

        connection.on('error', function(error) {
            console.log("Connection Error: " + error.toString());
        });
        connection.on('close', function() {
            console.log('echo-protocol Connection Closed');
        });
        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                const parsedData = JSON.parse(message.utf8Data);
                if (parsedData.type === 'ticker') {
                    if (prevBid !== parsedData.best_bid && prevAsk !== parsedData.best_ask) {
                        prevBid = parsedData.best_bid;
                        prevAsk = parsedData.best_ask;
                        arbitrage.updatePrice(parsedData.best_bid, parsedData.best_ask, 'Coinbase');
                        appConnection.sendUTF(JSON.stringify({
                            type: 'tick',
                            exchange: 'Coinbase',
                            bid: parsedData.best_bid,
                            ask: parsedData.best_ask,
                        }));
                    }
                }
                else {
                    console.log('COINBASE:', parsedData);
                }
            }
            else {
                console.log('COINBASE: Non utf8 data received:', message);
            }
        });
    });

    client.connect('wss://ws-feed.pro.coinbase.com');
};

module.exports = Coinbase;
