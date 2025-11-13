import React, { useState } from 'react'
import { useIssuer } from '../context/IssuerContext'

export default function RevokeCredentialModal() {
  const { state, uiState, closeRevokeModal, revokeCredential } = useIssuer()
  const [reason, setReason] = useState('')
  const [code, setCode] = useState('')
  const credential = state.issuedCredentials.find((item) => item.id === uiState.revokeModal.credentialId)

  if (!uiState.revokeModal.open) return null

  const handleConfirm = () => {
    if (!code || code.length < 4) return
    revokeCredential(uiState.revokeModal.credentialId, reason || 'No reason provided')
    setReason('')
    setCode('')
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <header>
          <h3>Revoke credential</h3>
          <p className="muted">
            This action publishes a revocation event on-chain. Provide justification and confirm with your 2FA code.
          </p>
        </header>
        <div className="modal-body">
          {credential ? (
            <div className="modal-summary">
              <span className="label">Target</span>
              <strong>{credential.studentName}</strong>
              <span className="muted">{credential.type}</span>
            </div>
          ) : null}
          <label className="field">
            <span>Reason</span>
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explain why this credential is being revoked…" />
          </label>
          <label className="field">
            <span>2FA code</span>
            <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Enter 6-digit TOTP" />
          </label>
        </div>
        <div className="button-row">
          <button type="button" className="button ghost" onClick={() => closeRevokeModal()}>
            Cancel
          </button>
          <button type="button" className="button danger" onClick={handleConfirm} disabled={!code}>
            Confirm revoke
          </button>
        </div>
      </div>
    </div>
  )
}


