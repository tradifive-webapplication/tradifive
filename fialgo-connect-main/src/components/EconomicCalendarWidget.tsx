import React, { useEffect, useRef } from 'react';

const EconomicCalendarWidget = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent multiple script injections
    if (container.current && container.current.childElementCount === 1) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "colorTheme": "dark",
        "isTransparent": true,
        "width": "100%",
        "height": "100%",
        "locale": "en",
        "importanceFilter": "-1,0,1",
        "currencyFilter": "USD,EUR,GBP,JPY,AUD,CAD,CHF,NZD"
      });
      container.current.appendChild(script);
    }
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "600px", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
    </div>
  );
};

export default EconomicCalendarWidget;
