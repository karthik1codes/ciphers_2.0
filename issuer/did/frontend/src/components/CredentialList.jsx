import React, { useState } from 'react'
import './CredentialList.css'
import './shared.css'

function CredentialList() {
  const [credentials] = useState([
    {
      id: '1',
      type: 'Education Credential',
      issuer: 'University of Technology',
      issueDate: '2024-01-15',
      status: 'Active',
      holder: 'John Doe'
    },
    {
      id: '2',
      type: 'Professional License',
      issuer: 'Professional Board',
      issueDate: '2024-02-20',
      status: 'Active',
      holder: 'Jane Smith'
    },
    {
      id: '3',
      type: 'Identity Verification',
      issuer: 'Government Agency',
      issueDate: '2024-03-10',
      status: 'Revoked',
      holder: 'Bob Johnson'
    }
  ])

  const getStatusClass = (status) => {
    return status.toLowerCase() === 'active' ? 'status-active' : 'status-revoked'
  }

  return (
    <section className="credential-list">
      <div className="credential-list-header">
        <h2 className="credential-list-title">Issued Credentials</h2>
        <button className="btn btn-primary">Issue New Credential</button>
      </div>
      
      <div className="credential-list-content">
        {credentials.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📜</div>
            <p className="empty-message">No credentials issued yet</p>
            <button className="btn btn-primary">Issue Your First Credential</button>
          </div>
        ) : (
          <div className="credentials-grid">
            {credentials.map((credential) => (
              <div key={credential.id} className="credential-card">
                <div className="credential-header">
                  <h3 className="credential-type">{credential.type}</h3>
                  <span className={`credential-status ${getStatusClass(credential.status)}`}>
                    {credential.status}
                  </span>
                </div>
                <div className="credential-body">
                  <div className="credential-field">
                    <label>Issuer:</label>
                    <span>{credential.issuer}</span>
                  </div>
                  <div className="credential-field">
                    <label>Holder:</label>
                    <span>{credential.holder}</span>
                  </div>
                  <div className="credential-field">
                    <label>Issue Date:</label>
                    <span>{credential.issueDate}</span>
                  </div>
                </div>
                <div className="credential-footer">
                  <button className="btn btn-text">View Details</button>
                  <button className="btn btn-text">Revoke</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default CredentialList

