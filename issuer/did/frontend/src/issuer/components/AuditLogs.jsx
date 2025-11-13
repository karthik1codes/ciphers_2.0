import React from 'react'
import { useIssuer } from '../context/IssuerContext'
import { formatDateTime } from '../../holder/utils/ui'

export default function AuditLogs() {
  const { state } = useIssuer()

  return (
    <section id="logs" className="issuer-section">
      <header className="section-heading">
        <h2>Audit Trail</h2>
        <p>Every issuance, revocation, and key rotation captured for compliance review.</p>
      </header>
      <div className="timeline">
        {state.auditLog.length === 0 ? (
          <div className="empty-state">
            <p>No events recorded yet.</p>
          </div>
        ) : (
          state.auditLog.map((event) => (
            <article key={event.id} className="timeline-item">
              <div className="timeline-dot" />
              <div>
                <h3>{event.action}</h3>
                <p className="muted">
                  {event.actor} → {event.target}
                </p>
                <span className="timestamp">{formatDateTime(event.timestamp)}</span>
                {event.meta ? (
                  <details className="json-view">
                    <summary>Metadata</summary>
                    <pre>{JSON.stringify(event.meta, null, 2)}</pre>
                  </details>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}


