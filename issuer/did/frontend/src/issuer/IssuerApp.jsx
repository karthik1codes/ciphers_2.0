import React from 'react'
import { IssuerProvider } from './context/IssuerContext'
import IssuerHeader from './components/IssuerHeader'
import AdminHero from './components/AdminHero'
import IssuerStats from './components/IssuerStats'
import StudentVerification from './components/StudentVerification'
import IssueCredential from './components/IssueCredential'
import IssuedCredentials from './components/IssuedCredentials'
import IssuerKeys from './components/IssuerKeys'
import AuditLogs from './components/AuditLogs'
import RevokeCredentialModal from './components/RevokeCredentialModal'
import './issuerApp.css'

export default function IssuerApp() {
  return (
    <IssuerProvider>
      <div className="issuer-app">
        <div className="grid-backdrop" aria-hidden />
        <IssuerHeader />
        <main>
          <AdminHero />
          <IssuerStats />
          <StudentVerification />
          <IssueCredential />
          <IssuedCredentials />
          <IssuerKeys />
          <AuditLogs />
        </main>
        <footer className="issuer-footer">
          <p>Issuer dashboard for decentralized credential issuance and compliance.</p>
          <p className="footer-meta">Powered by DIDs · BBS+ · Polygon Mumbai</p>
        </footer>
        <RevokeCredentialModal />
      </div>
    </IssuerProvider>
  )
}


