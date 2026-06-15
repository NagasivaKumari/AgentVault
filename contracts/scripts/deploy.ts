import pkg from "hardhat";
import * as fs from "fs";
const { ethers } = pkg;

/**
 * Deploy AgentVault (Vault + StrategyManager + AgentIdentity) to the configured network.
 *
 * - Reads USDC_ADDRESS / WETH_ADDRESS from .env.
 * - If those are missing, falls back to mocks.json (created by deployMocks.ts).
 * - Registers an AI agent identity NFT on the AgentIdentity contract.
 * - Transfers Vault ownership to StrategyManager.
 * - Writes deployed addresses to deployment.json.
 * - Optionally verifies contracts on MantleScan.
 *
 * SECURITY: This script never prints PRIVATE_KEY or any sensitive value.
 * It only uses PRIVATE_KEY in-process via hardhat's signer.
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  const network = (await ethers.provider.getNetwork()).name;
  console.log(`\nDeploying AgentVault to ${network} from ${deployer.address}`);
  console.log(
    `Deployer balance: ${ethers.formatEther(
      await ethers.provider.getBalance(deployer.address)
    )} native\n`
  );

  // ----- Resolve token addresses: .env first, then mocks.json -----
  let usdcAddress = process.env.USDC_ADDRESS;
  let wethAddress = process.env.WETH_ADDRESS;

  if (
    !usdcAddress ||
    usdcAddress === "0x0000000000000000000000000000000000000000" ||
    !wethAddress ||
    wethAddress === "0x0000000000000000000000000000000000000000"
  ) {
    if (fs.existsSync("mocks.json")) {
      const mocks = JSON.parse(fs.readFileSync("mocks.json", "utf8"));
      usdcAddress = mocks.mockUSDC;
      wethAddress = mocks.mockWETH;
      console.log(`Using mock token addresses from mocks.json`);
    } else {
      throw new Error(
        "USDC_ADDRESS and WETH_ADDRESS are not set in .env, and mocks.json was not found.\n" +
          "Either fill them in .env, or run:  npx hardhat run scripts/deployMocks.ts --network mantle_sepolia"
      );
    }
  }
  console.log(`USDC: ${usdcAddress}`);
  console.log(`WETH: ${wethAddress}\n`);

  // ----- Deploy Vault -----
  console.log("Deploying Vault...");
  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(usdcAddress, wethAddress);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log(`  Vault: ${vaultAddress}`);

  // ----- Deploy StrategyManager -----
  console.log("Deploying StrategyManager...");
  const StrategyManager = await ethers.getContractFactory("StrategyManager");
  const strategyManager = await StrategyManager.deploy(
    vaultAddress,
    usdcAddress,
    wethAddress
  );
  await strategyManager.waitForDeployment();
  const strategyManagerAddress = await strategyManager.getAddress();
  console.log(`  StrategyManager: ${strategyManagerAddress}`);

  // ----- Deploy AgentIdentity (ERC-8004) -----
  console.log("Deploying AgentIdentity (ERC-8004)...");
  const AgentIdentity = await ethers.getContractFactory("AgentIdentity");
  const agentIdentity = await AgentIdentity.deploy();
  await agentIdentity.waitForDeployment();
  const agentIdentityAddress = await agentIdentity.getAddress();
  console.log(`  AgentIdentity: ${agentIdentityAddress}`);

  // ----- Register the AgentVault AI as an agent -----
  console.log("Registering AgentVault AI agent identity...");
  const tx = await agentIdentity.registerAgent(
    deployer.address,
    "AgentVault Quant",
    "Autonomous portfolio rebalancer on Mantle. Deterministic scoring + LLM explainability.",
    "deterministic-v1.0+llm-explain"
  );
  await tx.wait();
  const agentTokenId = await agentIdentity.tokenIdByController(deployer.address);
  console.log(`  Agent NFT minted: tokenId=${agentTokenId} to ${deployer.address}`);

  // ----- Transfer Vault ownership to StrategyManager -----
  console.log("Transferring Vault ownership to StrategyManager...");
  await (await vault.transferOwnership(strategyManagerAddress)).wait();
  console.log("  Done.\n");

  // ----- Write deployment info -----
  const chainId = Number((await ethers.provider.getNetwork()).chainId);
  const info = {
    network,
    chainId,
    deployer: deployer.address,
    vault: vaultAddress,
    strategyManager: strategyManagerAddress,
    agentIdentity: agentIdentityAddress,
    agentTokenId: Number(agentTokenId),
    usdc: usdcAddress,
    weth: wethAddress,
    timestamp: new Date().toISOString(),
  };
  fs.writeFileSync("deployment.json", JSON.stringify(info, null, 2));
  console.log("Saved deployment.json\n");

  console.log("=== DEPLOYMENT COMPLETE ===");
  console.log("Add these to your .env files:");
  console.log(`  VAULT_ADDRESS=${vaultAddress}`);
  console.log(`  STRATEGY_MANAGER_ADDRESS=${strategyManagerAddress}`);
  console.log(`  AGENT_IDENTITY_ADDRESS=${agentIdentityAddress}`);
  console.log(`  AGENT_TOKEN_ID=${agentTokenId}`);
  console.log(`  USDC_ADDRESS=${usdcAddress}`);
  console.log(`  WETH_ADDRESS=${wethAddress}`);
  console.log("\nExplorer URLs:");
  const isSepolia = chainId === 5003;
  const base = isSepolia
    ? process.env.MANTLESCAN_TESTNET_BROWSER_URL || "https://sepolia.mantlescan.xyz"
    : process.env.MANTLESCAN_BROWSER_URL || "https://mantlescan.xyz";
  console.log(`  Vault:           ${base}/address/${vaultAddress}`);
  console.log(`  StrategyManager: ${base}/address/${strategyManagerAddress}`);
  console.log(`  AgentIdentity:   ${base}/address/${agentIdentityAddress}`);
  console.log(`  Agent NFT:       ${base}/token/${agentIdentityAddress}?a=${agentTokenId}`);

  // ----- Verify on MantleScan if API key is set -----
  if (process.env.MANTLESCAN_API_KEY) {
    console.log("\nWaiting 30s for block confirmations before verification...");
    await new Promise((r) => setTimeout(r, 30000));

    const networkLabel = isSepolia ? "mantleSepolia" : "mantle";
    const toVerify = [
      { name: "Vault", address: vaultAddress, args: [usdcAddress, wethAddress] },
      {
        name: "StrategyManager",
        address: strategyManagerAddress,
        args: [vaultAddress, usdcAddress, wethAddress],
      },
      { name: "AgentIdentity", address: agentIdentityAddress, args: [] },
    ];
    for (const c of toVerify) {
      try {
        console.log(`Verifying ${c.name}...`);
        await ethers.run("verify:verify", {
          address: c.address,
          constructorArguments: c.args,
          network: networkLabel,
        });
      } catch (e: any) {
        console.log(`  ${c.name} verify failed (may already be verified): ${e.message}`);
      }
    }
  } else {
    console.log(
      "\n( MANTLESCAN_API_KEY not set - skipping auto-verify. Verify manually at the URLs above. )"
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
