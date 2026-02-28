import { useState, useEffect, useRef } from "react";

/**
 * Hook to track multiple prices in real-time via Binance WebSocket.
 * It automatically manages subscriptions based on the provided symbols.
 */
export function useMultiPrice(symbols: string[]) {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (symbols.length === 0) return;

    // Binance combined stream format: /stream?streams=<stream1>/<stream2>/...
    const streams = symbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
    const url = `wss://fstream.binance.com/stream?streams=${streams}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.data && message.data.s && message.data.c) {
        const symbol = message.data.s;
        const price = parseFloat(message.data.c);
        setPrices(prev => ({
          ...prev,
          [symbol]: price
        }));
      }
    };

    ws.onerror = (error) => {
      console.error("MultiPrice WebSocket error:", error);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [JSON.stringify(symbols)]); // Re-subscribe if symbols list changes

  return prices;
}
