import { useState, useEffect } from "react";
import { Cpu, Bell, Plus, Trash2, ShieldCheck, Info } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { cn } from "../lib/utils";
import { getTelegramRecipients, saveTelegramRecipients } from "../services/telegramService";
import { toast } from "sonner";

export function SettingsPage() {
  const { model, setModel } = useAppContext();
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newId, setNewId] = useState("");

  const PRIMARY_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;
  const GROUP_ID = import.meta.env.VITE_TELEGRAM_GROUP_ID;

  useEffect(() => {
    setRecipients(getTelegramRecipients());
  }, []);

  const handleAddRecipient = () => {
    if (!newId.trim()) return;
    if (recipients.includes(newId.trim())) {
      toast.error("Cet ID est déjà dans la liste.");
      return;
    }
    const updated = [...recipients, newId.trim()];
    setRecipients(updated);
    saveTelegramRecipients(updated);
    setNewId("");
    toast.success("Destinataire ajouté !");
  };

  const handleRemoveRecipient = (id: string) => {
    if (id === PRIMARY_ID || id === GROUP_ID) {
      toast.error("Cet ID est protégé et ne peut pas être supprimé.");
      return;
    }
    const updated = recipients.filter(r => r !== id);
    setRecipients(updated);
    saveTelegramRecipients(updated);
    toast.success("Destinataire supprimé.");
  };

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
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
          Paramètres
        </h1>
        <p className="text-gray-500 font-medium">
          Configurez votre assistant IA et vos notifications Telegram.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* AI Model Settings */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <Cpu className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Intelligence Artificielle</h2>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-700">Modèle d'analyse</label>
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

        {/* Telegram Settings */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Bell className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Notifications Telegram</h2>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Ajouter un destinataire (Chat ID)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  placeholder="Ex: 123456789"
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
                <button
                  onClick={handleAddRecipient}
                  className="bg-gray-900 text-white p-2 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">Liste des destinataires</label>
              <div className="space-y-2">
                {recipients.map((id) => (
                  <div
                    key={id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-gray-600">{id}</span>
                      {id === PRIMARY_ID && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase">
                          <ShieldCheck className="w-3 h-3" /> Principal
                        </span>
                      )}
                      {id === GROUP_ID && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase">
                          <ShieldCheck className="w-3 h-3" /> Groupe
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          const url = `https://api.telegram.org/bot${import.meta.env.VITE_TELEGRAM_BOT_TOKEN}/sendMessage`;
                          try {
                            const res = await fetch(url, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                chat_id: id,
                                text: "🔔 *Test de notification*\n\nLe bot est bien configuré pour ce canal !",
                                parse_mode: 'Markdown'
                              })
                            });
                            if (res.ok) toast.success(`Test envoyé à ${id}`);
                            else toast.error("Erreur lors de l'envoi du test");
                          } catch (e) {
                            toast.error("Échec de la connexion à Telegram");
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Envoyer un message de test"
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                      {id !== PRIMARY_ID && id !== GROUP_ID && (
                        <button
                          onClick={() => handleRemoveRecipient(id)}
                          className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {recipients.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">Aucun destinataire configuré.</p>
                )}
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl flex gap-3 border border-blue-100">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 leading-relaxed">
                Pour ajouter un groupe, ajoutez votre bot au groupe et utilisez l'ID du groupe (commence généralement par un "-"). Utilisez <strong>@userinfobot</strong> pour trouver votre ID personnel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
