import React, { useMemo, useState } from 'react'
import { useHolderWallet } from '../context/HolderContext'
import { formatDateTime, truncate } from '../utils/ui'

export default function DocumentUpload() {
  const { state, encryptAndStoreDocument } = useHolderWallet()
  const [file, setFile] = useState(null)
  const [credentialId, setCredentialId] = useState('')
  const [description, setDescription] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState('')

  const credentialOptions = useMemo(
    () => state.credentials.map((credential) => ({ id: credential.id, title: credential.title })),
    [state.credentials],
  )

  const documents = state.documents

  const handleUpload = async () => {
    if (!file) {
      setError('Select a file to encrypt and upload.')
      return
    }
    setError('')
    setStatusMessage('Encrypting and storing document…')
    try {
      const result = await encryptAndStoreDocument({
        file,
        credentialId: credentialId || undefined,
        description,
      })
      setStatusMessage(`Stored encrypted document with CID ${result.cid}`)
      setFile(null)
      setDescription('')
      setCredentialId('')
    } catch (err) {
      setError(err.message)
      setStatusMessage('')
    }
  }

  return (
    <section className="module-section" id="module-documents">
      <header className="module-heading">
        <h2>Encrypted Document Upload</h2>
        <p>Encrypt student documents locally and record immutable IPFS references.</p>
      </header>

      <div className="panel-grid">
        <div className="panel upload-panel">
          <h3>Upload artifact</h3>
          <p className="muted">Supported: PDF, PNG, JPG. Maximum size limited by browser memory.</p>
          <label className="field">
            <span>Select file</span>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.gif,.webp"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </label>
          <label className="field">
            <span>Linked credential (optional)</span>
            <select value={credentialId} onChange={(event) => setCredentialId(event.target.value)}>
              <option value="">—</option>
              {credentialOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.title}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Description</span>
            <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="E.g. Official transcript" />
          </label>
          <div className="button-row">
            <button type="button" className="button primary" onClick={handleUpload}>
              Encrypt &amp; upload
            </button>
          </div>
          {statusMessage ? <div className="alert success">{statusMessage}</div> : null}
          {error ? <div className="error-text">{error}</div> : null}
          {file ? (
            <div className="file-preview">
              <span>{file.name}</span>
              <span className="muted">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          ) : null}
        </div>

        <div className="panel">
          <h3>Storage mode</h3>
          <p className="muted">Current IPFS mode: {state.settings.ipfs.mode === 'client' ? 'Direct client upload' : 'Simulation only'}.</p>
          <p className="muted">
            Configure endpoint and token in security settings to enable real uploads via web3.storage or Filebase.
          </p>
        </div>
      </div>

      <div className="table">
        <table>
          <thead>
            <tr>
              <th>Document</th>
              <th>CID</th>
              <th>Hash</th>
              <th>Linked credential</th>
              <th>Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">No documents encrypted yet.</div>
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <div className="cell-main">
                      <strong>{doc.name}</strong>
                      <span className="muted">{doc.description}</span>
                    </div>
                  </td>
                  <td className="mono">{truncate(doc.cid, 16)}</td>
                  <td className="mono">{truncate(doc.hash, 16)}</td>
                  <td>{doc.credentialId ? credentialOptions.find((opt) => opt.id === doc.credentialId)?.title : '—'}</td>
                  <td>{formatDateTime(doc.uploadedAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}


