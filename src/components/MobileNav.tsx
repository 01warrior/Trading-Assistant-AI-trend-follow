import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, LineChart, Newspaper, Settings } from "lucide-react";
import { cn } from "../lib/utils";

export function MobileNav() {
  const location = useLocation();

  const links = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Graphiques", href: "/chart", icon: LineChart },
    { name: "Actualités", href: "/news", icon: Newspaper },
    { name: "Historique", href: "/journal", icon: BookOpen },
    { name: "Paramètres", href: "/settings", icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-40 md:hidden pb-safe">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.href;
        return (
          <Link
            key={link.name}
            to={link.href}
            className={cn(
              "flex flex-col items-center gap-1",
              isActive ? "text-orange-600" : "text-gray-400"
            )}
          >
            <Icon className={cn("w-6 h-6", isActive && "fill-current")} />
            <span className="text-[10px] font-medium">{link.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
