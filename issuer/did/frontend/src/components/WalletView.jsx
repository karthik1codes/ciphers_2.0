import React, { useState } from 'react'
import './WalletView.css'
import './shared.css'

function WalletView() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')

  const handleConnect = () => {
    // Placeholder for wallet connection logic
    setWalletConnected(true)
    setWalletAddress('0x1234...5678')
  }

  const handleDisconnect = () => {
    setWalletConnected(false)
    setWalletAddress('')
  }

  return (
    <section className="wallet-view">
      <div className="wallet-card">
        <div className="wallet-header">
          <h2 className="wallet-title">Wallet</h2>
          <div className={`wallet-status ${walletConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            {walletConnected ? 'Connected' : 'Not Connected'}
          </div>
        </div>
        
        {walletConnected ? (
          <div className="wallet-info">
            <div className="wallet-address">
              <label>Address:</label>
              <code className="address-text">{walletAddress}</code>
            </div>
            <div className="wallet-balance">
              <label>Balance:</label>
              <span className="balance-amount">0.00 ETH</span>
            </div>
            <button className="btn btn-secondary" onClick={handleDisconnect}>
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="wallet-empty">
            <div className="wallet-icon">🔐</div>
            <p className="wallet-message">Connect your wallet to get started</p>
            <button className="btn btn-primary" onClick={handleConnect}>
              Connect Wallet
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default WalletView

