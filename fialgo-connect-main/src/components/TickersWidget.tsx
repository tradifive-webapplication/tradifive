import React, { useEffect, useRef } from 'react';

const TickersWidget = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container.current && container.current.childElementCount === 1) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-tickers.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "symbols": [
          { "proName": "FOREXCOM:EURUSD", "title": "EUR/USD" },
          { "proName": "FOREXCOM:GBPUSD", "title": "GBP/USD" },
          { "proName": "FOREXCOM:USDJPY", "title": "USD/JPY" },
          { "proName": "FOREXCOM:USDCHF", "title": "USD/CHF" },
          { "proName": "FOREXCOM:USDCAD", "title": "USD/CAD" },
          { "proName": "FOREXCOM:AUDUSD", "title": "AUD/USD" },
          { "proName": "OANDA:XAUUSD", "title": "Gold" }
        ],
        "colorTheme": "dark",
        "isTransparent": true,
        "showSymbolLogo": true,
        "locale": "en"
      });
      container.current.appendChild(script);
    }
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ width: "100%" }}></div>
    </div>
  );
};

export default TickersWidget;
