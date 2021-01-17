import React from "react";
import removeTrailingZeroes from '../../utils/removeTrailingZeroes';

import './ExchangeTile.css';

const ExchangeTile = ({ title, tickerData }) => {
    return (
        <div className="exchange-tile-container">
            <div className="exchange-tile">
                <div className="tile-header">{title}</div>
                <div className="tile-bid-ask">
                    {tickerData.length ? (
                        <>
                        <div className="tile-price-display">
                            <span>Ask: </span>{removeTrailingZeroes(tickerData[0].ask.toString())}
                        </div>
                            <div className="tile-price-display">
                                <span>Bid: </span>{removeTrailingZeroes(tickerData[0].bid.toString())}
                            </div>
                        </>
                    ) : (
                        <div className="tile-price-display">
                            Awaiting Data...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExchangeTile;
