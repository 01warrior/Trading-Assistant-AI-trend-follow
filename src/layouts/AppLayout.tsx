import { useLocation } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { MobileNav } from "../components/MobileNav";
import { FloatingChat } from "../components/FloatingChat";
import { Wallet } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { SYMBOLS } from "../constants";
import { cn } from "../lib/utils";

// Import pages to keep them mounted (IndexedStack behavior)
import { DashboardPage } from "../pages/DashboardPage";
import { JournalPage } from "../pages/JournalPage";
import { ChartPage } from "../pages/ChartPage";
import { NewsPage } from "../pages/NewsPage";
import { SettingsPage } from "../pages/SettingsPage";

export function AppLayout() {
  const { symbol, setSymbol, baseAmount, setBaseAmount } = useAppContext();
  const location = useLocation();

  // Map routes to components for IndexedStack behavior
  const pages = [
    { path: "/", component: <DashboardPage /> },
    { path: "/journal", component: <JournalPage /> },
    { path: "/chart", component: <ChartPage /> },
    { path: "/news", component: <NewsPage /> },
    { path: "/settings", component: <SettingsPage /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#f0f4f9] text-[#1f1f1f] font-sans pb-20 md:pb-0">
      <Sidebar />
      <MobileNav />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className={cn(
          "h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-3 md:px-6 z-10",
          location.pathname === "/chart" ? "relative" : "absolute top-0 left-0 right-0"
        )}>
          <div>
            <h2 className="text-base md:text-lg font-semibold text-gray-900">
              {pages.find(p => p.path === location.pathname)?.path === "/" ? "Aperçu du Marché" : 
               pages.find(p => p.path === location.pathname)?.path === "/journal" ? "Historique des Trades" :
               pages.find(p => p.path === location.pathname)?.path === "/chart" ? "Analyse Graphique" :
               pages.find(p => p.path === location.pathname)?.path === "/news" ? "Actualités Crypto" : "Paramètres"}
            </h2>
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

        {/* Page Content (IndexedStack Implementation) */}
        <div className={cn(
          "flex-1 flex flex-col",
          location.pathname === "/chart" ? "pt-0 overflow-hidden pb-0" : "pt-20 md:pt-28 overflow-y-auto pb-4 md:pb-10"
        )}>
          <div className={cn(
            "mx-auto flex-1 flex flex-col",
            location.pathname === "/chart" ? "w-full" : "w-full max-w-[1600px] px-4 md:px-10"
          )}>
            {pages.map((page) => (
              <div 
                key={page.path} 
                className={cn(
                  "w-full flex-1",
                  location.pathname === page.path ? "flex flex-col" : "hidden"
                )}
              >
                {page.component}
              </div>
            ))}
          </div>
        </div>

        {/* Global Floating Chat */}
        <FloatingChat />
      </main>
    </div>
  );
}
