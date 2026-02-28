import { useState, useEffect } from "react";
import { fetchKlines } from "../services/binance";
import { calculateEMA, calculateRSI } from "../lib/indicators";
import { analyzeMarketData } from "../lib/marketUtils";

export function useMarketData(symbol: string) {
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
          const currentPrice = h4Closes[h4Closes.length - 1];

          const analysis = analyzeMarketData(dailyCloses, h4Closes, h4Volumes, currentPrice);
          const rsi = calculateRSI(h4Closes, 14).pop() || 0;

          setData((prev) => ({
            ...prev,
            ...analysis,
            rsi,
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

  return { data, isLoading };
}
