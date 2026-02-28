import { useMarketData } from "../hooks/useMarketData";
import { useNews } from "../hooks/useNews";
import { useAppContext } from "../context/AppContext";
import { TradingPlan } from "../components/TradingPlan";
import { Chat } from "../components/Chat";
import { ScreenerWidget } from "../components/ScreenerWidget";
import { Activity, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { cn } from "../lib/utils";
import { calculateTradingPlan } from "../lib/tradingPlan";
import { saveTrade } from "../services/storage";
import { toast } from "sonner";

export function DashboardPage() {
  const { symbol, baseAmount } = useAppContext();
  const { data, isLoading } = useMarketData(symbol);
  const { news } = useNews();

  const { conditions, canTrade } = calculateTradingPlan(data);
  const isRsiValid = data.rsi >= 40 && data.rsi <= 60;

  const topHeadlines = news.slice(0, 5).map(n => n.title);

  const chatContext = {
    symbol,
    ...data,
    baseAmount,
    newsHeadlines: topHeadlines,
  };

  const handleSaveTrade = () => {
    if (!canTrade) return;

    let suggestedSL = 0;
    let suggestedTP = 0;
    let suggestedType: "BUY" | "SELL" = "BUY";

    if (data.h4Trend === "Haussière") {
      suggestedType = "BUY";
      suggestedSL = data.ema50 * 0.998;
      const risk = data.currentPrice - suggestedSL;
      suggestedTP = data.currentPrice + (risk * 3);
    } else if (data.h4Trend === "Baissière") {
      suggestedType = "SELL";
      suggestedSL = data.ema50 * 1.002;
      const risk = suggestedSL - data.currentPrice;
      suggestedTP = data.currentPrice - (risk * 3);
    }

    const riskPerCoin = Math.abs(data.currentPrice - suggestedSL);
    const riskAmount = baseAmount * 0.01; // Risque 1% du capital
    const positionSizeCoins = riskPerCoin > 0 ? riskAmount / riskPerCoin : 0;
    const positionSizeUsd = positionSizeCoins * data.currentPrice;

    const newTrade = {
      id: Date.now().toString(),
      symbol,
      type: suggestedType,
      amount: positionSizeUsd,
      entryPrice: data.currentPrice,
      targetPrice: suggestedTP,
      stopLoss: suggestedSL,
      status: "OPEN" as const,
      createdAt: Date.now(),
    };

    saveTrade(newTrade);
    toast.success("Trade enregistré !", {
      description: `Position ${suggestedType} sur ${symbol} ajoutée au journal.`,
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Row: Market Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Prix Actuel</span>
          </div>
          <div className="text-2xl font-mono font-bold text-gray-900">
            {isLoading ? "..." : data.currentPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">RSI (14)</span>
          </div>
          <div className={cn(
            "text-2xl font-mono font-bold",
            isRsiValid ? "text-emerald-600" : "text-gray-900"
          )}>
            {isLoading ? "..." : data.rsi.toFixed(2)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            {data.dailyTrend === "Haussière" ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-rose-500" />}
            <span className="text-xs font-semibold uppercase tracking-wider">Tendance 1D</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {isLoading ? "..." : data.dailyTrend}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            {data.h4Trend === "Haussière" ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-rose-500" />}
            <span className="text-xs font-semibold uppercase tracking-wider">Tendance 4H</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {isLoading ? "..." : data.h4Trend}
          </div>
        </div>
      </div>

      {/* Middle Row: Screener & Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <ScreenerWidget />
        <TradingPlan conditions={conditions} canTrade={canTrade} onSaveTrade={handleSaveTrade} />
      </div>

      {/* Bottom Row: Chat */}
      <div className="w-full">
        <Chat context={chatContext} />
      </div>
    </div>
  );
}
