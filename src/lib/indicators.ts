export function calculateEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const emaData: number[] = [];

  // Start with SMA for the first 'period' elements
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
    if (i < period - 1) {
      emaData.push(0); // Not enough data for EMA yet
    }
  }
  
  if (data.length < period) return emaData;

  let previousEma = sum / period;
  emaData.push(previousEma);

  for (let i = period; i < data.length; i++) {
    const currentEma = (data[i] - previousEma) * k + previousEma;
    emaData.push(currentEma);
    previousEma = currentEma;
  }

  return emaData;
}

export function calculateRSI(data: number[], period: number = 14): number[] {
  const rsiData: number[] = [];
  let gains = 0;
  let losses = 0;

  for (let i = 0; i < period; i++) {
    rsiData.push(0); // Not enough data
  }

  if (data.length <= period) return rsiData;

  // Initial Average Gain/Loss
  for (let i = 1; i <= period; i++) {
    const change = data[i] - data[i - 1];
    if (change >= 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  let rs = avgGain / avgLoss;
  let rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));
  rsiData.push(rsi);

  // Smoothed Moving Average for subsequent values
  for (let i = period + 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    let currentGain = 0;
    let currentLoss = 0;

    if (change >= 0) {
      currentGain = change;
    } else {
      currentLoss = -change;
    }

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

    rs = avgGain / avgLoss;
    rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));
    rsiData.push(rsi);
  }

  return rsiData;
}
