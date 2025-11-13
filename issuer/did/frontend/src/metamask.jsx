import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './metamask.css'
import foxLogo from './assets/metamask-fox.svg'

function shorten(address) {
  if (!address) return ''
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function MetaMaskDemo() {
  const [username, setUsername] = useState('')
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    if (!statusMessage) return undefined
    const timeout = window.setTimeout(() => setStatusMessage(''), 3000)
    return () => window.clearTimeout(timeout)
  }, [statusMessage])

  const handleConnect = () => {
    setWalletConnected(true)
    setWalletAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')
    setStatusMessage('MetaMask connected (demo wallet)')
  }

  const handleDisconnect = () => {
    setWalletConnected(false)
    setWalletAddress('')
    setStatusMessage('Wallet disconnected')
  }

  const handleSave = () => {
    if (!username) {
      setStatusMessage('Add a username before saving')
      return
    }
    setStatusMessage(`Username ${username} saved for session`)
  }

  return (
    <div className="metamask-page">
      <header className="metamask-header">
        <div className="logo">ciphers</div>
        <nav>
          <a href="/index.html">Landing</a>
          <a href="/issuer.html">Issuer Console</a>
          <a href="/holder-wallet.html">Holder Wallet</a>
        </nav>
      </header>

      <main className="metamask-main">
        <section className="metamask-hero">
          <div className="metamask-hero-logo">
            <div className="metamask-logo-badge">
              <img src={foxLogo} alt="MetaMask fox logo" />
            </div>
            <span>MetaMask</span>
          </div>
          <h1>MetaMask Login</h1>
          <p>
            Simulate the wallet connection flow before launching the full issuer console. Couple a human-friendly
            username with MetaMask authentication for traceability.
          </p>
        </section>

        <section className="metamask-section">
          <div className="metamask-grid">
            <article className="metamask-card primary">
              <h3>Issuer credentials</h3>
              <p className="muted">
                Enter a username and connect MetaMask to unlock credential issuance tools. All data stays local in this
                demo.
              </p>
              <label className="field">
                <span>Username</span>
                <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="registrar.alex" />
              </label>
              <div className="button-row">
                <button type="button" className="button primary" onClick={handleConnect}>
                  {walletConnected ? 'Reconnect MetaMask' : 'Connect MetaMask'}
                </button>
                <button type="button" className="button secondary" onClick={handleSave}>
                  Save username
                </button>
                {walletConnected ? (
                  <button type="button" className="button ghost" onClick={handleDisconnect}>
                    Disconnect
                  </button>
                ) : null}
              </div>
              <div className="metamask-status">
                <span className={`status-dot ${walletConnected ? 'online' : ''}`} />
                <div>
                  <strong>{walletConnected ? 'Wallet connected' : 'Wallet disconnected'}</strong>
                  <p className="muted">
                    {walletConnected ? (
                      <>
                        {walletAddress} <br />
                        <small>({shorten(walletAddress)})</small>
                      </>
                    ) : (
                      'Awaiting MetaMask approval'
                    )}
                  </p>
                </div>
              </div>
              {statusMessage ? <div className="alert info">{statusMessage}</div> : null}
            </article>

            <article className="metamask-card outline">
              <h3>What to expect</h3>
              <ul className="metamask-steps">
                <li>Username becomes part of issuance and revocation audit trails.</li>
                <li>
                  MetaMask connection in production requests signature permissions only until you issue or revoke
                  credentials.
                </li>
                <li>Disconnect any time to invalidate the active issuer session.</li>
              </ul>
              <p className="muted">
                Ready to deploy? Wire this flow into your issuer dashboard so every credential action is traceable and
                wallet-backed.
              </p>
            </article>
          </div>
        </section>
      </main>

      <footer className="metamask-footer">
        <p>MetaMask login demo for the Ciphers decentralized credential network.</p>
      </footer>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MetaMaskDemo />
  </React.StrictMode>,
)


