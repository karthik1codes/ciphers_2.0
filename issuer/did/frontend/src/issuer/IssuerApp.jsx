import React, { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import StudentTable from './components/StudentTable'
import IssueCredentialModal from './components/IssueCredentialModal'
import IssuedCredentialsView from './components/IssuedCredentialsView'
import CredentialDetailModal from './components/CredentialDetailModal'
import KeyManagementModal from './components/KeyManagementModal'
import RevokeModal from './components/RevokeModal'
import BulkUploadScreen from './components/BulkUploadScreen'
import AuditLogPage from './components/AuditLogPage'
import './issuerApp.css'

export default function IssuerApp() {
  const [activeView, setActiveView] = useState('students')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedCredential, setSelectedCredential] = useState(null)
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [showCredentialModal, setShowCredentialModal] = useState(false)
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [showRevokeModal, setShowRevokeModal] = useState(false)

  // Mock data
  const [issuerName] = useState('University of Technology')
  const [issuerDID] = useState('did:ethr:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')
  const [stats, setStats] = useState({ issued: 42, active: 38, revoked: 4 })
  const [students] = useState([
    { id: 'stu_01', name: 'Aria Fernandez', did: 'did:example:aria', rollNo: 'R2024001', status: 'pending', email: 'aria@example.com' },
    { id: 'stu_02', name: 'Malik Osei', did: 'did:example:malik', rollNo: 'R2024002', status: 'verified', email: 'malik@example.com' },
    { id: 'stu_03', name: 'Jia Li', did: 'did:example:jia', rollNo: 'R2024003', status: 'issued', email: 'jia@example.com' },
  ])
  const [credentials, setCredentials] = useState([
    {
      id: 'cred_001',
      credentialSubject: { name: 'Jia Li', email: 'jia@example.com' },
      issueDate: new Date().toISOString(),
      revoked: false,
      txHash: '0x1234567890abcdef',
    },
  ])
  const [keys] = useState([
    { type: 'BBS+', publicKey: '0xabc123...', txHash: '0xdef456...' },
    { type: 'Ed25519', publicKey: '0x789xyz...', txHash: null },
  ])
  const [auditLogs] = useState([
    { timestamp: new Date().toISOString(), action: 'issue', user: 'Admin', credentialId: 'cred_001', details: 'Issued degree credential', txHash: '0x123...' },
    { timestamp: new Date(Date.now() - 86400000).toISOString(), action: 'verify', user: 'Admin', credentialId: null, details: 'Verified student documents' },
  ])

  const handleViewStudent = (student) => {
    setSelectedStudent(student)
    // Could open a student detail modal here
  }

  const handleVerifyStudent = (student) => {
    // Update student status to verified
    console.log('Verify student:', student)
  }

  const handleIssueCredential = (student) => {
    setSelectedStudent(student)
    setShowIssueModal(true)
  }

  const handleIssueComplete = (vc) => {
    setCredentials([...credentials, { ...vc, issueDate: new Date().toISOString(), revoked: false }])
    setStats({ ...stats, issued: stats.issued + 1, active: stats.active + 1 })
    setShowIssueModal(false)
  }

  const handleViewCredential = (credential) => {
    setSelectedCredential(credential)
    setShowCredentialModal(true)
  }

  const handleRevokeCredential = (credential) => {
    setSelectedCredential(credential)
    setShowRevokeModal(true)
  }

  const handleRevokeComplete = (credential, txHash) => {
    setCredentials(
      credentials.map((c) =>
        c.id === credential.id ? { ...c, revoked: true, txHash } : c
      )
    )
    setStats({ ...stats, revoked: stats.revoked + 1, active: stats.active - 1 })
    setShowRevokeModal(false)
    setShowCredentialModal(false)
  }

  const handleUnrevoke = (credential) => {
    setCredentials(
      credentials.map((c) =>
        c.id === credential.id ? { ...c, revoked: false } : c
      )
    )
    setStats({ ...stats, revoked: stats.revoked - 1, active: stats.active + 1 })
  }

  const handleRotateKeys = async () => {
    // Implement key rotation
    console.log('Rotate keys')
  }

  const renderView = () => {
    switch (activeView) {
      case 'students':
        return (
          <StudentTable
            students={students}
            onView={handleViewStudent}
            onVerify={handleVerifyStudent}
            onIssue={handleIssueCredential}
          />
        )
      case 'issue':
        return (
          <div className="issue-view">
            <h2>Issue Credential</h2>
            <p>Select a student from the Students tab to issue a credential, or use bulk upload.</p>
            <button className="btn-primary" onClick={() => setActiveView('bulk')}>
              Bulk Upload
            </button>
          </div>
        )
      case 'issued':
        return (
          <IssuedCredentialsView
            credentials={credentials}
            onView={handleViewCredential}
            onRevoke={handleRevokeCredential}
          />
        )
      case 'revoke':
        return (
          <div className="revoke-view">
            <h2>Revoke Credential</h2>
            <p>Select a credential from the Issued Credentials tab to revoke it.</p>
          </div>
        )
      case 'did':
        return (
          <div className="did-view">
            <h2>DID Management</h2>
            <button className="btn-primary" onClick={() => setShowKeyModal(true)}>
              Manage Keys
            </button>
          </div>
        )
      case 'audit':
        return <AuditLogPage logs={auditLogs} />
      case 'settings':
        return (
          <div className="settings-view">
            <h2>Settings</h2>
            <p>Settings configuration coming soon...</p>
          </div>
        )
      case 'bulk':
        return <BulkUploadScreen onUpload={(results) => console.log('Upload results:', results)} />
      default:
        return <div>View not found</div>
    }
  }

  return (
    <div className="issuer-app">
      <div className="grid-backdrop" aria-hidden />
      <Header issuerName={issuerName} issuerDID={issuerDID} stats={stats} />
      <div className="issuer-layout">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="issuer-content">
          {renderView()}
        </main>
      </div>

      {/* Modals */}
      <IssueCredentialModal
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        student={selectedStudent}
        onIssue={handleIssueComplete}
      />
      <CredentialDetailModal
        isOpen={showCredentialModal}
        onClose={() => setShowCredentialModal(false)}
        credential={selectedCredential}
        onRevoke={handleRevokeCredential}
        onUnrevoke={handleUnrevoke}
      />
      <KeyManagementModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        keys={keys}
        onRotate={handleRotateKeys}
      />
      <RevokeModal
        isOpen={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        credential={selectedCredential}
        onRevoke={handleRevokeComplete}
      />
    </div>
  )
}
