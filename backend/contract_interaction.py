"""
Contract interaction layer for AgentVault.

Reads all addresses from environment variables, falling back to
deployment.json produced by `npm run deploy:sepolia` in the contracts folder.

SECURITY: This module never logs PRIVATE_KEY, secret material, or any value
from os.environ that contains "KEY", "SECRET", or "PRIVATE" in its name.
"""
from web3 import Web3
# web3 v7 renamed geth_poa_middleware; PoA is handled automatically
# from web3.middleware import geth_poa_middleware  # removed in v7
from dotenv import load_dotenv
import os
import json
from pathlib import Path
from typing import Dict, Optional

load_dotenv()

# ---------- Paths ----------
# Look for deployment.json in the contracts/ folder (one level up from backend)
BACKEND_DIR = Path(__file__).parent
ROOT_DIR = BACKEND_DIR.parent
CONTRACTS_DEPLOYMENT = ROOT_DIR / "contracts" / "deployment.json"
LOCAL_DEPLOYMENT = BACKEND_DIR / "deployment.json"

# ---------- ABIs (kept inline for simplicity, auto-loaded from artifacts in production) ----------
VAULT_ABI = [
    {"inputs": [{"name": "token", "type": "address"}, {"name": "amount", "type": "uint256"}],
     "name": "deposit", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"name": "token", "type": "address"}, {"name": "amount", "type": "uint256"}],
     "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"name": "user", "type": "address"}, {"name": "token", "type": "address"}],
     "name": "getBalance", "outputs": [{"name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"name": "user", "type": "address"}],
     "name": "getPortfolioValue", "outputs": [{"name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"name": "token", "type": "address"}, {"name": "amount", "type": "uint256"}],
     "name": "emergencyWithdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"name": "_newPrice", "type": "uint256"}],
     "name": "updateEthPrice", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [], "name": "ethPriceInUsd", "outputs": [{"name": "", "type": "uint256"}],
     "stateMutability": "view", "type": "function"},
]

STRATEGY_MANAGER_ABI = [
    {"inputs": [
        {"name": "user", "type": "address"},
        {"name": "ethAlloc", "type": "uint256"},
        {"name": "usdcAlloc", "type": "uint256"},
        {"name": "conviction", "type": "uint256"},
        {"name": "reasoning", "type": "string"},
    ], "name": "storeRecommendation", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"name": "user", "type": "address"}],
     "name": "executeRebalance", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"name": "user", "type": "address"}],
     "name": "getRecommendation", "outputs": [
        {"name": "ethAllocation", "type": "uint256"},
        {"name": "usdcAllocation", "type": "uint256"},
        {"name": "conviction", "type": "uint256"},
        {"name": "timestamp", "type": "uint256"},
        {"name": "reasoning", "type": "string"},
        {"name": "executed", "type": "bool"},
     ], "stateMutability": "view", "type": "function"},
    {"inputs": [{"name": "user", "type": "address"}],
     "name": "getCurrentAllocation", "outputs": [
        {"name": "ethAlloc", "type": "uint256"},
        {"name": "usdcAlloc", "type": "uint256"},
     ], "stateMutability": "view", "type": "function"},
    {"inputs": [{"name": "user", "type": "address"}],
     "name": "getRecommendationCount", "outputs": [{"name": "", "type": "uint256"}],
     "stateMutability": "view", "type": "function"},
]

AGENT_IDENTITY_ABI = [
    {"inputs": [{"name": "tokenId", "type": "uint256"}],
     "name": "getProfile", "outputs": [
        {"name": "profile", "type": "tuple", "components": [
            {"name": "name", "type": "string"},
            {"name": "description", "type": "string"},
            {"name": "model", "type": "string"},
            {"name": "controller", "type": "address"},
            {"name": "decisionCount", "type": "uint256"},
            {"name": "createdAt", "type": "uint256"},
            {"name": "lastDecisionAt", "type": "uint256"},
            {"name": "active", "type": "bool"},
        ]}
     ], "stateMutability": "view", "type": "function"},
    {"inputs": [{"name": "controller", "type": "address"}],
     "name": "tokenIdByController", "outputs": [{"name": "", "type": "uint256"}],
     "stateMutability": "view", "type": "function"},
    {"inputs": [{"name": "tokenId", "type": "uint256"}, {"name": "decisionHash", "type": "bytes32"}],
     "name": "recordDecision", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [],
     "name": "totalAgents", "outputs": [{"name": "", "type": "uint256"}],
     "stateMutability": "view", "type": "function"},
]


def _load_deployment() -> Dict:
    """Read deployment.json from the contracts folder, fall back to local."""
    for path in (CONTRACTS_DEPLOYMENT, LOCAL_DEPLOYMENT):
        if path.exists():
            with open(path, "r") as f:
                return json.load(f)
    return {}


