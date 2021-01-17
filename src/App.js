import './App.css';
import React, { useEffect, useState } from 'react';
import ExchangeTile from './componenets/ExchangeTile/ExchangeTile';
import Table from './componenets/Table/Table';

const connectionsList = require('./connections.json');

const tickers = Object.keys(connectionsList).reduce((acc, curr) => {
  acc[curr] = [];
  return acc;
}, {});

const App = () => {
  const [tickerData, setTickerData] = useState(tickers);
  const [arbitrageData, setArbitrageData] = useState([]);
  const ws = React.useRef(null);

  const messageHandler = (message) => {
    const messageData = JSON.parse(message.data);
    const dateTime = Date.now();
    const timestamp = Math.floor(dateTime / 1000);

    if (messageData.type === 'tick') {
      setTickerData(prev => {
        return {
        ...prev,
        [messageData.exchange]: [
          {
            bid: messageData.bid,
            ask: messageData.ask,
            timestamp,
          },
          ...prev[messageData.exchange].filter(trade => timestamp - trade.timestamp < 10)
        ]
      }})
    } else if (messageData.type === 'arbitrage') {
      const newElement = {
        col1: messageData.timestamp,
        col2: messageData.exchanges,
        col3: messageData.difference,
      };
      setArbitrageData(prev => {
        const isPresent = prev.find(play => play.col2 === messageData.exchanges);
        if (isPresent) {
          isPresent.difference = messageData.difference;
          return prev.sort((a, b) => a.col2 < b.col2);
        }
        return [ ...prev, newElement ].sort((a, b) => a.col2 < b.col2);
      });
    } else if (messageData.type === 'removeArbitrage') {
      setArbitrageData(prev => {
        return prev.filter(play => play.col2 !== messageData.exchanges);
      })
    }
  };

  useEffect(() => {
    ws.current = new WebSocket('ws://127.0.0.1:1337');
    ws.current.onopen = () => console.log('WebSocket Client Connected');
    ws.current.onclose = () => console.log('WebSocket Client Disconnected');
    ws.current.onmessage = (event) => messageHandler(event);
    ws.current.onmessage.bind(this)
  }, []);

  return (
    <div className="app">
      <div className="exchange-tiles">
        {Object.keys(tickerData).map((ticker, idx) => {
          return (
            <ExchangeTile title={ticker} tickerData={tickerData[ticker]} key={idx} />
          );
        })}
      </div>
      <div className="arbi-table">
        <Table data={arbitrageData} />
      </div>
    </div>
  );
}

export default App;
