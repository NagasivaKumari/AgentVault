// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Vault.sol";
import "./StrategyManager.sol";

/**
 * @title RebalanceExecutor
 * @notice Executes portfolio rebalancing based on AI suggestions stored in StrategyManager.
 *         In a real production environment, this would interface with a DEX like Merchant Moe
 *         or Agni on Mantle. For the hackathon, it simulates the swap logic.
 */
contract RebalanceExecutor is Ownable {

    Vault public vault;
    StrategyManager public strategyManager;
    IERC20 public usdc;
    IERC20 public weth;

    event ExecutionStarted(address indexed user, uint256 timestamp);
    event SwapExecuted(address indexed user, address fromToken, address toToken, uint256 amountIn, uint256 amountOut);
    event ExecutionCompleted(address indexed user, uint256 timestamp);

    constructor(address _vault, address _strategyManager, address _usdc, address _weth) Ownable(msg.sender) {
        vault = Vault(_vault);
        strategyManager = StrategyManager(_strategyManager);
        usdc = IERC20(_usdc);
        weth = IERC20(_weth);
    }

    /**
     * @notice Rebalances the user's vault portfolio to match the target allocation.
     * @param user The address of the user whose portfolio is being rebalanced.
     */
    function executeRebalance(address user) external {
        require(user != address(0), "Invalid user");
        
        emit ExecutionStarted(user, block.timestamp);

        // 1. Get recommendations from StrategyManager
        (uint256 targetEthAlloc, uint256 targetUsdcAlloc) = strategyManager.getCurrentAllocation(user);
        require(targetEthAlloc + targetUsdcAlloc == 100, "Invalid target allocation");

        // 2. Get current balances from Vault
        uint256 currentUsdc = vault.getBalance(user, address(usdc));
        uint256 currentEth = vault.getBalance(user, address(weth));
        uint256 totalValue = vault.getPortfolioValue(user);

        // 3. Calculate target values in USD
        uint256 targetEthValue = (totalValue * targetEthAlloc) / 100;
        
        // 4. Determine if we need to swap ETH -> USDC or USDC -> ETH
        uint256 currentEthValue = (currentEth * vault.ethPriceInUsd()) / 1e18;

        if (currentEthValue > targetEthValue) {
            // Swap ETH -> USDC
            uint256 ethToSwap = ((currentEthValue - targetEthValue) * 1e18) / vault.ethPriceInUsd();
            _simulateSwap(user, address(weth), address(usdc), ethToSwap);
        } else if (targetEthValue > currentEthValue) {
            // Swap USDC -> ETH
            uint256 usdcToSwap = targetEthValue - currentEthValue;
            _simulateSwap(user, address(usdc), address(weth), usdcToSwap);
        }

        // 5. Finalize execution in StrategyManager
        strategyManager.executeRebalance(user);

        emit ExecutionCompleted(user, block.timestamp);
    }

    /**
     * @dev Internal function to simulate a swap within the vault.
     *      In production, this would call UniswapV3 or Mantle DEXs.
     */
    function _simulateSwap(address user, address fromToken, address toToken, uint256 amountIn) internal {
        // This is a simulation: in a real rebalance, we would:
        // 1. Withdraw from Vault
        // 2. Swap on DEX
        // 3. Deposit back to Vault
        
        // For the hackathon, we assume the Executor has permissions or mocks the result.
        // We'll emit an event to show the "intent" and "action".
        
        uint256 price = vault.ethPriceInUsd();
        uint256 amountOut;
        
        if (fromToken == address(weth)) {
            amountOut = (amountIn * price) / 1e18;
        } else {
            amountOut = (amountIn * 1e18) / price;
        }

        emit SwapExecuted(user, fromToken, toToken, amountIn, amountOut);
    }
}
