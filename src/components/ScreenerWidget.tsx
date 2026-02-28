import { useScreener } from "../hooks/useScreener";
import { RefreshCw, Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "../lib/utils";
import { useAppContext } from "../context/AppContext";
import Skeleton from "react-loading-skeleton";

export function ScreenerWidget() {
  const { results, isScanning, lastScan, scan } = useScreener();
  const { setSymbol } = useAppContext();

  const topResults = results.filter(r => r.score >= 3).slice(0, 5); // Show top 5 with score >= 3

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Screener IA</h2>
          <p className="text-sm text-gray-500">
            {lastScan ? `Dernier scan: ${lastScan.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : isScanning ? "Scan en cours..." : "En attente"}
          </p>
        </div>
        <button 
          onClick={scan}
          disabled={isScanning}
          className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors disabled:opacity-50"
          title="Forcer le scan"
        >
          <RefreshCw className={cn("w-5 h-5", isScanning && "animate-spin")} />
        </button>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {isScanning && results.length === 0 ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-gray-50">
                <div className="flex items-center gap-3">
                  <Skeleton circle width={40} height={40} />
                  <div>
                    <Skeleton width={80} height={20} />
                    <Skeleton width={60} height={15} />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Skeleton width={60} height={20} />
                  <Skeleton width={80} height={15} />
                </div>
              </div>
            ))}
          </div>
        ) : topResults.length > 0 ? (
          topResults.map((item) => (
            <button
              key={item.symbol}
              onClick={() => setSymbol(item.symbol)}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700 text-xs">
                  {item.symbol.replace('USDT', '')}
                </div>
                <div>
                  <div className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                    {item.symbol}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                    {item.trend === "Haussière" ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : 
                     item.trend === "Baissière" ? <TrendingDown className="w-3 h-3 text-rose-500" /> : 
                     <Minus className="w-3 h-3 text-gray-400" />}
                    {item.trend}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <div className="font-mono font-medium text-sm text-gray-900">
                  ${item.price.toFixed(item.price < 1 ? 4 : 2)}
                </div>
                <div className="flex items-center gap-0.5">
                  {[...Array(item.maxScore)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "w-3 h-3", 
                        i < item.score 
                          ? item.score === item.maxScore ? "fill-emerald-500 text-emerald-500" : "fill-orange-400 text-orange-400" 
                          : "text-gray-200 fill-transparent"
                      )} 
                    />
                  ))}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center px-4">
            <Star className="w-8 h-8 mb-2 text-gray-300" />
            <p className="text-sm font-medium">Aucun setup intéressant (Score ≥ 3) trouvé actuellement.</p>
          </div>
        )}
      </div>
    </div>
  );
}
