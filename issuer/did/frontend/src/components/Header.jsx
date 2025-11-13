import React from 'react'
import './Header.css'
import './shared.css'

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="header-title">DID Issuer</h1>
          <span className="header-subtitle">Credential Management System</span>
        </div>
        <div className="header-right">
          <button className="btn btn-primary">Connect Wallet</button>
          <div className="user-info">
            <div className="user-avatar">U</div>
            <span className="user-name">User</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

