from skills.byreal_sdk import Skill, register_skill
from contract_interaction import contract_manager
import logging

logger = logging.getLogger(__name__)

class RebalanceSkill(Skill):
    def __init__(self):
        super().__init__(name="rebalance_portfolio", description="Updates portfolio allocation on StrategyManager to mETH/USDY")

    async def execute(self, user_address: str, meth_alloc: int, usdy_alloc: int, conviction: int, reasoning: str):
        logger.info(f"Executing rebalance for {user_address}: mETH {meth_alloc}%, USDY {usdy_alloc}%")
        try:
            return contract_manager.store_recommendation(
                user_address,
                meth_alloc,
                usdy_alloc,
                conviction,
                reasoning,
            )
        except Exception as e:
            logger.error(f"Rebalance skill failed: {e}")
            raise e

rebalance_skill = RebalanceSkill()
register_skill(rebalance_skill)
