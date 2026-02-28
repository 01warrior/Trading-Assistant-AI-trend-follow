import { createContext, useContext, useState, ReactNode } from "react";

interface AppContextType {
  symbol: string;
  setSymbol: (symbol: string) => void;
  baseAmount: number;
  setBaseAmount: (amount: number) => void;
  model: string;
  setModel: (model: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [baseAmount, setBaseAmount] = useState<number>(1000);
  const [model, setModel] = useState<string>("gemini-3-flash-preview");

  return (
    <AppContext.Provider value={{ symbol, setSymbol, baseAmount, setBaseAmount, model, setModel }}>
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
