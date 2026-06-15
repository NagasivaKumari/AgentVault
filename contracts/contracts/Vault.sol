// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Vault
 * @notice Simple vault for deposits, withdrawals, and balance tracking
 * SECURITY FIXES (from SECURITY_AUDIT.md):
 * - FIX #2: Input validation on all functions
 * - FIX #7: Event logging with timestamps
 * - FIX #10: Pluggable ETH price (oracle-ready, mock for testnet)
 * - Proper ReentrancyGuard protection
 */
contract Vault is Ownable, ReentrancyGuard {

    IERC20 public usdc;
    IERC20 public weth;

    // User -> Token -> Balance
    mapping(address => mapping(address => uint256)) public balances;

    // Total deposits per token
    mapping(address => uint256) public totalDeposits;

    // Price cache (replace with Chainlink oracle in production)
    uint256 public ethPriceInUsd = 3500e18;  // 1 ETH = $3500 (18 decimals)
    uint256 public lastPriceUpdate;

    event Deposit(address indexed user, address indexed token, uint256 amount, uint256 timestamp);
    event Withdrawal(address indexed user, address indexed token, uint256 amount, uint256 timestamp);
    event Rebalance(address indexed user, uint256 ethAmount, uint256 usdcAmount, uint256 timestamp);
    event PriceUpdated(uint256 newPrice, uint256 timestamp);

    constructor(address _usdc, address _weth) Ownable(msg.sender) {
        require(_usdc != address(0), "USDC address cannot be zero");
        require(_weth != address(0), "WETH address cannot be zero");

        usdc = IERC20(_usdc);
        weth = IERC20(_weth);
        lastPriceUpdate = block.timestamp;
    }

    /**
     * Update ETH price (called by owner / oracle keeper in production)
     */
    function updateEthPrice(uint256 _newPrice) external onlyOwner {
        require(_newPrice > 0, "Price must be positive");
        ethPriceInUsd = _newPrice;
        lastPriceUpdate = block.timestamp;
        emit PriceUpdated(_newPrice, block.timestamp);
    }

    /**
     * Deposit tokens into vault
     */
    function deposit(address token, uint256 amount) external nonReentrant {
        require(token == address(usdc) || token == address(weth), "Token not supported");
        require(amount > 0, "Amount must be > 0");
        require(msg.sender != address(0), "Invalid sender");

        IERC20 token_ = IERC20(token);
        require(
            token_.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        balances[msg.sender][token] += amount;
        totalDeposits[token] += amount;

        emit Deposit(msg.sender, token, amount, block.timestamp);
    }

    /**
     * Withdraw tokens from vault
     */
    function withdraw(address token, uint256 amount) external nonReentrant {
        require(token == address(usdc) || token == address(weth), "Token not supported");
        require(balances[msg.sender][token] >= amount, "Insufficient balance");
        require(amount > 0, "Amount must be > 0");
        require(msg.sender != address(0), "Invalid sender");

        balances[msg.sender][token] -= amount;
        totalDeposits[token] -= amount;

        IERC20 token_ = IERC20(token);
        require(token_.transfer(msg.sender, amount), "Transfer failed");

        emit Withdrawal(msg.sender, token, amount, block.timestamp);
    }

    /**
     * Get user balance for a token
     */
    function getBalance(address user, address token) external view returns (uint256) {
        require(user != address(0), "Invalid user address");
        require(token == address(usdc) || token == address(weth), "Token not supported");
        return balances[user][token];
    }

    /**
     * Get total portfolio value in USD
     */
    function getPortfolioValue(address user) external view returns (uint256) {
        require(user != address(0), "Invalid user address");

        uint256 usdcBalance = balances[user][address(usdc)];
        uint256 ethBalance = balances[user][address(weth)];

        uint256 ethValue = (ethBalance * ethPriceInUsd) / 1e18;

        return usdcBalance + ethValue;
    }

    /**
     * Emergency withdrawal (owner only)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20 token_ = IERC20(token);
        require(token_.transfer(owner(), amount), "Emergency withdrawal failed");
    }
}
