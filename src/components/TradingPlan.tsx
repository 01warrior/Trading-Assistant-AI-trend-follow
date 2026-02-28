import { useEffect, useRef } from "react";
import { CheckCircle2, Circle, Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import Skeleton from "react-loading-skeleton";
import { sendTelegramMessage } from "../services/telegramService";

interface TradingPlanProps {
  symbol: string;
  conditions: {
    id: string;
    label: string;
    isMet: boolean;
    value?: string;
  }[];
  canTrade: boolean;
  onSaveTrade?: () => void;
  isLoading?: boolean;
}

export function TradingPlan({ symbol, conditions, canTrade, onSaveTrade, isLoading }: TradingPlanProps) {
  const score = conditions.filter(c => c.isMet).length;
  const maxScore = conditions.length;
  const prevCanTrade = useRef(canTrade);

  useEffect(() => {
    if (canTrade && !prevCanTrade.current && !isLoading) {
      toast.success("Setup Valide !", {
        description: "Toutes les conditions de votre plan de trading sont réunies.",
        duration: 5000,
      });

      // Send Telegram Notification
      const message = `🚀 *Setup Valide sur ${symbol}*\n\nToutes les conditions de votre plan de trading sont réunies. Prêt à trader !`;
      sendTelegramMessage(message);
      
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio play failed (browser policy)", e));
      } catch (e) {}
    }
    prevCanTrade.current = canTrade;
  }, [canTrade, isLoading]);

  let scoreColor = "text-rose-600 bg-rose-50 border-rose-200";
  if (score === maxScore) scoreColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
  else if (score >= 3) scoreColor = "text-orange-600 bg-orange-50 border-orange-200";

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6 h-full">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Plan de Trading</h2>
          <p className="text-sm text-gray-500">Vérification automatique des conditions</p>
        </div>
        <div className={cn("flex flex-col items-center justify-center px-3 py-1.5 rounded-xl border", isLoading ? "border-gray-100" : scoreColor)}>
          {isLoading ? (
            <Skeleton width={80} height={24} />
          ) : (
            <>
              <div className="flex items-center gap-1 mb-0.5">
                {[...Array(maxScore)].map((_, i) => (
                  <Star key={i} className={cn("w-3.5 h-3.5", i < score ? "fill-current" : "text-gray-300 fill-transparent")} />
                ))}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Score: {score}/{maxScore}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50">
              <Skeleton circle width={20} height={20} />
              <div className="flex flex-col gap-2 w-full">
                <Skeleton width="80%" height={20} />
                <Skeleton width="40%" height={16} />
              </div>
            </div>
          ))
        ) : (
          conditions.map((condition) => (
            <div
              key={condition.id}
              className={cn(
                "flex items-start gap-3 p-4 rounded-2xl transition-colors",
                condition.isMet ? "bg-emerald-50" : "bg-gray-50"
              )}
            >
              <div className="mt-0.5 flex-shrink-0">
                {condition.isMet ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
              </div>
              <div className="flex flex-col items-start gap-2">
                <span
                  className={cn(
                    "font-medium text-sm sm:text-base leading-tight",
                    condition.isMet ? "text-emerald-900" : "text-gray-700"
                  )}
                >
                  {condition.label}
                </span>
                {condition.value && (
                  <span
                    className={cn(
                      "text-xs sm:text-sm font-mono font-medium px-2.5 py-1 rounded-md",
                      condition.isMet
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-200 text-gray-600"
                    )}
                  >
                    {condition.value}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-auto flex flex-col gap-3">
        {isLoading ? (
          <Skeleton height={60} borderRadius={16} />
        ) : (
          <div
            className={cn(
              "p-4 rounded-2xl flex items-center justify-center font-semibold text-lg transition-all",
              canTrade
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                : "bg-gray-100 text-gray-400"
            )}
          >
            {canTrade ? "Setup Valide : Prêt à Trader" : "Setup Invalide : Attendre"}
          </div>
        )}
        
        {!isLoading && canTrade && onSaveTrade && (
          <button
            onClick={onSaveTrade}
            className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Enregistrer ce trade dans l'Historique
          </button>
        )}
      </div>
    </div>
  );
}
