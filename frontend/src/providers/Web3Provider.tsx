import { WagmiProvider, createConfig, http } from 'wagmi'
import { mantleSepoliaTestnet } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { injected, walletConnect } from 'wagmi/connectors'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { useState, type ReactNode } from 'react'

const config = createConfig({
  chains: [mantleSepoliaTestnet],
  connectors: [
    injected(),
  ],
  transports: {
    [mantleSepoliaTestnet.id]: http('https://rpc.sepolia.mantle.xyz'),
  },
  ssr: false,
})

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          coolMode
          theme={darkTheme({
            accentColor: '#7C3AED',
            accentColorForeground: '#ffffff',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
