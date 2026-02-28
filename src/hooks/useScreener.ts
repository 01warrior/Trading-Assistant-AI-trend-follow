import { useState, useEffect } from "react";
import { fetchKlines } from "../services/binance";
import { calculateEMA, calculateRSI } from "../lib/indicators";
import { calculateTradingPlan } from "../lib/tradingPlan";

const SYMBOLS = [
  "BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", 
  "ADAUSDT", "DOGEUSDT", "DOTUSDT", "MATICUSDT", "LINKUSDT", 
  "AVAXUSDT", "LTCUSDT"
];

export interface ScreenerResult {
  symbol: string;
  price: number;
  score: number;
  maxScore: number;
  trend: string;
}

export function useScreener() {
  const [results, setResults] = useState<ScreenerResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);

  const scan = async () => {
    setIsScanning(true);
    try {
      const scanResults: ScreenerResult[] = [];

      // We process in chunks to avoid rate limits
      const chunkSize = 4;
      for (let i = 0; i < SYMBOLS.length; i += chunkSize) {
        const chunk = SYMBOLS.slice(i, i + chunkSize);
        
        const chunkPromises = chunk.map(async (symbol) => {
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

              const h4Price = h4Closes[h4Closes.length - 1];
              let h4Trend = "Neutre";
              if (ema20 > ema50 && h4Price > ema20 && h4Price > ema50) {
                h4Trend = "Haussière";
              } else if (ema20 < ema50 && h4Price < ema20 && h4Price < ema50) {
                h4Trend = "Baissière";
              }

              const currentVolume = h4Volumes[h4Volumes.length - 1];
              const avgVolume = h4Volumes.slice(-11, -1).reduce((a, b) => a + b, 0) / 10;

              const data = {
                currentPrice: h4Price,
                dailyTrend,
                h4Trend,
                rsi,
                ema20,
                ema50,
                currentVolume,
                avgVolume,
              };

              const plan = calculateTradingPlan(data);

              return {
                symbol,
                price: h4Price,
                score: plan.score,
                maxScore: plan.maxScore,
                trend: h4Trend
              };
            }
          } catch (e) {
            console.error(`Error scanning ${symbol}`, e);
          }
          return null;
        });

        const resolved = await Promise.all(chunkPromises);
        resolved.forEach(r => {
          if (r) scanResults.push(r);
        });
      }

      // Sort by score descending
      scanResults.sort((a, b) => b.score - a.score);
      setResults(scanResults);
      setLastScan(new Date());
    } catch (error) {
      console.error("Screener failed", error);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    scan();
    const interval = setInterval(scan, 5 * 60 * 1000); // Scan every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return { results, isScanning, lastScan, scan };
}
