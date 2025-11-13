import React, { useMemo, useState } from 'react'
import { useHolderWallet } from '../context/HolderContext'
import { formatDateTime } from '../utils/ui'

function FieldSelector({ availableFields, selectedFields, setSelectedFields }) {
  const toggleField = (field) => {
    setSelectedFields((prev) => (prev.includes(field) ? prev.filter((item) => item !== field) : [...prev, field]))
  }

  return (
    <div className="field-selector">
      {availableFields.length === 0 ? <p className="muted">No revealable fields.</p> : null}
      {availableFields.map((field) => (
        <label key={field} className="checkbox">
          <input type="checkbox" checked={selectedFields.includes(field)} onChange={() => toggleField(field)} />
          <span>{field}</span>
        </label>
      ))}
    </div>
  )
}

export default function SelectiveDisclosure() {
  const { state, generateProof } = useHolderWallet()
  const [credentialId, setCredentialId] = useState('')
  const [challenge, setChallenge] = useState('')
  const [selectedFields, setSelectedFields] = useState([])
  const [proofResult, setProofResult] = useState(null)
  const [error, setError] = useState('')

  const credential = useMemo(() => state.credentials.find((item) => item.id === credentialId), [state.credentials, credentialId])
  const availableFields = useMemo(() => {
    if (!credential) return []
    const subjectFields = Object.keys(credential.subject || {}).map((key) => `credentialSubject.${key}`)
    const evidenceFields = Object.keys(credential.evidence || {}).map((key) => `evidence.${key}`)
    return [...subjectFields, ...evidenceFields]
  }, [credential])

  const handleGenerate = () => {
    setError('')
    if (!credentialId) {
      setError('Select a credential to derive a proof from.')
      return
    }
    if (selectedFields.length === 0) {
      setError('Choose at least one field to reveal.')
      return
    }
    try {
      const proof = generateProof({ credentialId, fields: selectedFields, challenge })
      setProofResult(proof)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="module-section" id="module-selective">
      <header className="module-heading">
        <h2>Selective Disclosure</h2>
        <p>Compose BBS+ derived proofs tailored to verifier presentation requests.</p>
      </header>

      <div className="panel-grid">
        <div className="panel">
          <h3>Select credential</h3>
          <label className="field">
            <span>Credential</span>
            <select value={credentialId} onChange={(event) => setCredentialId(event.target.value)}>
              <option value="">Choose credential</option>
              {state.credentials.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Verifier challenge / nonce</span>
            <input value={challenge} onChange={(event) => setChallenge(event.target.value)} placeholder="Optional challenge string" />
          </label>
        </div>

        <div className="panel">
          <h3>Reveal fields</h3>
          <FieldSelector availableFields={availableFields} selectedFields={selectedFields} setSelectedFields={setSelectedFields} />
        </div>
      </div>

      <div className="button-row">
        <button type="button" className="button primary" onClick={handleGenerate}>
          Generate derived proof
        </button>
      </div>
      {error ? <div className="error-text">{error}</div> : null}

      {proofResult ? (
        <div className="module-card proof-card">
          <header className="module-card-header">
            <div>
              <h3>Derived proof ready</h3>
              <p className="muted">Generated {formatDateTime(proofResult.generatedAt)}</p>
            </div>
            <span className="tag">Nonce {proofResult.nonce.slice(0, 8)}…</span>
          </header>
          <div className="detail-grid">
            <div>
              <span className="label">Revealed fields</span>
              <span>{proofResult.revealedFields.join(', ')}</span>
            </div>
            <div>
              <span className="label">Challenge</span>
              <span>{proofResult.challenge}</span>
            </div>
          </div>
          <details className="json-view">
            <summary>Proof payload</summary>
            <pre>{JSON.stringify(proofResult.proofPayload, null, 2)}</pre>
          </details>
        </div>
      ) : null}
    </section>
  )
}


