import { X, Cpu } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { cn } from "../lib/utils";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { model, setModel } = useAppContext();

  if (!isOpen) return null;

  const models = [
    {
      id: "gemini-3-flash-preview",
      name: "Gemini 3 Flash",
      description: "Rapide et efficace pour les analyses courantes.",
    },
    {
      id: "gemini-3.1-pro-preview",
      name: "Gemini 3.1 Pro",
      description: "Modèle avancé pour des analyses complexes et approfondies.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Paramètres</h2>
              <p className="text-sm text-gray-500">Configuration de l'assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-50 text-gray-500 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-900">Modèle d'Intelligence Artificielle</label>
            <div className="space-y-3">
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border-2 transition-all",
                    model === m.id
                      ? "border-orange-500 bg-orange-50/50"
                      : "border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50/30"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn("font-semibold", model === m.id ? "text-orange-900" : "text-gray-900")}>
                      {m.name}
                    </span>
                    {model === m.id && (
                      <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                  <p className={cn("text-sm", model === m.id ? "text-orange-700" : "text-gray-500")}>
                    {m.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
