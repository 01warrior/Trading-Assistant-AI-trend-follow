import { useEffect, useState } from "react";
import { fetchKlines, fetchCurrentPrice } from "../services/binance";
import { calculateEMA, calculateRSI } from "../lib/indicators";
import { TradingPlan } from "./TradingPlan";
import { Chat } from "./Chat";
import { TradeTracker } from "./TradeTracker";
import { Activity, TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import { cn } from "../lib/utils";

export function Dashboard() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [baseAmount, setBaseAmount] = useState<number>(1000);
  const [isLoading, setIsLoading] = useState(true);
  
  const [data, setData] = useState({
    currentPrice: 0,
    dailyTrend: "Neutre",
    h4Trend: "Neutre",
    rsi: 0,
    ema20: 0,
    ema50: 0,
    currentVolume: 0,
    avgVolume: 0,
  });

  // WebSocket for real-time price (Binance Futures)
  useEffect(() => {
    const ws = new WebSocket(`wss://fstream.binance.com/ws/${symbol.toLowerCase()}@ticker`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.c) {
        setData((prevData) => ({
          ...prevData,
          currentPrice: parseFloat(message.c),
        }));
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [symbol]);

  // REST API for historical data (Klines)
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [dailyKlines, h4Klines] = await Promise.all([
          fetchKlines(symbol, "1d", 100),
          fetchKlines(symbol, "4h", 100),
        ]);

        if (h4Klines.length > 0 && dailyKlines.length > 0) {
          const h4Closes = h4Klines.map((k) => k.close);
          const dailyCloses = dailyKlines.map((k) => k.close);
          const h4Volumes = h4Klines.map((k) => k.volume);

          const ema20 = calculateEMA(h4Closes, 20).pop() || 0;
          const ema50 = calculateEMA(h4Closes, 50).pop() || 0;
          const rsi = calculateRSI(h4Closes, 14).pop() || 0;

          const dailyEma20 = calculateEMA(dailyCloses, 20).pop() || 0;
          const dailyEma50 = calculateEMA(dailyCloses, 50).pop() || 0;
          const dailyPrice = dailyCloses[dailyCloses.length - 1];
          
          let dailyTrend = "Neutre";
          if (dailyEma20 > dailyEma50 && dailyPrice > dailyEma20 && dailyPrice > dailyEma50) {
            dailyTrend = "Haussière";
          } else if (dailyEma20 < dailyEma50 && dailyPrice < dailyEma20 && dailyPrice < dailyEma50) {
            dailyTrend = "Baissière";
          }

          // Use the last close from h4 for trend calculation initially, but it will be updated by WS
          const h4Price = h4Closes[h4Closes.length - 1];
          let h4Trend = "Neutre";
          if (ema20 > ema50 && h4Price > ema20 && h4Price > ema50) {
            h4Trend = "Haussière";
          } else if (ema20 < ema50 && h4Price < ema20 && h4Price < ema50) {
            h4Trend = "Baissière";
          }

          const currentVolume = h4Volumes[h4Volumes.length - 1];
          const avgVolume = h4Volumes.slice(-11, -1).reduce((a, b) => a + b, 0) / 10;

          setData((prev) => ({
            ...prev,
            dailyTrend,
            h4Trend,
            rsi,
            ema20,
            ema50,
            currentVolume,
            avgVolume,
          }));
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [symbol]);

  // Trading Plan Logic
  const isTrendClear = data.h4Trend !== "Neutre" && data.ema20 !== 0 && data.ema50 !== 0;
  const isTrendAligned = data.dailyTrend === data.h4Trend && data.dailyTrend !== "Neutre";
  
  // Pullback: Price is within 0.5% of EMA20
  const distanceToEma20 = data.ema20 > 0 ? Math.abs(data.currentPrice - data.ema20) / data.ema20 : 1;
  const isPullback = distanceToEma20 < 0.005;
  
  const isRsiValid = data.rsi >= 40 && data.rsi <= 60;
  const isLowVolume = data.currentVolume > 0 && data.currentVolume < data.avgVolume;
  
  const canTrade = isTrendClear && isTrendAligned && isPullback && isRsiValid && isLowVolume;

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

  const conditions = [
    {
      id: "trend_clear",
      label: "Tendance claire (EMA20 et 50 alignées)",
      isMet: isTrendClear,
      value: data.h4Trend,
    },
    {
      id: "trend_aligned",
      label: "Sens de la tendance (1D = 4H)",
      isMet: isTrendAligned,
      value: `${data.dailyTrend} ➔ ${data.h4Trend}`,
    },
    {
      id: "pullback",
      label: "Pullback sur EMA20",
      isMet: isPullback,
      value: `${(distanceToEma20 * 100).toFixed(2)}% d'écart`,
    },
    {
      id: "rsi",
      label: "RSI(14) entre 40 et 60",
      isMet: isRsiValid,
      value: data.rsi.toFixed(2),
    },
    {
      id: "volume",
      label: "Volume faible sur le pullback",
      isMet: isLowVolume,
      value: isLowVolume ? "Faible" : "Élevé",
    },
  ];

  const chatContext = {
    symbol,
    ...data,
    baseAmount,
  };

  return (
    <div className="min-h-screen bg-[#f0f4f9] text-[#1f1f1f] font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
              Trading Assistant
            </h1>
            <p className="text-gray-500 font-medium">
              Suivi de plan et analyse en temps réel
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 px-4 py-2">
              <Wallet className="w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={baseAmount}
                onChange={(e) => setBaseAmount(Number(e.target.value))}
                className="w-24 font-mono font-medium text-gray-900 focus:outline-none bg-transparent"
                placeholder="Capital"
              />
              <span className="text-gray-400 font-medium">USDT</span>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="relative flex items-center">
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="bg-gray-50 border-none text-gray-900 font-semibold rounded-full pl-6 pr-10 py-2 focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none outline-none"
              >
                <option value="BTCUSDT">BTC/USDT</option>
                <option value="ETHUSDT">ETH/USDT</option>
                <option value="SOLUSDT">SOL/USDT</option>
              </select>
              <div className="absolute right-4 pointer-events-none">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 1.5L6 6L10.5 1.5" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Stats & Plan */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Market Overview Cards */}
            <div className="grid grid-cols-2 gap-4">
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

            {/* Trading Plan Checklist */}
            <TradingPlan conditions={conditions} canTrade={canTrade} />
            
          </div>

          {/* Right Column: Gemini Chat & Tracker */}
          <div className="lg:col-span-2 space-y-8">
            <Chat context={chatContext} />
            <TradeTracker 
              currentPrice={data.currentPrice} 
              symbol={symbol} 
              suggestedSL={suggestedSL}
              suggestedTP={suggestedTP}
              suggestedType={suggestedType}
              baseAmount={baseAmount}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
