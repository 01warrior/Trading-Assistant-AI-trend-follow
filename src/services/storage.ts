export interface Trade {
  id: string;
  symbol: string;
  type: "BUY" | "SELL";
  amount: number;
  entryPrice: number;
  exitPrice?: number;
  targetPrice: number;
  stopLoss: number;
  status: "OPEN" | "CLOSED";
  createdAt: number;
  closedAt?: number;
}

export function saveTrade(trade: Trade) {
  const trades = getTrades();
  trades.push(trade);
  localStorage.setItem("trading_assistant_trades", JSON.stringify(trades));
}

export function updateTrade(updatedTrade: Trade) {
  const trades = getTrades();
  const index = trades.findIndex((t) => t.id === updatedTrade.id);
  if (index !== -1) {
    trades[index] = updatedTrade;
    localStorage.setItem("trading_assistant_trades", JSON.stringify(trades));
  }
}

export function getTrades(): Trade[] {
  const stored = localStorage.getItem("trading_assistant_trades");
  return stored ? JSON.parse(stored) : [];
}

export function deleteTrade(id: string) {
  const trades = getTrades();
  const filtered = trades.filter((t) => t.id !== id);
  localStorage.setItem("trading_assistant_trades", JSON.stringify(filtered));
}

export function calculatePnL(trade: Trade, currentPrice: number): number {
  const priceToUse = trade.status === "CLOSED" && trade.exitPrice ? trade.exitPrice : currentPrice;
  const difference = trade.type === "BUY" ? priceToUse - trade.entryPrice : trade.entryPrice - priceToUse;
  const percentage = difference / trade.entryPrice;
  return trade.amount * percentage;
}
