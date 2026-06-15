import VaultABI from './abis/Vault.json';
import StrategyManagerABI from './abis/StrategyManager.json';
import AgentIdentityABI from './abis/AgentIdentity.json';

export const CONTRACT_ADDRESSES = {
  vault: process.env.NEXT_PUBLIC_VAULT_ADDRESS as `0x${string}`,
  strategyManager: process.env.NEXT_PUBLIC_STRATEGY_MANAGER_ADDRESS as `0x${string}`,
  agentIdentity: process.env.NEXT_PUBLIC_AGENT_IDENTITY_ADDRESS as `0x${string}`,
} as const;

export { VaultABI, StrategyManagerABI, AgentIdentityABI };
