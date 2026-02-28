export function calculateTradingPlan(data: {
  currentPrice: number;
  dailyTrend: string;
  h4Trend: string;
  rsi: number;
  ema20: number;
  ema50: number;
  currentVolume: number;
  avgVolume: number;
}) {
  const isTrendClear = data.h4Trend !== "Neutre" && data.ema20 !== 0 && data.ema50 !== 0;
  const isTrendAligned = data.dailyTrend === data.h4Trend && data.dailyTrend !== "Neutre";
  
  const distanceToEma20 = data.ema20 > 0 ? Math.abs(data.currentPrice - data.ema20) / data.ema20 : 1;
  const isPullback = distanceToEma20 < 0.005;
  
  const isRsiValid = data.rsi >= 40 && data.rsi <= 60;
  const isLowVolume = data.currentVolume > 0 && data.currentVolume < data.avgVolume;
  
  const canTrade = isTrendClear && isTrendAligned && isPullback && isRsiValid && isLowVolume;

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

  const score = conditions.filter(c => c.isMet).length;

  return {
    conditions,
    canTrade,
    score,
    maxScore: conditions.length
  };
}
