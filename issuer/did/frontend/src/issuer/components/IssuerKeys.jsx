import React from 'react'
import { useIssuer } from '../context/IssuerContext'
import { copyToClipboard, formatDateTime, truncate } from '../../holder/utils/ui'

export default function IssuerKeys() {
  const { state, rotateKeys } = useIssuer()
  const { did, publicKey, bbsKey, createdAt, lastRotated } = state.didProfile

  return (
    <section id="keys" className="issuer-section">
      <header className="section-heading">
        <h2>Issuer DID &amp; Keys</h2>
        <p>Manage DID documents, signature keys, and BBS+ public parameters for verifiable credentials.</p>
      </header>
      <div className="key-card">
        <div className="key-grid">
          <div>
            <span className="label">Issuer DID</span>
            <code>{did}</code>
            <button type="button" className="button ghost small" onClick={() => copyToClipboard(did)}>
              Copy DID
            </button>
          </div>
          <div>
            <span className="label">Public key</span>
            <code className="mono">{truncate(publicKey, 40)}</code>
            <button type="button" className="button ghost small" onClick={() => copyToClipboard(publicKey)}>
              Copy key
            </button>
          </div>
          <div>
            <span className="label">BBS+ public key</span>
            <code className="mono">{bbsKey}</code>
          </div>
          <div>
            <span className="label">Issued</span>
            <span>{formatDateTime(createdAt)}</span>
          </div>
          <div>
            <span className="label">Last rotated</span>
            <span>{formatDateTime(lastRotated)}</span>
          </div>
        </div>
        <div className="button-row">
          <button type="button" className="button secondary" onClick={rotateKeys}>
            Rotate keys
          </button>
        </div>
      </div>
    </section>
  )
}


