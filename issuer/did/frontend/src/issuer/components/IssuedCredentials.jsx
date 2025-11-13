import React, { useMemo, useState } from 'react'
import { useIssuer } from '../context/IssuerContext'
import { formatDateTime, truncate } from '../../holder/utils/ui'

export default function IssuedCredentials() {
  const { state, openRevokeModal } = useIssuer()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    return state.issuedCredentials.filter((credential) => {
      const matchesSearch =
        credential.studentName.toLowerCase().includes(search.toLowerCase()) ||
        credential.type.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || credential.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [search, state.issuedCredentials, statusFilter])

  return (
    <section id="issued" className="issuer-section">
      <header className="section-heading">
        <h2>Issued Credentials</h2>
        <p>Search, inspect, and manage the credentials minted by this issuer.</p>
      </header>

      <div className="toolbar">
        <div className="field">
          <span>Search</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Student or credential title" />
        </div>
        <div className="field">
          <span>Status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>
      </div>

      <div className="table">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Credential</th>
              <th>Issued</th>
              <th>Proof</th>
              <th>Tx hash</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">No credentials match the current filters.</div>
                </td>
              </tr>
            ) : (
              filtered.map((credential) => (
                <tr key={credential.id}>
                  <td>
                    <div className="cell-main">
                      <strong>{credential.studentName}</strong>
                      <span className="muted">{credential.studentId}</span>
                    </div>
                  </td>
                  <td>{credential.type}</td>
                  <td>{formatDateTime(credential.issuedAt)}</td>
                  <td>
                    <span className="tag subtle">{credential.proofType}</span>
                  </td>
                  <td className="mono">{truncate(credential.txHash, 16)}</td>
                  <td>
                    <div className="button-row">
                      <button type="button" className="button ghost small" onClick={() => window.alert(JSON.stringify(credential, null, 2))}>
                        View VC
                      </button>
                      {credential.status === 'active' ? (
                        <button type="button" className="button danger small" onClick={() => openRevokeModal(credential.id)}>
                          Revoke
                        </button>
                      ) : (
                        <span className="status-pill status-revoked">revoked</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}


