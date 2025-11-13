import React, { useState } from 'react'

export default function RevokeModal({ isOpen, onClose, credential, onRevoke }) {
  const [twoFA, setTwoFA] = useState('')
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState(null)

  if (!isOpen || !credential) return null

  const handleRevoke = async () => {
    if (!twoFA) {
      alert('Please enter 2FA code')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentialId: credential.id,
          twoFA,
        }),
      })
      const result = await response.json()
      setTxHash(result.txHash)
      onRevoke(credential, result.txHash)
    } catch (error) {
      console.error('Failed to revoke:', error)
      alert('Failed to revoke credential')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Revoke Credential</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="revoke-impact">
            <h3>Impact Assessment</h3>
            <ul>
              <li>Credential ID: <code>{credential.id}</code></li>
              <li>Holder: {credential.credentialSubject?.name || 'Unknown'}</li>
              <li>This action cannot be undone</li>
              <li>All verifiers will see this credential as revoked</li>
            </ul>
          </div>

          <div className="form-group">
            <label>2FA Code</label>
            <input
              type="text"
              value={twoFA}
              onChange={(e) => setTwoFA(e.target.value)}
              placeholder="Enter 2FA code"
              maxLength="6"
            />
          </div>

          {txHash && (
            <div className="tx-success">
              <p>✅ Revocation successful!</p>
              <a
                href={`https://mumbai.polygonscan.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Transaction: {txHash.slice(0, 10)}...
              </a>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-danger"
            onClick={handleRevoke}
            disabled={loading || !!txHash}
          >
            {loading ? 'Revoking...' : txHash ? 'Revoked' : 'Confirm Revoke'}
          </button>
        </div>
      </div>
    </div>
  )
}

