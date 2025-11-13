import React, { useMemo, useState } from 'react'

const sampleSummary =
  'Candidate verified Bachelor of Science in Computer Science with honors. Proven blockchain research experience and leadership in developer DAO.'
const sampleRisks = ['Issuer did:web:college.example is trusted', 'No revocation events detected', 'CID hash matches evidence']

export default function AIInsightsPanel() {
  const [riskPreference, setRiskPreference] = useState(30)
  const [summary, setSummary] = useState(sampleSummary)
  const [risks, setRisks] = useState(sampleRisks)
  const [fraudFlag, setFraudFlag] = useState(false)

  const fraudIndicators = useMemo(
    () => [
      { label: 'Duplicate wallet across candidates', active: fraudFlag },
      { label: 'Credential reused in multiple VPs', active: false },
      { label: 'Holder geolocation mismatch', active: false },
    ],
    [fraudFlag],
  )

  const runAI = () => {
    setSummary(sampleSummary)
    setRisks(sampleRisks)
    setFraudFlag(Math.random() > 0.7)
  }

  return (
    <section className="recruiter-card">
      <header className="card-header">
        <div>
          <h3>AI insights & risk scoring</h3>
          <p className="muted">Summarize credentials, highlight risks, and detect fraud patterns.</p>
        </div>
        <button type="button" className="button ghost small" onClick={runAI}>
          Regenerate
        </button>
      </header>
      <div className="ai-summary">
        <strong>AI summary</strong>
        <p>{summary}</p>
      </div>
      <div className="risk-score">
        <label htmlFor="risk">Risk tolerance ({riskPreference}%)</label>
        <input
          id="risk"
          type="range"
          min="0"
          max="100"
          value={riskPreference}
          onChange={(event) => setRiskPreference(Number(event.target.value))}
        />
      </div>
      <div className="risk-list">
        <strong>Risk checklist</strong>
        <ul>
          {risks.map((item) => (
            <li key={item}>✔ {item}</li>
          ))}
        </ul>
      </div>
      <div className="fraud-detection">
        <strong>Fraud detection</strong>
        <ul>
          {fraudIndicators.map((indicator) => (
            <li key={indicator.label} className={indicator.active ? 'alert' : ''}>
              {indicator.active ? '⚠' : '•'} {indicator.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}


