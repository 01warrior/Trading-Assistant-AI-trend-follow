import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { FloatingChat } from "../components/FloatingChat";
import { Wallet } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export function AppLayout() {
  const { symbol, setSymbol, baseAmount, setBaseAmount } = useAppContext();

  return (
    <div className="flex min-h-screen bg-[#f0f4f9] text-[#1f1f1f] font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 absolute top-0 left-0 right-0 z-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Aperçu du Marché</h2>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-1.5 rounded-full shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 px-4 py-1.5">
              <Wallet className="w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={baseAmount}
                onChange={(e) => setBaseAmount(Number(e.target.value))}
                className="w-20 font-mono font-medium text-gray-900 focus:outline-none bg-transparent text-sm"
                placeholder="Capital"
              />
              <span className="text-gray-400 font-medium text-sm">USDT</span>
            </div>
            <div className="w-px h-6 bg-gray-200"></div>
            <div className="relative flex items-center">
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="bg-gray-50 border-none text-gray-900 font-semibold rounded-full pl-5 pr-9 py-1.5 text-sm focus:ring-2 focus:ring-orange-500/20 cursor-pointer appearance-none outline-none"
              >
                <option value="BTCUSDT">BTC/USDT</option>
                <option value="ETHUSDT">ETH/USDT</option>
                <option value="SOLUSDT">SOL/USDT</option>
              </select>
              <div className="absolute right-3 pointer-events-none">
                <svg width="10" height="6" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 1.5L6 6L10.5 1.5" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto pt-28 p-8">
          <div className="w-full max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </div>

        {/* Global Floating Chat */}
        <FloatingChat />
      </main>
    </div>
  );
}