class ContractManager:
    def __init__(self):
        # RPC and chain from env
        self.rpc_url = os.getenv("MANTLE_TESTNET_RPC_URL", "https://rpc.sepolia.mantle.xyz")
        self.chain_id = int(os.getenv("MANTLE_TESTNET_CHAIN_ID", "5003"))
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        # PoA middleware not needed in web3 v7 — handled automatically

        # Address resolution priority: env var > deployment.json
        dep = _load_deployment()
        self.vault_address = (
            os.getenv("VAULT_ADDRESS")
            or os.getenv("VAULT_CONTRACT_ADDRESS")
            or dep.get("vault")
        )
        self.strategy_manager_address = (
            os.getenv("STRATEGY_MANAGER_ADDRESS")
            or dep.get("strategyManager")
        )
        self.agent_identity_address = (
            os.getenv("AGENT_IDENTITY_ADDRESS")
            or dep.get("agentIdentity")
        )
        self.usdc_address = os.getenv("USDC_ADDRESS") or dep.get("usdc")
        self.weth_address = os.getenv("WETH_ADDRESS") or dep.get("weth")

        # Initialize contract handles
        self.vault = self._make_contract(self.vault_address, VAULT_ABI)
        self.strategy_manager = self._make_contract(self.strategy_manager_address, STRATEGY_MANAGER_ABI)
        self.agent_identity = self._make_contract(self.agent_identity_address, AGENT_IDENTITY_ABI)

    def _make_contract(self, address: Optional[str], abi):
        if not address:
            return None
        try:
            return self.w3.eth.contract(
                address=Web3.to_checksum_address(address), abi=abi
            )
        except Exception as e:
            print(f"Failed to init contract at {address}: {e}")
            return None

    def is_connected(self) -> bool:
        return self.w3.is_connected()

    def status(self) -> Dict:
        """One-shot status check used by /health."""
        return {
            "rpc_connected": self.is_connected(),
            "vault_address": self.vault_address,
            "strategy_manager_address": self.strategy_manager_address,
            "agent_identity_address": self.agent_identity_address,
            "chain_id": self.chain_id,
        }

    # ---------- Read methods ----------
    def get_user_balance(self, user_address: str, token_address: str) -> Optional[int]:
        if not self.vault:
            return None
        try:
            return self.vault.functions.getBalance(
                Web3.to_checksum_address(user_address),
                Web3.to_checksum_address(token_address),
            ).call()
        except Exception as e:
            print(f"Error getting balance: {e}")
            return None

    def get_portfolio_value(self, user_address: str) -> Optional[int]:
        if not self.vault:
            return None
        try:
            return self.vault.functions.getPortfolioValue(
                Web3.to_checksum_address(user_address)
            ).call()
        except Exception as e:
            print(f"Error getting portfolio value: {e}")
            return None

    def get_recommendation(self, user_address: str) -> Optional[Dict]:
        if not self.strategy_manager:
            return None
        try:
            rec = self.strategy_manager.functions.getRecommendation(
                Web3.to_checksum_address(user_address)
            ).call()
            return {
                "eth_allocation": rec[0],
                "usdc_allocation": rec[1],
                "conviction": rec[2],
                "timestamp": rec[3],
                "reasoning": rec[4],
                "executed": rec[5],
            }
        except Exception as e:
            print(f"Error getting recommendation: {e}")
            return None

    def get_agent_profile(self, token_id: int) -> Optional[Dict]:
        if not self.agent_identity:
            return None
        try:
            p = self.agent_identity.functions.getProfile(token_id).call()
            # p is a tuple (name, description, model, controller, decisionCount, createdAt, lastDecisionAt, active)
            return {
                "name": p[0],
                "description": p[1],
                "model": p[2],
                "controller": p[3],
                "decision_count": p[4],
                "created_at": p[5],
                "last_decision_at": p[6],
                "active": p[7],
            }
        except Exception as e:
            print(f"Error getting agent profile: {e}")
            return None

    # ---------- Write methods (require backend wallet) ----------
    def _signer(self):
        pk = os.getenv("WALLET_PRIVATE_KEY") or os.getenv("PRIVATE_KEY")
        if not pk:
            return None, None
        return self.w3.eth.account.from_key(pk), pk

    def _send_tx(self, func, gas: int = 500_000) -> Optional[str]:
        account, pk = self._signer()
        if not account:
            print("No backend wallet configured (set PRIVATE_KEY in backend/.env)")
            return None
        try:
            tx = func.build_transaction({
                "from": account.address,
                "gas": gas,
                "gasPrice": self.w3.eth.gas_price,
                "nonce": self.w3.eth.get_transaction_count(account.address),
            })
            signed = self.w3.eth.account.sign_transaction(tx, pk)
            tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)
            return tx_hash.hex()
        except Exception as e:
            print(f"Error sending tx: {e}")
            return None

    def store_recommendation(
        self,
        user_address: str,
        eth_allocation: int,
        usdc_allocation: int,
        conviction: int,
        reasoning: str,
    ) -> Optional[str]:
        if not self.strategy_manager:
            return None
        func = self.strategy_manager.functions.storeRecommendation(
            Web3.to_checksum_address(user_address),
            eth_allocation, usdc_allocation, conviction, reasoning,
        )
        return self._send_tx(func)

    def execute_rebalance(self, user_address: str) -> Optional[str]:
        if not self.strategy_manager:
            return None
        func = self.strategy_manager.functions.executeRebalance(
            Web3.to_checksum_address(user_address)
        )
        return self._send_tx(func)

    def record_agent_decision(self, token_id: int, decision_hash_bytes32: bytes) -> Optional[str]:
        """Record a decision hash on the AgentIdentity NFT."""
        if not self.agent_identity:
            return None
        func = self.agent_identity.functions.recordDecision(token_id, decision_hash_bytes32)
        return self._send_tx(func)


contract_manager = ContractManager()
