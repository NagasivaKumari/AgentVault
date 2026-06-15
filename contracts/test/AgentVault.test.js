const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgentVault Core Contracts", function () {
  let Vault, StrategyManager, AgentIdentityRegistry, MockERC20;
  let vault, strategyManager, agentIdentityRegistry, usdc, weth;
  let owner, user, agent;

  beforeEach(async function () {
    [owner, user, agent] = await ethers.getSigners();

    // Deploy Mocks
    MockERC20 = await ethers.getContractFactory("MockERC20");
    usdc = await MockERC20.deploy("USD Coin", "USDC");
    weth = await MockERC20.deploy("Wrapped Ether", "WETH");

    // Deploy Vault
    Vault = await ethers.getContractFactory("Vault");
    vault = await Vault.deploy(usdc.target, weth.target);

    // Deploy StrategyManager
    StrategyManager = await ethers.getContractFactory("StrategyManager");
    strategyManager = await StrategyManager.deploy(vault.target, usdc.target, weth.target);

    // Deploy AgentIdentityRegistry
    AgentIdentityRegistry = await ethers.getContractFactory("AgentIdentityRegistry");
    agentIdentityRegistry = await AgentIdentityRegistry.deploy();
  });

  describe("Vault", function () {
    it("Should accept deposits", async function () {
      const amount = ethers.parseUnits("100", 18);
      await usdc.mint(user.address, amount);
      await usdc.connect(user).approve(vault.target, amount);
      
      await expect(vault.connect(user).deposit(usdc.target, amount))
        .to.emit(vault, "Deposit")
        .withArgs(user.address, usdc.target, amount, any);
    });
  });

  describe("AgentIdentityRegistry", function () {
    it("Should register an agent", async function () {
      await expect(agentIdentityRegistry.registerAgent(agent.address, "AgentVault-01", "Autonomous Agent", "DeepSeek-R1"))
        .to.emit(agentIdentityRegistry, "AgentRegistered")
        .withArgs(1, agent.address, "AgentVault-01", "DeepSeek-R1", any);
    });

    it("Should record a decision", async function () {
      await agentIdentityRegistry.registerAgent(agent.address, "AgentVault-01", "Autonomous Agent", "DeepSeek-R1");
      const decisionHash = ethers.id("test-decision");
      
      await expect(agentIdentityRegistry.connect(agent).recordDecision(1, decisionHash))
        .to.emit(agentIdentityRegistry, "DecisionRecorded");
    });
  });
});

// Helper for timestamp matching
const any = ethers.Typed.uint256;
