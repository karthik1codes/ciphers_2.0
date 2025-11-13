import React from 'react'
import { useAccount } from 'wagmi'
import '../issuerApp.css'

export default function IssuerHeader() {
  const { address, isConnected } = useAccount()
  const displayName = isConnected && address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'Admin'
  const avatar = isConnected && address ? address.slice(2, 3).toUpperCase() : 'A'

  return (
    <header className="issuer-header">
      <div className="issuer-header-left">
        <span className="issuer-brand-mark">ciphers</span>
        <div>
          <h1>Issuer Admin Console</h1>
          <p>Manage verification, issuance, and revocation on-chain.</p>
        </div>
      </div>
      <nav className="issuer-nav">
        <a href="#stats">Dashboard</a>
        <a href="#verification">Verify Students</a>
        <a href="#issue">Issue VC</a>
        <a href="#issued">Issued</a>
        <a href="#keys">Issuer DID</a>
        <a href="#logs">Audit</a>
      </nav>
      <div className="issuer-header-right">
        <div className="wallet-pill">
          <span className="wallet-pill-dot" data-status={isConnected ? 'connected' : 'disconnected'} />
          <span>{isConnected ? 'Polygon Mumbai' : 'Wallet offline'}</span>
        </div>
        <div className="issuer-user-pill">
          <span className="issuer-avatar">{avatar}</span>
          <span>{displayName}</span>
        </div>
      </div>
    </header>
  )
}


