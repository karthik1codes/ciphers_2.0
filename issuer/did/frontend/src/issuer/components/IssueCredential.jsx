import React, { useMemo, useState } from 'react'
import { useIssuer } from '../context/IssuerContext'
import { copyToClipboard } from '../../holder/utils/ui'

const proofOptions = [
  { value: 'BBS+', label: 'BBS+ (selective disclosure, recommended)' },
  { value: 'Ed25519', label: 'Ed25519 (standard JSON-LD signature)' },
]

export default function IssueCredential() {
  const { state, issueCredential } = useIssuer()
  const verifiedStudents = useMemo(() => state.students.filter((student) => student.status === 'verified'), [state.students])
  const [selectedStudentId, setSelectedStudentId] = useState(verifiedStudents[0]?.id || '')
  const [credentialTitle, setCredentialTitle] = useState('')
  const [evidenceCid, setEvidenceCid] = useState('')
  const [proofType, setProofType] = useState(proofOptions[0].value)
  const [preview, setPreview] = useState(null)
  const [status, setStatus] = useState('')

  const selectedStudent = useMemo(() => state.students.find((student) => student.id === selectedStudentId), [
    selectedStudentId,
    state.students,
  ])

  const autoPopulateTitle = (student) => {
    if (!student) return ''
    return `${student.program} • Class of ${student.cohort}`
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!selectedStudentId) {
      setStatus('Select a verified student before issuing.')
      return
    }
    try {
      const credential = issueCredential({
        studentId: selectedStudentId,
        credentialType: credentialTitle || autoPopulateTitle(selectedStudent),
        proofType,
        evidenceCid,
      })
      const previewPayload = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', credential.type],
        issuer: state.didProfile.did,
        issuanceDate: credential.issuedAt,
        credentialSubject: {
          id: selectedStudent?.id,
          name: selectedStudent?.name,
          program: selectedStudent?.program,
          cohort: selectedStudent?.cohort,
        },
        evidence: evidenceCid ? { cid: evidenceCid } : undefined,
        proof: {
          type: proofType === 'BBS+' ? 'BbsBlsSignature2020' : 'Ed25519Signature2020',
          created: credential.issuedAt,
          proofPurpose: 'assertionMethod',
          verificationMethod: `${state.didProfile.did}#keys-1`,
        },
      }
      setPreview({ credential, payload: previewPayload })
      setStatus('Credential signed and queued for delivery to holder.')
    } catch (err) {
      setStatus(err.message)
    }
  }

  const handleCopyPayload = async () => {
    if (!preview) return
    copyToClipboard(JSON.stringify(preview.payload, null, 2))
    setStatus('Credential payload copied to clipboard.')
  }

  return (
    <section id="issue" className="issuer-section">
      <header className="section-heading">
        <h2>Issue Credential</h2>
        <p>Select a verified student, attach credential evidence, choose proof type, and mint the verifiable credential.</p>
      </header>

      <form className="issue-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>Student</span>
            <select value={selectedStudentId} onChange={(event) => setSelectedStudentId(event.target.value)}>
              <option value="">Select verified student</option>
              {verifiedStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} · {student.program}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Credential title</span>
            <input
              value={credentialTitle}
              onChange={(event) => setCredentialTitle(event.target.value)}
              placeholder="e.g., Bachelor of Science in Computer Science"
            />
          </label>

          <label className="field">
            <span>Evidence CID</span>
            <input
              value={evidenceCid}
              onChange={(event) => setEvidenceCid(event.target.value)}
              placeholder="bafybeigdyrq6..."
            />
          </label>

          <label className="field">
            <span>Proof type</span>
            <select value={proofType} onChange={(event) => setProofType(event.target.value)}>
              {proofOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="button-row">
          <button type="submit" className="button primary">
            Issue credential
          </button>
          {selectedStudent ? (
            <button
              type="button"
              className="button ghost"
              onClick={() => setCredentialTitle(autoPopulateTitle(selectedStudent))}
            >
              Auto-populate title
            </button>
          ) : null}
        </div>
        {status ? <p className="muted">{status}</p> : null}
      </form>

      {preview ? (
        <div className="module-card">
          <header className="module-card-header">
            <div>
              <h3>Signed credential preview</h3>
              <p className="muted">Credential ID {preview.credential.id}</p>
            </div>
            <span className="tag">{preview.credential.proofType}</span>
          </header>
          <div className="detail-grid">
            <div>
              <span className="label">Student</span>
              <span>{preview.credential.studentName}</span>
            </div>
            <div>
              <span className="label">Txn hash</span>
              <span className="mono">{preview.credential.txHash.slice(0, 18)}…</span>
            </div>
            <div>
              <span className="label">Evidence CID</span>
              <span className="mono">{preview.credential.evidenceCid || '—'}</span>
            </div>
          </div>
          <details className="json-view">
            <summary>JSON-LD payload</summary>
            <pre>{JSON.stringify(preview.payload, null, 2)}</pre>
          </details>
          <div className="button-row">
            <button type="button" className="button ghost" onClick={handleCopyPayload}>
              Copy payload
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}


