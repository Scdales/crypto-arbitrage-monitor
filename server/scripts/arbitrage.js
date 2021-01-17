const BigNumber = require('bignumber.js');

class Arbitrage {
    constructor(connection) {
        this.connection = connection;
        this.exchanges = {
            Bittrex: {
                bid: new BigNumber(0),
                ask: new BigNumber(0),
            },
            Coinbase: {
                bid: new BigNumber(0),
                ask: new BigNumber(0),
            },
            Huobi: {
                bid: new BigNumber(0),
                ask: new BigNumber(0),
            },
            Binance: {
                bid: new BigNumber(0),
                ask: new BigNumber(0),
            },
        };
        this.arbitrages = {};
    };

    calculate(bid, ask, key) {
        const dateTime = Date.now();
        const timestamp = Math.floor(dateTime / 1000);
        Object.keys(this.exchanges).forEach(exchange => {
            if (key !== exchange &&
                !this.exchanges[exchange].bid.eq(0) &&
                !this.exchanges[exchange].ask.eq(0)) {
                
                // if there is arbitrage
                if (this.exchanges[exchange].bid.gt(ask)) {
                    const arbitrageKey = `${key} -> ${exchange}`;
                    const arbitrageDifference = this.exchanges[exchange].bid.minus(ask).toFixed();
                    if (!this.arbitrages[arbitrageKey] || this.arbitrages[arbitrageKey] !== arbitrageDifference) {
                        this.arbitrages[arbitrageKey] = arbitrageDifference;
                        const arbitrageMessage = {
                            type: 'arbitrage',
                            exchanges: arbitrageKey,
                            difference: arbitrageDifference,
                            timestamp,
                        };
                        this.connection.sendUTF(JSON.stringify(arbitrageMessage));
                    }
                } else if (ask.gt(this.exchanges[exchange].bid)) {
                    // if there isn't, and there previously was, send a remove message
                    const arbitrageKey = `${key} -> ${exchange}`;
                    if (this.arbitrages[arbitrageKey]) {
                        delete this.arbitrages[arbitrageKey];
                        const removeArbitrageMessage = {
                            type: 'removeArbitrage',
                            exchanges: arbitrageKey,
                            timestamp,
                        };
                        this.connection.sendUTF(JSON.stringify(removeArbitrageMessage));
                    }
                }

                // if there is arbitrage
                if (bid.gt(this.exchanges[exchange].ask)) {
                    const arbitrageKey = `${exchange} -> ${key}`;
                    const arbitrageDifference = bid.minus(this.exchanges[exchange].ask).toFixed();
                    if (!this.arbitrages[arbitrageKey] || this.arbitrages[arbitrageKey] !== arbitrageDifference) {
                        this.arbitrages[arbitrageKey] = arbitrageDifference;
                        const arbitrageMessage = {
                            type: 'arbitrage',
                            exchanges: arbitrageKey,
                            difference: arbitrageDifference,
                            timestamp,
                        };
                        this.connection.sendUTF(JSON.stringify(arbitrageMessage));
                    }
                } else if (this.exchanges[exchange].ask.gt(bid)){
                    // if there isn't, and there previously was, send a remove message
                    const arbitrageKey = `${exchange} -> ${key}`;
                    if (this.arbitrages[arbitrageKey]) {
                        delete this.arbitrages[arbitrageKey];
                        const removeArbitrageMessage = {
                            type: 'removeArbitrage',
                            exchanges: arbitrageKey,
                            timestamp,
                        };
                        this.connection.sendUTF(JSON.stringify(removeArbitrageMessage));
                    }
                }
            }
        });
    };

    updatePrice(bid, ask, key) {
        this.exchanges[key].bid =  new BigNumber(bid);
        this.exchanges[key].ask =  new BigNumber(ask);
        this.calculate(new BigNumber(bid), new BigNumber(ask), key);
    }

};

module.exports = Arbitrage;
