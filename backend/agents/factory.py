import os
from typing import Dict, Optional

class AgentFactory:
    """
    Factory for creating AI agents configured for the Mantle Turing Test Hackathon.
    Integrates Elfa AI for intelligence and Byreal for execution.
    """
    
    @staticmethod
    def get_agent_config():
        elfa_key = os.getenv("ELFA_AI_API_KEY", "")
        byreal_key = os.getenv("BYREAL_API_KEY", "")
        
        if not elfa_key:
            print("Warning: ELFA_AI_API_KEY is not set. Social intelligence will be simulated.")
        
        if not byreal_key:
            print("Warning: BYREAL_API_KEY is not set. Execution will be simulated.")
            
        return {
            "elfa_active": bool(elfa_key),
            "byreal_active": bool(byreal_key),
            "identity_standard": "ERC-8004"
        }

    @staticmethod
    def create_decision_agent():
        # Agent logic is now driven by Elfa and Byreal metrics
        return {
            "name": "AgentVault Sentinel",
            "capabilities": ["Social Mindshare Analysis", "CLMM Route Optimization"],
            "execution_layer": "Byreal"
        }
