import React from 'react'
import Header from './components/Header'
import WalletView from './components/WalletView'
import DIDView from './components/DIDView'
import CredentialList from './components/CredentialList'
import ReceivedCredentials from './components/ReceivedCredentials'
import InstitutionIntegration from './components/InstitutionIntegration'
import KeyRecovery from './components/KeyRecovery'
import './App.css'

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <div className="content-wrapper">
          <div className="left-column">
            <WalletView />
            <DIDView />
            <KeyRecovery />
          </div>
          <div className="right-column">
            <InstitutionIntegration />
            <CredentialList />
            <ReceivedCredentials />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App

