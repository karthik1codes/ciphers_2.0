import React, { useMemo, useState } from 'react'
import { useIssuer } from '../context/IssuerContext'
import { formatDateTime, truncate } from '../../holder/utils/ui'

export default function StudentVerification() {
  const { state, verifyStudent, attachStudentDocument } = useIssuer()
  const [selectedId, setSelectedId] = useState(null)
  const [note, setNote] = useState('')
  const [newDocument, setNewDocument] = useState('')

  const pendingStudents = useMemo(() => state.students.filter((student) => student.status === 'pending'), [state.students])
  const selectedStudent = useMemo(() => state.students.find((student) => student.id === selectedId), [state.students, selectedId])

  const handleVerify = () => {
    if (!selectedStudent) return
    verifyStudent(selectedStudent.id, note)
    setNote('')
  }

  const handleDocumentUpload = () => {
    if (!selectedStudent || !newDocument) return
    attachStudentDocument(selectedStudent.id, newDocument)
    setNewDocument('')
  }

  return (
    <section id="verification" className="issuer-section">
      <header className="section-heading">
        <h2>Student Verification</h2>
        <p>Review student submissions, attach supporting evidence, and approve for credential issuance.</p>
      </header>
      <div className="two-column">
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Program</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {pendingStudents.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">No students awaiting verification.</div>
                  </td>
                </tr>
              ) : (
                pendingStudents.map((student) => (
                  <tr
                    key={student.id}
                    className={selectedId === student.id ? 'selected' : ''}
                    onClick={() => setSelectedId(student.id)}
                  >
                    <td>
                      <div className="cell-main">
                        <strong>{student.name}</strong>
                        <span className="muted">{student.email}</span>
                      </div>
                    </td>
                    <td>{student.program}</td>
                    <td>
                      <span className="status-pill status-pending">pending</span>
                    </td>
                    <td>{formatDateTime(student.lastUpdated)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          {selectedStudent ? (
            <>
              <header className="card-header">
                <div>
                  <h3>{selectedStudent.name}</h3>
                  <p className="muted">{selectedStudent.email}</p>
                </div>
                <span className="tag subtle">Cohort {selectedStudent.cohort}</span>
              </header>

              <section>
                <h4>Submitted documents</h4>
                <ul className="chip-list">
                  {selectedStudent.submittedDocs?.length ? (
                    selectedStudent.submittedDocs.map((doc) => (
                      <li key={doc} className="chip">
                        {truncate(doc, 24)}
                      </li>
                    ))
                  ) : (
                    <li className="muted">No documents uploaded.</li>
                  )}
                </ul>
              </section>

              <section>
                <h4>Notes</h4>
                <p className="muted">{selectedStudent.notes || '—'}</p>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Add internal note before verifying…"
                  rows={3}
                />
              </section>

              <section className="field">
                <span>Attach supporting doc</span>
                <div className="attachment-row">
                  <input
                    placeholder="e.g., RegistrarApproval.pdf"
                    value={newDocument}
                    onChange={(event) => setNewDocument(event.target.value)}
                  />
                  <button type="button" className="button ghost small" onClick={handleDocumentUpload}>
                    Upload
                  </button>
                </div>
              </section>

              <div className="button-row">
                <button type="button" className="button primary" onClick={handleVerify}>
                  Verify &amp; Approve
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>Select a student from the queue to review evidence and verify.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}


