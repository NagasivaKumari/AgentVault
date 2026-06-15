import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_VAULT_ADDRESS: process.env.VAULT_ADDRESS,
    NEXT_PUBLIC_STRATEGY_MANAGER_ADDRESS: process.env.STRATEGY_MANAGER_ADDRESS,
    NEXT_PUBLIC_AGENT_IDENTITY_ADDRESS: process.env.AGENT_IDENTITY_ADDRESS,
    NEXT_PUBLIC_AGENT_TOKEN_ID: process.env.AGENT_TOKEN_ID,
    NEXT_PUBLIC_USDC_ADDRESS: process.env.USDC_ADDRESS,
    NEXT_PUBLIC_WETH_ADDRESS: process.env.WETH_ADDRESS,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    };
    return config;
  },
};

export default nextConfig;
