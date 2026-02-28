import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function askGeminiTradingAdvice(
  prompt: string,
  context: {
    symbol: string;
    currentPrice: number;
    dailyTrend: string;
    h4Trend: string;
    rsi: number;
    ema20: number;
    ema50: number;
    baseAmount: number;
    newsHeadlines?: string[];
  },
  model: string = "gemini-3-flash-preview"
) {
  const systemInstruction = `
    Tu es un assistant de trading expert. Ton rôle est d'accompagner l'utilisateur dans ses prises de position.
    L'utilisateur utilise une stratégie STRICTE basée sur les règles suivantes:
    - Tendance 1D: EMA20 > EMA50 + Prix > EMA20/50 = Haussière (Chercher uniquement LONG sur 4H). Inverse = Baissière (Chercher uniquement SHORT sur 4H).
    - Tendance 4H: Doit être alignée avec la tendance 1D.
    - Entrée: Pullback sur EMA20 (le prix revient toucher l'EMA20).
    - RSI: Doit être entre 40 et 60 au moment de l'entrée.
    - Volume: Faible sur le pullback.
    - Stop Loss: Sous l'EMA50 (Long) ou au-dessus de l'EMA50 (Short).
    - Take Profit: 3x la distance du Stop Loss (Risk/Reward 1:3).
    - Risque: Maximum 1 à 2% du capital risqué par trade.

    Contexte actuel du marché:
    - Paire: ${context.symbol}
    - Prix actuel: ${context.currentPrice.toFixed(2)}
    - Tendance Journalière: ${context.dailyTrend}
    - Tendance 4H: ${context.h4Trend}
    - RSI (14): ${context.rsi.toFixed(2)}
    - EMA 20 (4H): ${context.ema20.toFixed(2)}
    - EMA 50 (4H): ${context.ema50.toFixed(2)}
    - Capital de base de l'utilisateur: ${context.baseAmount}$

    Dernières actualités du marché (pour contexte) :
    ${context.newsHeadlines && context.newsHeadlines.length > 0 ? context.newsHeadlines.map(h => `- ${h}`).join('\n') : "Aucune actualité récente."}

    Réponds de manière concise, professionnelle, et structurée. Utilise le français.
    Concentre-toi sur l'analyse du setup, la gestion du risque (position sizing, stop loss, take profit) et donne un avis clair (Prendre position, Attendre, etc.).
    Prends en compte les actualités si elles te semblent pertinentes pour le trade (ex: news très baissière alors que le setup est haussier).
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Désolé, une erreur est survenue lors de la communication avec l'assistant. Veuillez vérifier votre clé API ou réessayer plus tard.";
  }
}
