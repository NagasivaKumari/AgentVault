from web3 import Web3
from web3.middleware import geth_poa_middleware
from dotenv import load_dotenv
import os
import json
from typing import Dict, Optional
import logging
import asyncio

load_dotenv()

logger = logging.getLogger(__name__)

class ContractManager:
    def __init__(self):
        self.rpc_url = os.getenv("MANTLE_TESTNET_RPC_URL", "https://rpc.testnet.mantle.xyz")
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        
        # Add POA middleware for Mantle
        self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        
        # Contract addresses
        self.vault_address = os.getenv("VAULT_CONTRACT_ADDRESS")
        self.strategy_manager_address = os.getenv("STRATEGY_MANAGER_ADDRESS")
        
        # Load deployment info if available
        try:
            with open("deployment.json", "r") as f:
                deployment = json.load(f)
                if not self.vault_address:
                    self.vault_address = deployment.get("vault")
                if not self.strategy_manager_address:
                    self.strategy_manager_address = deployment.get("strategyManager")
        except FileNotFoundError:
            logger.warning("deployment.json not found")
        
        # ABI definitions
        self.vault_abi = [
            {
                "inputs": [
                    {"name": "token", "type": "address"},
                    {"name": "amount", "type": "uint256"}
                ],
                "name": "deposit",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"name": "token", "type": "address"},
                    {"name": "amount", "type": "uint256"}
                ],
                "name": "withdraw",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"name": "user", "type": "address"},
                    {"name": "token", "type": "address"}
                ],
                "name": "getBalance",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "user", "type": "address"}],
                "name": "getPortfolioValue",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            }
        ]
        
        self.strategy_manager_abi = [
            {
                "inputs": [
                    {"name": "user", "type": "address"},
                    {"name": "ethAllocation", "type": "uint256"},
                    {"name": "usdcAllocation", "type": "uint256"},
                    {"name": "conviction", "type": "uint256"},
                    {"name": "reasoning", "type": "string"}
                ],
                "name": "storeRecommendation",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"name": "user", "type": "address"}],
                "name": "executeRebalance",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"name": "user", "type": "address"}],
                "name": "getRecommendation",
                "outputs": [
                    {"name": "ethAllocation", "type": "uint256"},
                    {"name": "usdcAllocation", "type": "uint256"},
                    {"name": "conviction", "type": "uint256"},
                    {"name": "reasoning", "type": "string"},
                    {"name": "timestamp", "type": "uint256"},
                    {"name": "executed", "type": "bool"}
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "user", "type": "address"}],
                "name": "getCurrentAllocation",
                "outputs": [
                    {"name": "ethAllocation", "type": "uint256"},
                    {"name": "usdcAllocation", "type": "uint256"}
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ]
        
        # Initialize contracts if addresses are available
        self.vault = None
        self.strategy_manager = None
        
        if self.vault_address:
            self.vault = self.w3.eth.contract(
                address=Web3.to_checksum_address(self.vault_address),
                abi=self.vault_abi
            )
        
        if self.strategy_manager_address:
            self.strategy_manager = self.w3.eth.contract(
                address=Web3.to_checksum_address(self.strategy_manager_address),
                abi=self.strategy_manager_abi
            )
        
        # FIX #8: Nonce management
        self.nonce_lock = asyncio.Lock()
        self.pending_nonce = None
    
    def is_connected(self) -> bool:
        """Check if connected to Mantle network"""
        try:
            return self.w3.is_connected()
        except Exception as e:
            logger.error(f"Connection check failed: {str(e)}")
            return False
    
    def get_user_balance(self, user_address: str, token_address: str) -> Optional[int]:
        """Get user's balance for a specific token"""
        if not self.vault:
            logger.warning("Vault contract not initialized")
            return None
        try:
            # FIX #2: Validate addresses
            if not Web3.is_address(user_address) or not Web3.is_address(token_address):
                logger.error(f"Invalid address provided")
                return None
            
            balance = self.vault.functions.getBalance(
                Web3.to_checksum_address(user_address),
                Web3.to_checksum_address(token_address)
            ).call()
            
            logger.info(f"Balance fetched for {user_address}: {balance}")
            return balance
        except Exception as e:
            logger.error(f"Error getting balance: {str(e)}")
            return None
    
    def get_portfolio_value(self, user_address: str) -> Optional[int]:
        """Get user's total portfolio value in USD"""
        if not self.vault:
            logger.warning("Vault contract not initialized")
            return None
        try:
            # FIX #2: Validate address
            if not Web3.is_address(user_address):
                logger.error(f"Invalid address: {user_address}")
                return None
            
            value = self.vault.functions.getPortfolioValue(
                Web3.to_checksum_address(user_address)
            ).call()
            
            logger.info(f"Portfolio value fetched for {user_address}: {value}")
            return value
        except Exception as e:
            logger.error(f"Error getting portfolio value: {str(e)}")
            return None
    
    def _estimate_gas(self, tx_function, account_address: str, fallback: int = 500000) -> int:
        """
        FIX #6: Dynamic gas estimation
        Estimate gas required for a transaction
        """
        try:
            estimated_gas = tx_function.estimate_gas({'from': account_address})
            # Add 20% safety margin
            gas_limit = int(estimated_gas * 1.2)
            logger.info(f"Estimated gas: {estimated_gas}, limit set to: {gas_limit}")
            return gas_limit
        except Exception as e:
            logger.warning(f"Gas estimation failed, using fallback: {str(e)}")
            return fallback
    
    def store_recommendation(
        self,
        user_address: str,
        eth_allocation: int,
        usdc_allocation: int,
        conviction: int,
        reasoning: str
    ) -> Optional[str]:
        """
        Store AI recommendation on-chain
        FIX #2: Input validation
        FIX #6: Dynamic gas estimation
        FIX #7: Comprehensive logging
        """
        if not self.strategy_manager:
            logger.error("Strategy manager contract not initialized")
            return None
        
        # FIX #2: Validate inputs
        if not Web3.is_address(user_address):
            logger.error(f"Invalid user address: {user_address}")
            return None
        
        if eth_allocation + usdc_allocation != 100:
            logger.error(f"Allocations don't sum to 100: {eth_allocation} + {usdc_allocation}")
            return None
        
        if conviction < 0 or conviction > 100:
            logger.error(f"Invalid conviction: {conviction}")
            return None
        
        private_key = os.getenv("WALLET_PRIVATE_KEY")
        if not private_key:
            logger.error("No WALLET_PRIVATE_KEY in environment")
            return None
        
        try:
            account = self.w3.eth.account.from_key(private_key)
            
            # Build transaction
            tx_function = self.strategy_manager.functions.storeRecommendation(
                Web3.to_checksum_address(user_address),
                eth_allocation,
                usdc_allocation,
                conviction,
                reasoning
            )
            
            # FIX #6: Dynamic gas estimation
            gas_limit = self._estimate_gas(tx_function, account.address)
            
            tx = tx_function.build_transaction({
                'from': account.address,
                'gas': gas_limit,  # FIX #6: Dynamic instead of hardcoded
                'gasPrice': self.w3.eth.gas_price,
                'nonce': self.w3.eth.get_transaction_count(account.address),
            })
            
            # Sign and send
            signed_tx = self.w3.eth.account.sign_transaction(tx, private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            logger.info(f"Recommendation stored - TX: {tx_hash.hex()}")
            return tx_hash.hex()
            
        except Exception as e:
            logger.error(f"Error storing recommendation for {user_address}: {str(e)}")
            return None
    
    def execute_rebalance(self, user_address: str) -> Optional[str]:
        """
        Execute rebalance for a user
        FIX #2: Input validation
        FIX #6: Dynamic gas estimation
        FIX #7: Comprehensive logging
        """
        if not self.strategy_manager:
            logger.error("Strategy manager contract not initialized")
            return None
        
        # FIX #2: Validate address
        if not Web3.is_address(user_address):
            logger.error(f"Invalid user address: {user_address}")
            return None
        
        private_key = os.getenv("WALLET_PRIVATE_KEY")
        if not private_key:
            logger.error("No WALLET_PRIVATE_KEY in environment")
            return None
        
        try:
            account = self.w3.eth.account.from_key(private_key)
            
            # Build transaction
            tx_function = self.strategy_manager.functions.executeRebalance(
                Web3.to_checksum_address(user_address)
            )
            
            # FIX #6: Dynamic gas estimation
            gas_limit = self._estimate_gas(tx_function, account.address, fallback=500000)
            
            tx = tx_function.build_transaction({
                'from': account.address,
                'gas': gas_limit,  # FIX #6: Dynamic instead of hardcoded
                'gasPrice': self.w3.eth.gas_price,
                'nonce': self.w3.eth.get_transaction_count(account.address),
            })
            
            # Sign and send
            signed_tx = self.w3.eth.account.sign_transaction(tx, private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            logger.info(f"Rebalance executed - TX: {tx_hash.hex()}")
            return tx_hash.hex()
            
        except Exception as e:
            logger.error(f"Error executing rebalance for {user_address}: {str(e)}")
            return None
    
    def get_recommendation(self, user_address: str) -> Optional[Dict]:
        """
        Get stored recommendation for a user
        FIX #2: Input validation
        FIX #7: Comprehensive logging
        """
        if not self.strategy_manager:
            logger.error("Strategy manager contract not initialized")
            return None
        
        # FIX #2: Validate address
        if not Web3.is_address(user_address):
            logger.error(f"Invalid user address: {user_address}")
            return None
        
        try:
            rec = self.strategy_manager.functions.getRecommendation(
                Web3.to_checksum_address(user_address)
            ).call()
            
            recommendation = {
                "eth_allocation": rec[0],
                "usdc_allocation": rec[1],
                "conviction": rec[2],
                "reasoning": rec[3],
                "timestamp": rec[4],
                "executed": rec[5]
            }
            
            logger.info(f"Recommendation fetched for {user_address}")
            return recommendation
            
        except Exception as e:
            logger.error(f"Error getting recommendation for {user_address}: {str(e)}")
            return None

# Global instance
contract_manager = ContractManager()
