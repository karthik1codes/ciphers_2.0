import React from 'react'
import { useIssuer } from '../context/IssuerContext'

export default function IssuerStats() {
  const { state } = useIssuer()
  const cards = [
    {
      label: 'VCs issued',
      value: state.stats.issuedTotal,
      accent: 'accent-primary',
      helper: 'All-time credentials minted by this issuer.',
    },
    {
      label: 'Active credentials',
      value: state.stats.activeCredentials,
      accent: 'accent-success',
      helper: 'Currently valid and shareable credentials.',
    },
    {
      label: 'Revoked',
      value: state.stats.revokedCredentials,
      accent: 'accent-danger',
      helper: 'Credentials revoked on Polygon registry.',
    },
  ]

  return (
    <section id="stats" className="issuer-section stats-section">
      <header className="section-heading">
        <h2>Operational Snapshot</h2>
        <p>Real-time overview of credential lifecycle health.</p>
      </header>
      <div className="stat-cards">
        {cards.map((card) => (
          <article key={card.label} className={`stat-card ${card.accent}`}>
            <span className="stat-label">{card.label}</span>
            <span className="stat-value">{card.value}</span>
            <p>{card.helper}</p>
          </article>
        ))}
      </div>
    </section>
  )
}


