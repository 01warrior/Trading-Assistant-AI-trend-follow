import { useMarketData } from "../hooks/useMarketData";
import { useAppContext } from "../context/AppContext";
import { TradeTracker } from "../components/TradeTracker";

export function JournalPage() {
  const { symbol, baseAmount } = useAppContext();
  const { data } = useMarketData(symbol);

  let suggestedSL = 0;
  let suggestedTP = 0;
  let suggestedType: "BUY" | "SELL" = "BUY";

  if (data.h4Trend === "Haussière") {
    suggestedType = "BUY";
    suggestedSL = data.ema50 * 0.998; // Just below EMA50
    const risk = data.currentPrice - suggestedSL;
    suggestedTP = data.currentPrice + (risk * 3); // RR 1:3
  } else if (data.h4Trend === "Baissière") {
    suggestedType = "SELL";
    suggestedSL = data.ema50 * 1.002; // Just above EMA50
    const risk = suggestedSL - data.currentPrice;
    suggestedTP = data.currentPrice - (risk * 3); // RR 1:3
  }

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
          Journal de Trading
        </h1>
        <p className="text-gray-500 font-medium">
          Gérez vos positions et suivez vos performances sur {symbol}.
        </p>
      </div>
      
      <TradeTracker 
        currentPrice={data.currentPrice} 
        symbol={symbol} 
        suggestedSL={suggestedSL}
        suggestedTP={suggestedTP}
        suggestedType={suggestedType}
        baseAmount={baseAmount}
      />
    </div>
  );
}
