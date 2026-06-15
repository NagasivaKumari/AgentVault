# Byreal Skills Integration

To align with the Turing Test Hackathon requirements, we are wrapping our core functionality into Byreal Skills.

## 1. Create a "Rebalance Skill"
This skill will encapsulate the logic to update allocation on StrategyManager.

```python
# backend/skills/rebalance.py
from byreal_sdk import Skill
from contract_interaction import contract_manager

class RebalanceSkill(Skill):
    def __init__(self):
        super().__init__(name="rebalance_portfolio", description="Updates portfolio allocation on StrategyManager")

    async def execute(self, user_address: str, meth: int, usdy: int, conviction: int, reasoning: str):
        return contract_manager.store_recommendation(user_address, meth, usdy, conviction, reasoning)
```

## 2. Refactor Contract Interaction
We will modify the backend to call skills instead of raw functions.
