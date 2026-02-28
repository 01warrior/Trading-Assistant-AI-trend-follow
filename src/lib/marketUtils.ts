import { calculateEMA } from "./indicators";

export function getTrend(price: number, ema20: number, ema50: number): string {
  if (ema20 === 0 || ema50 === 0) return "Neutre";
  if (ema20 > ema50 && price > ema20 && price > ema50) {
    return "Haussière";
  } else if (ema20 < ema50 && price < ema20 && price < ema50) {
    return "Baissière";
  }
  return "Neutre";
}

export function analyzeMarketData(dailyCloses: number[], h4Closes: number[], h4Volumes: number[], currentPrice: number) {
  const ema20 = calculateEMA(h4Closes, 20).pop() || 0;
  const ema50 = calculateEMA(h4Closes, 50).pop() || 0;
  
  const dailyEma20 = calculateEMA(dailyCloses, 20).pop() || 0;
  const dailyEma50 = calculateEMA(dailyCloses, 50).pop() || 0;
  const dailyPrice = dailyCloses[dailyCloses.length - 1];

  const dailyTrend = getTrend(dailyPrice, dailyEma20, dailyEma50);
  const h4Trend = getTrend(currentPrice, ema20, ema50);

  const currentVolume = h4Volumes[h4Volumes.length - 1];
  const avgVolume = h4Volumes.slice(-11, -1).reduce((a, b) => a + b, 0) / 10;

  return {
    dailyTrend,
    h4Trend,
    ema20,
    ema50,
    currentVolume,
    avgVolume
  };
}
