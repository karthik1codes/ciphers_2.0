import React, { useState } from 'react'
import { useHolderWallet } from '../context/HolderContext'
import { deriveKeyFromPassphrase, encryptWithKey } from '../utils/crypto'
import { downloadJson } from '../utils/ui'

export default function SecurityCenter() {
  const { state, updateSettings, logEvent } = useHolderWallet()
  const [passphrase, setPassphrase] = useState('')
  const [confirmPassphrase, setConfirmPassphrase] = useState('')
  const [backupStatus, setBackupStatus] = useState('')
  const [ipfsEndpoint, setIpfsEndpoint] = useState(state.settings.ipfs.endpoint)
  const [ipfsToken, setIpfsToken] = useState(state.settings.ipfs.token)
  const [ipfsMode, setIpfsMode] = useState(state.settings.ipfs.mode)

  const handlePassphrase = async () => {
    if (!passphrase || passphrase !== confirmPassphrase) {
      setBackupStatus('Passphrases do not match.')
      return
    }
    logEvent('security:passphrase', 'Updated wallet passphrase requirements')
    updateSettings({
      security: {
        ...state.settings.security,
        passphraseSet: true,
      },
    })
    setBackupStatus('Passphrase registered for future backups.')
    setPassphrase('')
    setConfirmPassphrase('')
  }

  const handleBackup = async () => {
    if (!state.settings.security.passphraseSet) {
      setBackupStatus('Set a passphrase before creating encrypted backups.')
      return
    }
    if (!passphrase) {
      setBackupStatus('Enter passphrase to encrypt backup.')
      return
    }
    const data = {
      didProfiles: state.didProfiles,
      credentials: state.credentials,
      documents: state.documents,
      proofs: state.proofs,
      requests: state.requests,
    }
    const encoder = new TextEncoder()
    const { key, salt } = await deriveKeyFromPassphrase(passphrase)
    const { encrypted, iv } = await encryptWithKey(key, encoder.encode(JSON.stringify(data)))
    downloadJson('wallet-backup.json', {
      version: 1,
      salt: Array.from(new Uint8Array(salt)),
      iv: Array.from(new Uint8Array(iv)),
      ciphertext: Array.from(new Uint8Array(encrypted)),
    })
    setBackupStatus('Encrypted backup downloaded.')
    setPassphrase('')
    setConfirmPassphrase('')
    logEvent('security:backup', 'Exported encrypted wallet backup')
  }

  const handleIpfsSave = () => {
    updateSettings({
      ipfs: {
        endpoint: ipfsEndpoint,
        token: ipfsToken,
        mode: ipfsMode,
      },
    })
    logEvent('security:ipfs', 'Updated IPFS storage configuration', { mode: ipfsMode })
  }

  return (
    <section className="module-section" id="module-security">
      <header className="module-heading">
        <h2>Wallet Security &amp; Backup</h2>
        <p>Configure encryption, IPFS storage endpoints, and create encrypted recovery bundles.</p>
      </header>

      <div className="panel-grid">
        <div className="panel">
          <h3>Backup passphrase</h3>
          <label className="field">
            <span>New passphrase</span>
            <input type="password" value={passphrase} onChange={(event) => setPassphrase(event.target.value)} />
          </label>
          <label className="field">
            <span>Confirm</span>
            <input type="password" value={confirmPassphrase} onChange={(event) => setConfirmPassphrase(event.target.value)} />
          </label>
          <div className="button-row">
            <button type="button" className="button secondary" onClick={handlePassphrase}>
              Save passphrase
            </button>
            <button type="button" className="button primary" onClick={handleBackup}>
              Encrypted backup
            </button>
          </div>
          {backupStatus ? <div className="alert info">{backupStatus}</div> : null}
        </div>

        <div className="panel">
          <h3>IPFS configuration</h3>
          <label className="field">
            <span>Mode</span>
            <select value={ipfsMode} onChange={(event) => setIpfsMode(event.target.value)}>
              <option value="simulate">Simulate (no upload)</option>
              <option value="client">Client upload (web3.storage/Filebase)</option>
            </select>
          </label>
          <label className="field">
            <span>Endpoint</span>
            <input value={ipfsEndpoint} onChange={(event) => setIpfsEndpoint(event.target.value)} placeholder="https://w3s.link" />
          </label>
          <label className="field">
            <span>Bearer token</span>
            <input
              value={ipfsToken}
              onChange={(event) => setIpfsToken(event.target.value)}
              placeholder="Optional access token"
              type="password"
            />
          </label>
          <button type="button" className="button secondary" onClick={handleIpfsSave}>
            Save configuration
          </button>
        </div>
      </div>
    </section>
  )
}


