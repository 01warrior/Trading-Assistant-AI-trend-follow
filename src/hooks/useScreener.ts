import { useState, useEffect } from "react";
import { fetchKlines } from "../services/binance";
import { calculateRSI } from "../lib/indicators";
import { calculateTradingPlan } from "../lib/tradingPlan";
import { SYMBOLS } from "../constants";
import { analyzeMarketData } from "../lib/marketUtils";

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
              const currentPrice = h4Closes[h4Closes.length - 1];

              const analysis = analyzeMarketData(dailyCloses, h4Closes, h4Volumes, currentPrice);
              const rsi = calculateRSI(h4Closes, 14).pop() || 0;

              const data = {
                currentPrice,
                ...analysis,
                rsi,
              };

              const plan = calculateTradingPlan(data);

              return {
                symbol,
                price: currentPrice,
                score: plan.score,
                maxScore: plan.maxScore,
                trend: analysis.h4Trend
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
    const interval = setInterval(scan, 2 * 60 * 1000); // Scan every 2 minutes
    return () => clearInterval(interval);
  }, []);

  return { results, isScanning, lastScan, scan };
}
