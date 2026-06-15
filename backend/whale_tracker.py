import httpx
from typing import Dict, List
from datetime import datetime, timedelta
import os
import random
from web3 import Web3

class WhaleTracker:
    def __init__(self, w3: Web3 = None):
        self.alchemy_api_key = os.getenv("ALCHEMY_API_KEY")
        self.moralis_api_key = os.getenv("MORALIS_API_KEY")
        self.whale_threshold = float(os.getenv("WHALE_THRESHOLD", "50000"))  # $50k threshold for testnet
        self.w3 = w3
        
        # Known whale wallets on Mantle (for demo - in production use real tracking)
        self.known_whales = [
            "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
            "0x1234567890123456789012345678901234567890",
        ]
    
    async def track_whale_activity(self) -> Dict:
        """
        Track whale wallet activity on Mantle
        Returns whale score based on recent large transactions
        """
        try:
            score = 0.5
            found_count = 0
            
            # If we have web3, scan the last 5 blocks for large transfers
            if self.w3 and self.w3.is_connected():
                try:
                    latest_block = self.w3.eth.block_number
                    for i in range(latest_block - 5, latest_block + 1):
                        block = self.w3.eth.get_block(i, full_transactions=True)
                        for tx in block.transactions:
                            # Simple check: value > 10 ETH (MNT) is a "whale" on testnet
                            if tx['value'] > Web3.to_wei(10, 'ether'):
                                found_count += 1
                    
                    # Score based on how many large transactions we found
                    score = min(1.0, 0.4 + (found_count * 0.1))
                except Exception as block_err:
                    print(f"Error scanning blocks: {block_err}")
                    score = 0.5 + random.uniform(-0.1, 0.1)
            else:
                # Fallback to time-based simulation if no RPC
                hour = datetime.utcnow().hour
                score = 0.5 + (0.2 if 9 <= hour <= 17 else 0.1) + random.uniform(-0.05, 0.05)
            
            score = max(0.0, min(1.0, score))
            
            return {
                "whale_score": score,
                "whale_count": found_count if found_count > 0 else len(self.known_whales),
                "last_activity": datetime.utcnow().isoformat(),
                "signals": self._interpret_whale_score(score)
            }
        except Exception as e:
            print(f"Error tracking whale activity: {e}")
            return {
                "whale_score": 0.5,
                "whale_count": 0,
                "last_activity": datetime.utcnow().isoformat(),
                "signals": ["Unable to fetch whale data"]
            }
    
    def _interpret_whale_score(self, score: float) -> List[str]:
        signals = []
        if score > 0.8:
            signals.append("High-volume transactions detected on Mantle")
            signals.append("Major wallet movements observed")
        elif score > 0.6:
            signals.append("Moderate whale activity")
            signals.append("Active smart money positioning")
        elif score > 0.4:
            signals.append("Normal network activity")
        else:
            signals.append("Low network volume")
        return signals

class MomentumTracker:
    def __init__(self):
        self.api_url = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true"
    
    async def get_momentum_score(self) -> Dict:
        """
        Calculate momentum score based on real price change
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(self.api_url, timeout=5.0)
                if response.status_code == 200:
                    data = response.json()
                    change_24h = data.get("ethereum", {}).get("usd_24h_change", 0)
                    
                    # Normalize change (-5% to +5% maps to 0 to 1)
                    score = 0.5 + (change_24h / 10.0)
                    score = max(0.0, min(1.0, score))
                    
                    return {
                        "momentum_score": score,
                        "change_24h": change_24h,
                        "trend": "bullish" if change_24h > 1 else "bearish" if change_24h < -1 else "neutral",
                        "signals": self._interpret_momentum_score(score, change_24h)
                    }
            
            # Fallback
            return {"momentum_score": 0.5, "trend": "neutral", "signals": ["Market stable"]}
        except Exception as e:
            print(f"Error calculating momentum: {e}")
            return {"momentum_score": 0.5, "trend": "neutral", "signals": ["API limit reached"]}
    
    def _interpret_momentum_score(self, score: float, change: float) -> List[str]:
        signals = []
        if change > 3:
            signals.append(f"Strong 24h gain: +{change:.1f}%")
        elif change > 0:
            signals.append(f"Positive momentum: +{change:.1f}%")
        elif change < -3:
            signals.append(f"Significant drawdown: {change:.1f}%")
        else:
            signals.append(f"Minor price movement: {change:.1f}%")
        return signals

class VolatilityTracker:
    async def get_volatility_score(self) -> Dict:
        """
        Calculate volatility score (simulated but more dynamic)
        """
        try:
            # In a real app, we'd fetch historical prices and calculate std dev
            # For now, we use a range that varies by hour
            hour = datetime.utcnow().hour
            base_vol = 0.3 if 0 <= hour <= 6 else 0.5 if 7 <= hour <= 18 else 0.4
            score = base_vol + random.uniform(-0.1, 0.1)
            score = max(0.0, min(1.0, score))
            
            return {
                "volatility_score": score,
                "level": "high" if score > 0.7 else "medium" if score > 0.4 else "low",
                "signals": ["Low volatility environment" if score < 0.4 else "Active market volatility"]
            }
        except Exception:
            return {"volatility_score": 0.5, "level": "medium", "signals": ["Volatility normal"]}

class LiquidityTracker:
    async def get_liquidity_score(self) -> Dict:
        # Simulate high liquidity for Mantle testnet demo
        score = 0.85 + random.uniform(-0.05, 0.05)
        return {
            "liquidity_score": score,
            "status": "healthy",
            "signals": ["Strong DEX liquidity", "Deep order books"]
        }

