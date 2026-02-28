import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { MobileNav } from "../components/MobileNav";
import { FloatingChat } from "../components/FloatingChat";
import { Wallet } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { SYMBOLS } from "../constants";

export function AppLayout() {
  const { symbol, setSymbol, baseAmount, setBaseAmount } = useAppContext();

  return (
    <div className="flex min-h-screen bg-[#f0f4f9] text-[#1f1f1f] font-sans pb-20 md:pb-0">
      <Sidebar />
      <MobileNav />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-3 md:px-6 absolute top-0 left-0 right-0 z-10">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Aperçu du Marché</h2>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4 bg-white p-1 md:p-1.5 rounded-full shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 px-2 md:px-4 py-1 md:py-1.5">
              <Wallet className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
              <input
                type="number"
                value={baseAmount}
                onChange={(e) => setBaseAmount(Number(e.target.value))}
                className="w-16 md:w-20 font-mono font-medium text-gray-900 focus:outline-none bg-transparent text-xs md:text-sm"
                placeholder="Capital"
              />
              <span className="text-gray-400 font-medium text-xs md:text-sm hidden sm:inline">USDT</span>
            </div>
            <div className="w-px h-4 md:h-6 bg-gray-200"></div>
            <div className="relative flex items-center">
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="bg-gray-50 border-none text-gray-900 font-semibold rounded-full pl-3 md:pl-5 pr-7 md:pr-9 py-1 md:py-1.5 text-xs md:text-sm focus:ring-2 focus:ring-orange-500/20 cursor-pointer appearance-none outline-none max-w-[100px] md:max-w-none"
              >
                {SYMBOLS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("USDT", "")}/USDT
                  </option>
                ))}
              </select>
              <div className="absolute right-2 md:right-3 pointer-events-none">
                <svg width="8" height="5" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 1.5L6 6L10.5 1.5" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto pt-20 md:pt-28 p-3 md:p-6">
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
