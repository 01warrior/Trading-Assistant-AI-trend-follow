import { useState, useEffect, useRef } from "react";
import { Plus, X, TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle2 } from "lucide-react";
import { Trade, saveTrade, updateTrade, getTrades, calculatePnL } from "../services/storage";
import { cn } from "../lib/utils";

interface TradeTrackerProps {
  currentPrice: number;
  symbol: string;
  suggestedSL: number;
  suggestedTP: number;
  suggestedType: "BUY" | "SELL";
  baseAmount: number;
}

export function TradeTracker({ currentPrice, symbol, suggestedSL, suggestedTP, suggestedType, baseAmount }: TradeTrackerProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [type, setType] = useState<"BUY" | "SELL">("BUY");
  const [amount, setAmount] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");

  const hasPopulatedRef = useRef(false);

  useEffect(() => {
    setTrades(getTrades());
  }, []);

  // Set default entry price to current price when opening form
  useEffect(() => {
    if (!isAdding) {
      hasPopulatedRef.current = false;
      return;
    }

    if (isAdding && currentPrice > 0 && !hasPopulatedRef.current) {
      setEntryPrice(currentPrice.toString());
      if (suggestedSL > 0) setStopLoss(suggestedSL.toFixed(2));
      if (suggestedTP > 0) setTargetPrice(suggestedTP.toFixed(2));
      setType(suggestedType);
      
      // Calculate amount based on 1% risk
      if (suggestedSL > 0) {
        const riskPerCoin = Math.abs(currentPrice - suggestedSL);
        if (riskPerCoin > 0) {
          const riskAmount = baseAmount * 0.01; // 1% risk
          const positionSizeCoins = riskAmount / riskPerCoin;
          const positionSizeUSD = positionSizeCoins * currentPrice;
          setAmount(positionSizeUSD.toFixed(2));
        }
      }
      hasPopulatedRef.current = true;
    }
  }, [isAdding, currentPrice, suggestedSL, suggestedTP, suggestedType, baseAmount]);

  const handleAddTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !entryPrice || !targetPrice || !stopLoss) return;

    const newTrade: Trade = {
      id: Date.now().toString(),
      symbol,
      type,
      amount: parseFloat(amount),
      entryPrice: parseFloat(entryPrice),
      targetPrice: parseFloat(targetPrice),
      stopLoss: parseFloat(stopLoss),
      status: "OPEN",
      createdAt: Date.now(),
    };

    saveTrade(newTrade);
    setTrades(getTrades());
    setIsAdding(false);
    
    // Reset form
    setAmount("");
    setEntryPrice("");
    setTargetPrice("");
    setStopLoss("");
  };

  const handleCloseTrade = (trade: Trade) => {
    const updatedTrade: Trade = {
      ...trade,
      status: "CLOSED",
      exitPrice: currentPrice,
      closedAt: Date.now(),
    };
    updateTrade(updatedTrade);
    setTrades(getTrades());
  };

  const openTrades = trades.filter(t => t.status === "OPEN");
  const closedTrades = trades.filter(t => t.status === "CLOSED");

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Journal de Trading</h2>
          <p className="text-sm text-gray-500">Suivi des positions en cours et passées</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-100 transition-colors"
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>

      {isAdding && (
        <div className="p-6 bg-gray-50 border-b border-gray-100">
          <form onSubmit={handleAddTrade} className="space-y-4">
            <div className="flex gap-2 p-1 bg-gray-200 rounded-xl">
              <button
                type="button"
                onClick={() => setType("BUY")}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
                  type === "BUY" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                Achat (Long)
              </button>
              <button
                type="button"
                onClick={() => setType("SELL")}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
                  type === "SELL" ? "bg-white text-rose-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                Vente (Short)
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant ($)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  placeholder="Ex: 100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Prix d'entrée</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Take Profit</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stop Loss</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
            >
              Enregistrer la position
            </button>
          </form>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {openTrades.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4" /> Positions Ouvertes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {openTrades.map((trade) => {
                const pnl = calculatePnL(trade, currentPrice);
                const isProfitable = pnl >= 0;

                return (
                  <div key={trade.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-1 rounded-md text-xs font-bold",
                          trade.type === "BUY" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        )}>
                          {trade.type === "BUY" ? "LONG" : "SHORT"}
                        </span>
                        <span className="font-semibold text-gray-900">{trade.symbol}</span>
                      </div>
                      <div className={cn(
                        "font-mono font-bold text-lg",
                        isProfitable ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {isProfitable ? "+" : ""}{pnl.toFixed(2)}$
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                      <div>
                        <div className="text-gray-500 text-xs">Entrée</div>
                        <div className="font-mono font-medium">{trade.entryPrice}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">Montant</div>
                        <div className="font-mono font-medium">{trade.amount}$</div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-500 text-xs">Actuel</div>
                        <div className="font-mono font-medium">{currentPrice}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCloseTrade(trade)}
                      className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors"
                    >
                      Fermer la position
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {closedTrades.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Historique
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {closedTrades.slice().reverse().map((trade) => {
                const pnl = calculatePnL(trade, trade.exitPrice || 0);
                const isProfitable = pnl >= 0;

                return (
                  <div key={trade.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-xs font-bold",
                          trade.type === "BUY" ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {trade.type === "BUY" ? "LONG" : "SHORT"}
                        </span>
                        <span className="font-medium text-gray-700 text-sm">{trade.symbol}</span>
                      </div>
                      <div className={cn(
                        "font-mono font-bold",
                        isProfitable ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {isProfitable ? "+" : ""}{pnl.toFixed(2)}$
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 font-mono">
                      <span>In: {trade.entryPrice}</span>
                      <span>Out: {trade.exitPrice}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {trades.length === 0 && !isAdding && (
          <div className="text-center py-12 text-gray-500">
            <DollarSign className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-medium">Aucun trade enregistré</p>
            <p className="text-sm mt-1">Cliquez sur le + pour ajouter une position</p>
          </div>
        )}
      </div>
    </div>
  );
}
