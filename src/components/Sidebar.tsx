import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, Settings, ChevronLeft, ChevronRight, LineChart, Newspaper } from "lucide-react";
import { cn } from "../lib/utils";

export function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const links = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Graphiques", href: "/chart", icon: LineChart },
    { name: "Actualités", href: "/news", icon: Newspaper },
    { name: "Historique", href: "/journal", icon: BookOpen },
    { name: "Paramètres", href: "/settings", icon: Settings },
  ];

  return (
    <>
      <aside 
        className={cn(
          "bg-white border-r border-gray-100 hidden md:flex flex-col h-screen sticky top-0 transition-all duration-300 z-20",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <div className={cn("flex items-center gap-2 overflow-hidden transition-all duration-300", isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 whitespace-nowrap">
              Trading AI
            </h1>
          </div>
          {isCollapsed && (
            <h1 className="text-xl font-bold tracking-tight text-gray-900 mx-auto">
              TA
            </h1>
          )}
        </div>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-8 bg-white border border-gray-200 rounded-full p-1.5 text-gray-400 hover:text-orange-500 hover:border-orange-500 transition-colors z-10 shadow-sm"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors relative group",
                  isActive 
                    ? "bg-orange-50 text-orange-600" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                  isCollapsed ? "justify-center px-0" : ""
                )}
                title={isCollapsed ? link.name : undefined}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-orange-500" : "text-gray-400")} />
                {!isCollapsed && <span>{link.name}</span>}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    {link.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
