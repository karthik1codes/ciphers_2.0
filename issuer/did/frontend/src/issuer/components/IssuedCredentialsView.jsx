import React, { useState } from 'react'

export default function IssuedCredentialsView({ credentials, onView, onRevoke }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredCredentials = credentials.filter((cred) => {
    const matchesSearch =
      cred.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cred.credentialSubject?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || cred.revoked === (statusFilter === 'revoked')
    return matchesSearch && matchesStatus
  })

  return (
    <div className="issued-credentials-view">
      <div className="view-header">
        <h2>Issued Credentials</h2>
        <div className="view-controls">
          <input
            type="text"
            placeholder="Search credentials..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>
      </div>

      <div className="credentials-grid">
        {filteredCredentials.length === 0 ? (
          <p className="empty-state">No credentials found</p>
        ) : (
          filteredCredentials.map((cred) => (
            <div key={cred.id} className="credential-card-new">
              <div className="card-header">
                <h3>{cred.credentialSubject?.name || 'Unknown'}</h3>
                <span className={`status-badge ${cred.revoked ? 'badge-revoked' : 'badge-active'}`}>
                  {cred.revoked ? 'Revoked' : 'Active'}
                </span>
              </div>
              <div className="card-body">
                <p><strong>ID:</strong> <code>{cred.id}</code></p>
                <p><strong>Issued:</strong> {new Date(cred.issueDate || Date.now()).toLocaleDateString()}</p>
                {cred.txHash && (
                  <p>
                    <strong>Tx:</strong>{' '}
                    <a
                      href={`https://mumbai.polygonscan.com/tx/${cred.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {cred.txHash.slice(0, 10)}...
                    </a>
                  </p>
                )}
              </div>
              <div className="card-actions">
                <button className="btn-action btn-view" onClick={() => onView(cred)}>
                  View
                </button>
                {!cred.revoked && (
                  <button className="btn-action btn-revoke" onClick={() => onRevoke(cred)}>
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

