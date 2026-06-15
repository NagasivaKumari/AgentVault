from langchain.tools import tool
import requests
import random

@tool
def get_whale_transactions(token: str, min_value: int):
    """Get whale transactions for a specific token."""
    # In a real scenario, this would query a blockchain indexer
    return {
        "transactions": [
            {
                "from": "0xWhale1...",
                "to": "0xExchange...",
                "value": random.randint(min_value, min_value * 10),
                "token": token
            },
            {
                "from": "0xWhale2...",
                "to": "0xAnotherWhale...",
                "value": random.randint(min_value, min_value * 10),
                "token": token
            }
        ]
    }

@tool
def get_market_data(token_id: str):
    """Get market data for a specific token from CoinGecko. e.g. 'mantle'"""
    try:
        url = (
            "https://api.coingecko.com/api/v3/simple/price"
            f"?ids={token_id}"
            "&vs_currencies=usd"
            "&include_market_cap=true"
            "&include_24hr_vol=true"
            "&include_24hr_change=true"
        )
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        if token_id not in data:
            return {"error": "Token id not found", "token_id": token_id}

        token_data = data[token_id]
        return {
            "token_id": token_id,
            "price_usd": token_data.get("usd"),
            "change_24h": token_data.get("usd_24h_change"),
            "volume_24h": token_data.get("usd_24h_vol"),
            "market_cap": token_data.get("usd_market_cap"),
        }
    except requests.exceptions.RequestException as e:
        return {"error": f"Error fetching market data: {e}"}

@tool
def get_onchain_data(token: str):
    """Get on-chain data for a specific token."""
    # In a real scenario, this would query on-chain data sources
    return {
        "active_addresses": random.randint(1000, 50000),
        "transaction_count": random.randint(10000, 100000),
        "sentiment": random.choice(["bullish", "bearish", "neutral"])
    }

@tool
def find_best_yields():
    """Find the best yield opportunities."""
    # In a real scenario, this would query DeFi protocols
    return {
        "opportunities": [
            {"protocol": "SomeLendingProtocol", "asset": "mETH", "apy": 4.5},
            {"protocol": "AnotherDEX", "asset": "USDY", "apy": 8.2},
        ]
    }

@tool
def assess_portfolio_risk(portfolio: dict):
    """Assess the risk of a given portfolio."""
    # In a real scenario, this would involve complex risk modeling
    risk_score = 0
    for asset, amount in portfolio.items():
        if "high-risk" in asset:
            risk_score += amount * 0.8
        elif "mETH" in asset:
            risk_score += amount * 0.3
        else:
            risk_score += amount * 0.1
    return {"risk_score": risk_score / sum(portfolio.values())}
