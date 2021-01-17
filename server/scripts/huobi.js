const WebSocketClient = require('websocket').client;
const { ungzip } = require('node-gzip');

let prevBid, prevAsk;

const Huobi = (appConnection, arbitrage) => {
    const client = new WebSocketClient();

    client.on('connectFailed', function(error) {
        console.log('Connect Error: ' + error.toString());
    });
    
    client.on('connect', function(connection) {
        console.log('WebSocket Client Connected');

        const subscribe = {
            "sub": "market.btcusdt.bbo",
            "id": "id1"
          }

        connection.send(JSON.stringify(subscribe));

        connection.on('error', function(error) {
            console.log("Connection Error: " + error.toString());
        });
        connection.on('close', function() {
            console.log('echo-protocol Connection Closed');
        });
        connection.on('message', function(message) {
            ungzip(message.binaryData).then(data => {
                const parsedData = JSON.parse(data.toString());
                if (parsedData.ch === 'market.btcusdt.bbo') {
                    if (prevBid !== parsedData.tick.bid && prevAsk !== parsedData.tick.ask) {
                        prevBid = parsedData.best_bid;
                        prevAsk = parsedData.best_ask;
                        arbitrage.updatePrice(parsedData.tick.bid, parsedData.tick.ask, 'Huobi');
                        appConnection.sendUTF(JSON.stringify({
                            type: 'tick',
                            exchange: 'Huobi',
                            bid: parsedData.tick.bid,
                            ask: parsedData.tick.ask,
                        }));
                    }
                } else if (parsedData.ping) {
                    connection.send(JSON.stringify({ pong: parsedData.ping }))
                } else {
                    console.log('HUOBI:', parsedData);
                }
            }).catch(err => {
                console.error('HUOBI:', err);
            })
        });
    });

    client.connect('wss://api.huobi.pro/ws');
};

module.exports = Huobi;
