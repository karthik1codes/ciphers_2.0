import React from 'react'
import { useIssuer } from '../context/IssuerContext'

export default function AdminHero() {
  const { state } = useIssuer()

  return (
    <section className="hero issuer-hero">
      <div className="hero-copy">
        <h1>Credential operations hub</h1>
        <p>
          Verify learners, mint verifiable credentials, and sync revocations to Polygon. The admin console centralizes
          every touchpoint between institution and student wallet.
        </p>
        <div className="hero-actions">
          <a href="#verification" className="button primary">
            Review pending students
          </a>
          <a href="#issue" className="button ghost">
            Issue a credential
          </a>
        </div>
      </div>
      <aside className="hero-summary">
        <div className="summary-card">
          <span className="summary-label">Active VCs</span>
          <h2>{state.stats.activeCredentials}</h2>
          <p>Credentials currently endorsed by the institution.</p>
        </div>
        <div className="summary-card">
          <span className="summary-label">Revocation health</span>
          <h2>{state.stats.revokedCredentials}</h2>
          <p>Entries synced to Polygon revocation registry.</p>
        </div>
        <div className="summary-card">
          <span className="summary-label">Issuer DID</span>
          <h2>{state.didProfile.did.split(':').slice(-1)}</h2>
          <p>Copy, rotate, and share with verifiers.</p>
        </div>
      </aside>
    </section>
  )
}


