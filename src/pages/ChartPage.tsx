import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";
import { useAppContext } from "../context/AppContext";

export function ChartPage() {
  const { symbol } = useAppContext();

  // TradingView expects exchange prefix for best results, e.g., BINANCE:BTCUSDT
  const tvSymbol = `BINANCE:${symbol}`;

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Graphique Avancé</h2>
        <p className="text-sm text-gray-500">Analyse technique en temps réel propulsée par TradingView</p>
      </div>
      <div className="flex-1 w-full relative">
        <AdvancedRealTimeChart 
          symbol={tvSymbol}
          theme="light"
          autosize
          allow_symbol_change={false}
          hide_side_toolbar={false}
        />
      </div>
    </div>
  );
}
