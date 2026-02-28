import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";
import { useAppContext } from "../context/AppContext";

export function ChartPage() {
  const { symbol } = useAppContext();

  // TradingView expects exchange prefix for best results, e.g., BINANCE:BTCUSDT
  const tvSymbol = `BINANCE:${symbol}`;

  return (
    <div className="w-full h-full">
      <AdvancedRealTimeChart 
        symbol={tvSymbol}
        theme="light"
        autosize
        allow_symbol_change={false}
        hide_side_toolbar={false}
      />
    </div>
  );
}
