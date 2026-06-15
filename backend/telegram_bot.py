import os
import httpx
import asyncio
from typing import Optional

class TelegramAlphaBot:
    """
    Alpha Alert Bot for Telegram.
    Aligns with the 'AI Alpha & Data' track requirements.
    """
    def __init__(self):
        self.token = os.getenv("TELEGRAM_BOT_TOKEN")
        self.chat_id = os.getenv("TELEGRAM_CHAT_ID")
        self.api_url = f"https://api.telegram.org/bot{self.token}/sendMessage" if self.token else None

    async def send_alpha_alert(self, message: str):
        """Sends an alpha alert to the configured Telegram chat."""
        if not self.token or not self.chat_id:
            print("Telegram Bot not configured. Skipping alert.")
            return

        try:
            payload = {
                "chat_id": self.chat_id,
                "text": f"🚀 **AgentVault Alpha Alert** 🚀\n\n{message}",
                "parse_mode": "Markdown"
            }
            async with httpx.AsyncClient() as client:
                await client.post(self.api_url, json=payload, timeout=5.0)
        except Exception as e:
            print(f"Failed to send Telegram alert: {e}")

    def notify_whale_activity(self, count: int, score: float):
        """Helper to format and send whale alerts."""
        msg = f"🐋 Large Whale Activity Detected on Mantle!\n\n- Blocks Scanned: 5\n- Whale Transactions: {count}\n- Network Score: {score*100:.1f}%\n\n#Mantle #Alpha #SmartMoney"
        asyncio.create_task(self.send_alpha_alert(msg))

    def notify_rebalance(self, user: str, meth: float, usdy: float, conviction: float):
        """Helper to format and send rebalance alerts."""
        msg = f"🔄 **Strategy Rebalance Executed**\n\nUser: `{user[:6]}...{user[-4:]}`\nConviction: {conviction}%\n\n**New Target Allocation:**\n- mETH: {meth}%\n- USDY: {usdy}%\n\nVerified on Mantle Sepolia."
        asyncio.create_task(self.send_alpha_alert(msg))

# Global instance
alpha_bot = TelegramAlphaBot()
