import { useState, useEffect } from "react";
import { fetchKlines } from "../services/binance";
import { calculateEMA, calculateRSI } from "../lib/indicators";

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

  return { data, isLoading };
}
