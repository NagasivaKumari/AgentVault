import pkg from "hardhat";
import * as fs from "fs";
const { ethers } = pkg;

/**
 * Deploys MockUSDC and MockWETH (MockWMNT) for use by Vault.sol and StrategyManager.sol
 * on Mantle Sepolia testnet, where official USDC/WETH are not yet deployed.
 *
 * After this script runs, copy the printed addresses into your .env:
 *   USDC_ADDRESS=<printed>
 *   WETH_ADDRESS=<printed>
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying mocks from: ${deployer.address}`);

  const MockERC20 = await ethers.getContractFactory("MockERC20");

  // 6 decimals like real USDC
  const usdc = await MockERC20.deploy("Mock USDC", "mUSDC", 6);
  await usdc.waitForDeployment();
  const usdcAddr = await usdc.getAddress();
  console.log(`MockUSDC deployed: ${usdcAddr}`);

  // 18 decimals like real WETH
  const weth = await MockERC20.deploy("Mock WETH", "mWETH", 18);
  await weth.waitForDeployment();
  const wethAddr = await weth.getAddress();
  console.log(`MockWETH deployed: ${wethAddr}`);

  // Mint demo balances to the deployer
  const demoUsdc = ethers.parseUnits("100000", 6);   // 100k mUSDC
  const demoWeth = ethers.parseUnits("100", 18);      // 100 mWETH
  await (await usdc.mint(deployer.address, demoUsdc)).wait();
  await (await weth.mint(deployer.address, demoWeth)).wait();
  console.log(`Minted ${ethers.formatUnits(demoUsdc, 6)} mUSDC and ${ethers.formatUnits(demoWeth, 18)} mWETH to deployer`);

  // Save addresses to a file for the deploy script to pick up
  const network = (await ethers.provider.getNetwork()).name;
  const info = {
    network,
    deployer: deployer.address,
    mockUSDC: usdcAddr,
    mockWETH: wethAddr,
    timestamp: new Date().toISOString(),
  };
  fs.writeFileSync("mocks.json", JSON.stringify(info, null, 2));

  console.log("\n=== MOCK DEPLOYMENT COMPLETE ===");
  console.log(`USDC_ADDRESS=${usdcAddr}`);
  console.log(`WETH_ADDRESS=${wethAddr}`);
  console.log("\nSaved to mocks.json. Copy these into your .env, then run:");
  console.log("  npm run deploy:sepolia");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
