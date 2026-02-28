/**
 * Telegram Notification Service
 * Sends messages to a Telegram bot using the provided token and chat ID.
 */

const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const PRIMARY_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;
const GROUP_CHAT_ID = import.meta.env.VITE_TELEGRAM_GROUP_ID;

export function getTelegramRecipients(): string[] {
  const saved = localStorage.getItem('telegram_recipients');
  const additional = saved ? JSON.parse(saved) : [];
  
  // Combine primary IDs from .env with additional IDs from localStorage
  const all = new Set<string>();
  if (PRIMARY_CHAT_ID) all.add(PRIMARY_CHAT_ID);
  if (GROUP_CHAT_ID) all.add(GROUP_CHAT_ID);
  additional.forEach((id: string) => all.add(id));
  
  return Array.from(all);
}

export function saveTelegramRecipients(ids: string[]) {
  // Filter out the primary IDs as they are already in .env
  const additional = ids.filter(id => id !== PRIMARY_CHAT_ID && id !== GROUP_CHAT_ID);
  localStorage.setItem('telegram_recipients', JSON.stringify(additional));
}

export async function sendTelegramMessage(message: string) {
  if (!BOT_TOKEN) {
    console.warn("Telegram bot token is missing. Notifications disabled.");
    return;
  }

  const recipients = getTelegramRecipients();
  
  if (recipients.length === 0) {
    console.warn("No Telegram recipients configured.");
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    // Send to all recipients in parallel
    await Promise.all(recipients.map(async (chatId) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Telegram API error for ${chatId}:`, errorData);
      }
    }));
  } catch (error) {
    console.error("Failed to send Telegram messages:", error);
  }
}
