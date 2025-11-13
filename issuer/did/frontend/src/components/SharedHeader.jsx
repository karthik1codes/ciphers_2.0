import React from 'react'

export default function SharedHeader({ activeTab = 'landing' }) {
  const tabs = [
    { id: 'holder', label: 'Holder Wallet', href: '/holder-wallet.html' },
    { id: 'recruiter', label: 'Recruiter', href: '/recruiter.html' },
    { id: 'issuer', label: 'Issuer', href: '/issuer.html' },
    { id: 'metamask', label: 'Login', href: '/metamask.html' },
  ]

  return (
    <header className="main-header">
      <div className="header-brand">
        <a href="/index.html" className="logo-link logo-tab">
          <span className="logo">CIPHERS</span>
        </a>
      </div>
      <nav className="header-nav">
        {tabs.map((tab) => (
          <a
            key={tab.id}
            href={tab.href}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </a>
        ))}
      </nav>
    </header>
  )
}

