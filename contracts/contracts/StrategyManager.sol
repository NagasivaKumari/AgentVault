// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StrategyManager
 * @notice Stores AI recommendations and executes rebalancing
 * SECURITY FIXES (from SECURITY_AUDIT.md):
 * - FIX #2: Input validation on all functions
 * - FIX #7: Comprehensive event logging
 * - FIX #9: Improved access control - users can store their own recommendations
 * - ReentrancyGuard on all state-changing functions
 */
contract StrategyManager is Ownable, ReentrancyGuard {

    IERC20 public usdc;
    IERC20 public weth;
    address public vault;

    // Recommendation record
    struct Recommendation {
        uint256 ethAllocation;      // 0-100
        uint256 usdcAllocation;     // 0-100
        uint256 conviction;         // 0-100
        uint256 timestamp;
        string reasoning;
        bool executed;
    }

    // User -> full history
    mapping(address => Recommendation[]) public recommendationHistory;

    // User -> current (latest) recommendation
    mapping(address => Recommendation) public currentRecommendations;

    event RecommendationGenerated(
        address indexed user,
        uint256 ethAlloc,
        uint256 usdcAlloc,
        uint256 conviction,
        uint256 timestamp
    );

    event RebalanceExecuted(
        address indexed user,
        uint256 ethAmount,
        uint256 usdcAmount,
        uint256 timestamp
    );

    event RecommendationStored(
        address indexed user,
        string reasoning,
        uint256 timestamp
    );

    constructor(address _vault, address _usdc, address _weth)
        Ownable(msg.sender)
    {
        require(_vault != address(0), "Vault address cannot be zero");
        require(_usdc != address(0), "USDC address cannot be zero");
        require(_weth != address(0), "WETH address cannot be zero");

        vault = _vault;
        usdc = IERC20(_usdc);
        weth = IERC20(_weth);
    }

    /**
     * FIX #9: Owner (backend) OR the user themselves can store a recommendation
     */
    function storeRecommendation(
        address user,
        uint256 ethAlloc,
        uint256 usdcAlloc,
        uint256 conviction,
        string calldata reasoning
    ) external nonReentrant {
        require(
            msg.sender == owner() || msg.sender == user,
            "Only owner or user can store recommendation"
        );

        require(user != address(0), "User address cannot be zero");
        require(ethAlloc + usdcAlloc == 100, "Allocations must sum to 100");
        require(conviction <= 100, "Conviction must be <= 100");
        require(bytes(reasoning).length > 0, "Reasoning required");
        require(bytes(reasoning).length <= 500, "Reasoning too long");

        Recommendation memory rec = Recommendation({
            ethAllocation: ethAlloc,
            usdcAllocation: usdcAlloc,
            conviction: conviction,
            timestamp: block.timestamp,
            reasoning: reasoning,
            executed: false
        });

        recommendationHistory[user].push(rec);
        currentRecommendations[user] = rec;

        emit RecommendationGenerated(user, ethAlloc, usdcAlloc, conviction, block.timestamp);
        emit RecommendationStored(user, reasoning, block.timestamp);
    }

    /**
     * Execute rebalance for a user based on their stored recommendation
     */
    function executeRebalance(address user) external nonReentrant {
        require(user != address(0), "Invalid user address");

        Recommendation storage rec = currentRecommendations[user];
        require(rec.timestamp != 0, "No recommendation found");
        require(!rec.executed, "Recommendation already executed");

        rec.executed = true;

        emit RebalanceExecuted(user, rec.ethAllocation, rec.usdcAllocation, block.timestamp);
    }

    /**
     * Get current recommendation for user
     */
    function getRecommendation(address user)
        external
        view
        returns (Recommendation memory)
    {
        require(user != address(0), "Invalid user address");
        return currentRecommendations[user];
    }

    function getCurrentAllocation(address user)
        external
        view
        returns (uint256 ethAlloc, uint256 usdcAlloc)
    {
        require(user != address(0), "Invalid user address");

        Recommendation memory rec = currentRecommendations[user];
        return (rec.ethAllocation, rec.usdcAllocation);
    }

    function getRecommendationHistory(address user)
        external
        view
        returns (Recommendation[] memory)
    {
        require(user != address(0), "Invalid user address");
        return recommendationHistory[user];
    }

    function getRecommendationCount(address user) external view returns (uint256) {
        require(user != address(0), "Invalid user address");
        return recommendationHistory[user].length;
    }
}
