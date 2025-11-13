import React from 'react'
import ReactDOM from 'react-dom/client'
import IssuerApp from './issuer/IssuerApp'
import './index.css'
import './issuer/issuerApp.css'

import { WagmiConfig, configureChains, createConfig } from 'wagmi'
import { polygonMumbai } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const { chains, publicClient, webSocketPublicClient } = configureChains([polygonMumbai], [publicProvider()])

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [new MetaMaskConnector({ chains })],
  publicClient,
  webSocketPublicClient,
})

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <IssuerApp />
      </WagmiConfig>
    </QueryClientProvider>
  </React.StrictMode>,
)


