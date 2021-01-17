const signalR = require('signalr-client');
const zlib = require('zlib');

const url = 'wss://socket-v3.bittrex.com/signalr';
const hub = ['c3'];

const Bittrex = (appConnection, arbitrage) => {
    var client;
    var resolveInvocationPromise = () => { };

    async function main() {
        client = await connect();
        await subscribe(client);
    }

    async function connect() {
        return new Promise((resolve) => {
            const client = new signalR.client(url, hub);
            client.serviceHandlers.messageReceived = messageReceived;
            client.serviceHandlers.connected = () => {
            console.log('Connected');
            return resolve(client)
        }
    });
    }

    async function subscribe(client) {
        const channels = [
                'heartbeat',
                'ticker_BTC-USD',
        ];
        const response = await invoke(client, 'subscribe', channels);

        for (var i = 0; i < channels.length; i++) {
            if (response[i]['Success']) {
                console.log('Subscription to "' + channels[i] + '" successful');
            }
            else {
                console.log('Subscription to "' + channels[i] + '" failed: ' + response[i]['ErrorCode']);
            }
        }
    }

    async function invoke(client, method, ...args) {
        return new Promise((resolve, reject) => {
            resolveInvocationPromise = resolve; // Promise will be resolved when response message received

            client.call(hub[0], method, ...args).done(function (err) {
                if (err) { 
                    return reject(err);
                }
            });
        });
    }

    function messageReceived(message) {
        const data = JSON.parse(message.utf8Data);
        if (data['R']) {
            resolveInvocationPromise(data.R);
        }
        else if (data['M']) {
            data.M.forEach(function (m) {
            if (m['A']) {
                if (m.A[0]) {
                const b64 = m.A[0];
                const raw = new Buffer.from(b64, 'base64');

                zlib.inflateRaw(raw, function (err, inflated) {
                    if (!err) {
                        const json = JSON.parse(inflated.toString('utf8'));
                        arbitrage.updatePrice(json.bidRate, json.askRate, 'Bittrex');
                        appConnection.sendUTF(JSON.stringify({
                            type: 'tick',
                            exchange: 'Bittrex',
                            bid: json.bidRate,
                            ask: json.askRate,
                        }));
                    } else {
                        console.error('BITTREX:', err);
                    }
                });
                }
                else if (m.M === 'heartbeat') {
                    // console.log('\u2661');
                }
            }
            });
        }
    }

    const _ = main();
};

module.exports = Bittrex;