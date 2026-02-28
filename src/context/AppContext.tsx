import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Trade, getTrades } from "../services/storage";

interface AppContextType {
  symbol: string;
  setSymbol: (symbol: string) => void;
  baseAmount: number;
  setBaseAmount: (amount: number) => void;
  model: string;
  setModel: (model: string) => void;
  trades: Trade[];
  refreshTrades: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [baseAmount, setBaseAmount] = useState<number>(() => {
    const stored = localStorage.getItem("trading_assistant_balance");
    return stored ? Number(stored) : 1000;
  });
  const [model, setModel] = useState<string>("gemini-3-flash-preview");

  useEffect(() => {
    localStorage.setItem("trading_assistant_balance", baseAmount.toString());
  }, [baseAmount]);
  const [trades, setTrades] = useState<Trade[]>([]);

  const refreshTrades = () => {
    setTrades(getTrades());
  };

  // Initial load
  useEffect(() => {
    refreshTrades();
  }, []);

  return (
    <AppContext.Provider value={{ 
      symbol, 
      setSymbol, 
      baseAmount, 
      setBaseAmount, 
      model, 
      setModel,
      trades,
      refreshTrades
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
