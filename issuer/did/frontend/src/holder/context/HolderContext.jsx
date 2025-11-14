import React, { createContext, useCallback, useContext, useMemo, useReducer, useState } from 'react'
import { bufferToBase64, bufferToBase64Url, bufferToHex, createPseudoCid, generateRandomId, sha256 } from '../utils/crypto'
import { copyToClipboard, downloadJson } from '../utils/ui'
import { create as createIpfsClient } from 'ipfs-http-client'

const HolderContext = createContext(null)

const initialState = {
  didProfiles: [],
  activeDidId: null,
  inbox: [],
  credentials: [],
  documents: [],
  proofs: [],
  requests: [],
  auditLog: [],
  settings: {
    ipfs: {
      endpoint: 'https://w3s.link',
      token: '',
      mode: 'simulate',
    },
    security: {
      passphraseSet: false,
      autoLockMinutes: 5,
      biometric: false,
    },
  },
}

function holderReducer(state, action) {
  switch (action.type) {
    case 'CREATE_DID': {
      const didProfiles = [...state.didProfiles, action.payload.profile]
      return { ...state, didProfiles, activeDidId: action.payload.profile.id }
    }
    case 'SET_ACTIVE_DID':
      return { ...state, activeDidId: action.payload.didId }
    case 'UPDATE_DID': {
      const didProfiles = state.didProfiles.map((profile) =>
        profile.id === action.payload.id ? { ...profile, ...action.payload.updates } : profile,
      )
      return { ...state, didProfiles }
    }
    case 'IMPORT_DID': {
      const exists = state.didProfiles.find((profile) => profile.did === action.payload.did)
      if (exists) return state
      return { ...state, didProfiles: [...state.didProfiles, action.payload], activeDidId: action.payload.id }
    }
    case 'DELETE_DID': {
      const didProfiles = state.didProfiles.filter((profile) => profile.id !== action.payload.id)
      const activeDidId = state.activeDidId === action.payload.id ? didProfiles[0]?.id ?? null : state.activeDidId
      return { ...state, didProfiles, activeDidId }
    }
    case 'ENQUEUE_CREDENTIAL':
      return { ...state, inbox: [action.payload, ...state.inbox] }
    case 'UPDATE_INBOX_ITEM': {
      const inbox = state.inbox.map((item) => (item.id === action.payload.id ? { ...item, ...action.payload.updates } : item))
      return { ...state, inbox }
    }
    case 'REMOVE_INBOX_ITEM': {
      const inbox = state.inbox.filter((item) => item.id !== action.payload.id)
      return { ...state, inbox }
    }
    case 'ADD_CREDENTIAL':
      return { ...state, credentials: [action.payload, ...state.credentials] }
    case 'UPDATE_CREDENTIAL': {
      const credentials = state.credentials.map((credential) =>
        credential.id === action.payload.id ? { ...credential, ...action.payload.updates } : credential,
      )
      return { ...state, credentials }
    }
    case 'DELETE_CREDENTIAL': {
      const credentials = state.credentials.filter((credential) => credential.id !== action.payload.id)
      return { ...state, credentials }
    }
    case 'ADD_DOCUMENT':
      return { ...state, documents: [action.payload, ...state.documents] }
    case 'UPDATE_DOCUMENT': {
      const documents = state.documents.map((document) =>
        document.id === action.payload.id ? { ...document, ...action.payload.updates } : document,
      )
      return { ...state, documents }
    }
    case 'ATTACH_DOCUMENT': {
      const credentials = state.credentials.map((credential) =>
        credential.id === action.payload.credentialId
          ? {
              ...credential,
              linkedDocuments: Array.from(
                new Set([...(credential.linkedDocuments || []), action.payload.documentId]),
              ),
            }
          : credential,
      )
      return { ...state, credentials }
    }
    case 'ADD_PROOF':
      return { ...state, proofs: [action.payload, ...state.proofs] }
    case 'UPDATE_PROOF': {
      const proofs = state.proofs.map((proof) =>
        proof.id === action.payload.id ? { ...proof, ...action.payload.updates } : proof,
      )
      return { ...state, proofs }
    }
    case 'ADD_REQUEST':
      return { ...state, requests: [action.payload, ...state.requests] }
    case 'UPDATE_REQUEST': {
      const requests = state.requests.map((request) =>
        request.id === action.payload.id ? { ...request, ...action.payload.updates } : request,
      )
      return { ...state, requests }
    }
    case 'ADD_AUDIT_EVENT':
      return { ...state, auditLog: [action.payload, ...state.auditLog] }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }
    default:
      return state
  }
}

async function generateKeyDid(alias) {
  const keyPair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify'])

  const publicKeyBuffer = await crypto.subtle.exportKey('raw', keyPair.publicKey)
  const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey)
  const publicKeyHex = bufferToHex(publicKeyBuffer)
  const privateKeyBase64 = bufferToBase64(privateKeyBuffer)
  const did = `did:key:z${bufferToBase64Url(publicKeyBuffer)}`

  return {
    id: generateRandomId('did'),
    alias: alias || 'Student DID',
    method: 'did:key',
    did,
    createdAt: new Date().toISOString(),
    publicKeyHex,
    privateKeyBase64,
    controllerKeys: {
      publicKey: publicKeyBuffer,
      privateKey: keyPair.privateKey,
    },
  }
}

export function HolderProvider({ children }) {
  const [state, dispatch] = useReducer(holderReducer, initialState)
  const [loadingStates, setLoadingStates] = useState({})

  const setLoading = useCallback((key, value) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }))
  }, [])

  const logEvent = useCallback((type, message, meta = {}) => {
    dispatch({
      type: 'ADD_AUDIT_EVENT',
      payload: {
        id: generateRandomId('event'),
        type,
        message,
        meta,
        createdAt: new Date().toISOString(),
      },
    })
  }, [])

  const createDid = useCallback(
    async ({ alias }) => {
      if (!window.crypto?.subtle) {
        throw new Error('WebCrypto not supported in this environment.')
      }
      setLoading('did', true)
      try {
        const profile = await generateKeyDid(alias)
        dispatch({ type: 'CREATE_DID', payload: { profile } })
        logEvent('did:create', `Created ${profile.method}`, { did: profile.did })
        return profile
      } finally {
        setLoading('did', false)
      }
    },
    [logEvent, setLoading],
  )

  const connectEthrDid = useCallback(
    async ({ alias }) => {
      if (!window.ethereum) {
        throw new Error('MetaMask is required for did:ethr')
      }
      setLoading('did', true)
      try {
        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const did = `did:ethr:${account}`
        const profile = {
          id: generateRandomId('did'),
          alias: alias || 'Ethereum DID',
          method: 'did:ethr',
          did,
          createdAt: new Date().toISOString(),
          account,
        }
        dispatch({ type: 'CREATE_DID', payload: { profile } })
        logEvent('did:connect', 'Connected Ethereum account', { did })
        return profile
      } finally {
        setLoading('did', false)
      }
    },
    [logEvent, setLoading],
  )

  const importDid = useCallback(
    (payload) => {
      dispatch({ type: 'IMPORT_DID', payload })
      logEvent('did:import', 'Imported DID', { did: payload.did })
    },
    [logEvent],
  )

  const exportDid = useCallback(async (profile) => {
    const exportPayload = {
      did: profile.did,
      alias: profile.alias,
      method: profile.method,
      privateKeyBase64: profile.privateKeyBase64,
      publicKeyHex: profile.publicKeyHex,
      createdAt: profile.createdAt,
    }
    downloadJson(`${profile.alias || 'did-backup'}.json`, exportPayload)
  }, [])

  const enqueueCredential = useCallback(
    (rawCredential, source = 'manual', anchor = null) => {
      const id = generateRandomId('inbox')
      
      // Handle response format: { success: true, credential: {...}, anchor: {...} }
      const isResponseFormat = rawCredential.success && rawCredential.credential
      const credential = isResponseFormat ? rawCredential.credential : rawCredential
      const anchorInfo = anchor || rawCredential.anchor || null
      
      dispatch({
        type: 'ENQUEUE_CREDENTIAL',
        payload: {
          id,
          rawCredential: isResponseFormat ? rawCredential : credential,
          parsed: credential,
          anchor: anchorInfo,
          source,
          status: 'pending',
          receivedAt: new Date().toISOString(),
        },
      })
      logEvent('credential:incoming', 'Received credential offer', {
        issuer: credential?.issuer?.id || credential?.issuer,
        type: credential?.type,
        anchored: !!anchorInfo,
      })
      return id
    },
    [logEvent],
  )

  const acceptCredential = useCallback(
    (inboxId, category) => {
      const inboxItem = state.inbox.find((item) => item.id === inboxId)
      if (!inboxItem) return
      
      // Handle both direct credential and response format with anchor
      const responseData = inboxItem.parsed
      const credential = responseData.credential || responseData.vc || responseData
      const anchor = responseData.anchor || inboxItem.anchor
      
      const id = generateRandomId('cred')
      dispatch({
        type: 'ADD_CREDENTIAL',
        payload: {
          id,
          title: credential?.type?.[credential.type.length - 1] || 'Verifiable Credential',
          category,
          issuer: credential?.issuer,
          issuanceDate: credential?.issuanceDate || credential?.validFrom,
          subject: credential?.credentialSubject || {},
          evidence: credential?.evidence || {},
          raw: credential,
          anchor: anchor ? {
            txHash: anchor.txHash,
            blockNumber: anchor.blockNumber,
            explorerUrl: anchor.txHash ? `https://amoy.polygonscan.com/tx/${anchor.txHash}` : null,
          } : null,
          status: 'active',
          receivedAt: inboxItem.receivedAt,
          storedAt: new Date().toISOString(),
          linkedDocuments: [],
          revocationStatus: 'unknown',
        },
      })
      dispatch({ type: 'REMOVE_INBOX_ITEM', payload: { id: inboxId } })
      logEvent('credential:accept', 'Credential stored in vault', { 
        credentialId: id, 
        issuer: credential?.issuer,
        anchored: !!anchor 
      })
    },
    [logEvent, state.inbox],
  )

  const rejectCredential = useCallback(
    (inboxId, reason) => {
      const inboxItem = state.inbox.find((item) => item.id === inboxId)
      if (!inboxItem) return
      dispatch({
        type: 'UPDATE_INBOX_ITEM',
        payload: { id: inboxId, updates: { status: 'rejected', rejectedReason: reason, rejectedAt: new Date().toISOString() } },
      })
      logEvent('credential:reject', 'Credential offer rejected', { issuer: inboxItem.parsed?.issuer, reason })
    },
    [logEvent, state.inbox],
  )

  const deleteCredential = useCallback(
    (credentialId) => {
      dispatch({ type: 'DELETE_CREDENTIAL', payload: { id: credentialId } })
      logEvent('credential:delete', 'Credential removed from vault', { credentialId })
    },
    [logEvent],
  )

  const updateCredential = useCallback((credentialId, updates) => {
    dispatch({ type: 'UPDATE_CREDENTIAL', payload: { id: credentialId, updates } })
  }, [])

  const addDocument = useCallback(
    (payload) => {
      dispatch({ type: 'ADD_DOCUMENT', payload })
      if (payload.credentialId) {
        dispatch({
          type: 'ATTACH_DOCUMENT',
          payload: { credentialId: payload.credentialId, documentId: payload.id },
        })
      }
      logEvent('document:upload', 'Encrypted document stored', {
        cid: payload.cid,
        credentialId: payload.credentialId,
      })
    },
    [logEvent],
  )

  const addProof = useCallback(
    (payload) => {
      dispatch({ type: 'ADD_PROOF', payload })
      logEvent('proof:create', 'Selective disclosure proof generated', {
        credentialId: payload.credentialId,
        proofId: payload.id,
      })
    },
    [logEvent],
  )

  const shareProof = useCallback(
    async (proofId, method = 'clipboard') => {
      const proof = state.proofs.find((item) => item.id === proofId)
      if (!proof) return
      const payload = JSON.stringify(proof.proofPayload, null, 2)
      if (method === 'clipboard') {
        await copyToClipboard(payload)
      } else if (method === 'download') {
        downloadJson(`${proofId}.json`, proof.proofPayload)
      }
      dispatch({
        type: 'UPDATE_PROOF',
        payload: {
          id: proofId,
          updates: {
            shareHistory: [
              {
                id: generateRandomId('share'),
                method,
                at: new Date().toISOString(),
              },
              ...(proof.shareHistory || []),
            ],
          },
        },
      })
      logEvent('proof:share', 'Proof shared', { proofId, method })
    },
    [logEvent, state.proofs],
  )

  const addRequest = useCallback(
    (request) => {
      dispatch({ type: 'ADD_REQUEST', payload: request })
      logEvent('request:receive', 'Verification request received', { requestId: request.id })
    },
    [logEvent],
  )

  const updateRequest = useCallback((requestId, updates) => {
    dispatch({ type: 'UPDATE_REQUEST', payload: { id: requestId, updates } })
  }, [])

  const updateSettings = useCallback((updates) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: updates })
  }, [])

  const encryptAndStoreDocument = useCallback(
    async ({ file, credentialId, description }) => {
      setLoading('document', true)
      try {
        const fileBuffer = await file.arrayBuffer()
        const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
        const iv = crypto.getRandomValues(new Uint8Array(12))
        const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, fileBuffer)
        const exportedKey = await crypto.subtle.exportKey('raw', key)
        const hashBytes = await sha256(fileBuffer)
        const hashHex = bufferToHex(hashBytes.buffer)

        let cid = createPseudoCid(hashHex)
        let uploadResult = null

        if (state.settings.ipfs.mode === 'client' && state.settings.ipfs.endpoint) {
          const client = createIpfsClient({
            url: state.settings.ipfs.endpoint,
            headers: state.settings.ipfs.token
              ? {
                  Authorization: `Bearer ${state.settings.ipfs.token}`,
                }
              : undefined,
          })

          uploadResult = await client.add(encrypted)
          cid = uploadResult.cid.toString()
        }

        const documentRecord = {
          id: generateRandomId('doc'),
          name: file.name,
          cid,
          description: description || '',
          size: file.size,
          mimeType: file.type,
          credentialId: credentialId || null,
          uploadedAt: new Date().toISOString(),
          encryption: {
            iv: bufferToBase64(iv.buffer),
            key: bufferToBase64(exportedKey),
            algorithm: 'AES-GCM',
          },
          hash: hashHex,
          storage: {
            mode: state.settings.ipfs.mode,
            endpoint: state.settings.ipfs.endpoint,
            result: uploadResult,
          },
        }
        addDocument(documentRecord)
        return documentRecord
      } finally {
        setLoading('document', false)
      }
    },
    [addDocument, setLoading, state.settings.ipfs],
  )

  const generateProof = useCallback(
    ({ credentialId, fields, challenge }) => {
      const credential = state.credentials.find((item) => item.id === credentialId)
      if (!credential) {
        throw new Error('Credential not found')
      }
      const payload = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiablePresentation'],
        holder: state.activeDidId ? state.didProfiles.find((profile) => profile.id === state.activeDidId)?.did : null,
        verifiableCredential: {
          id: credential.raw?.id || credentialId,
          issuer: credential.issuer,
          credentialSubject: {},
          evidence: credential.evidence,
        },
        proof: {
          type: 'BbsBlsSignature2020',
          created: new Date().toISOString(),
          challenge: challenge || generateRandomId('challenge'),
          nonce: bufferToBase64Url(crypto.getRandomValues(new Uint8Array(24)).buffer),
          proofValue: bufferToBase64Url(crypto.getRandomValues(new Uint8Array(64)).buffer),
        },
      }

      fields.forEach((path) => {
        const [root, key] = path.split('.')
        if (root === 'credentialSubject') {
          payload.verifiableCredential.credentialSubject[key] = credential.subject[key]
        } else if (root === 'evidence') {
          payload.verifiableCredential.evidence = {
            ...(payload.verifiableCredential.evidence || {}),
            [key]: credential.evidence[key],
          }
        }
      })

      const proofRecord = {
        id: generateRandomId('proof'),
        credentialId,
        generatedAt: new Date().toISOString(),
        challenge: payload.proof.challenge,
        nonce: payload.proof.nonce,
        revealedFields: fields,
        proofPayload: payload,
        shareHistory: [],
      }

      addProof(proofRecord)
      return proofRecord
    },
    [addProof, state.activeDidId, state.credentials, state.didProfiles],
  )

  const checkRevocation = useCallback(
    async (credentialId) => {
      const statusPool = ['valid', 'revoked', 'unknown']
      const random = statusPool[Math.floor(Math.random() * statusPool.length)]
      updateCredential(credentialId, {
        revocationStatus: random,
        lastRevocationCheck: new Date().toISOString(),
      })
      logEvent('credential:revocation', 'Revocation status updated', { credentialId, status: random })
      return random
    },
    [logEvent, updateCredential],
  )

  const value = useMemo(
    () => ({
      state,
      loadingStates,
      createDid,
      connectEthrDid,
      importDid,
      exportDid,
      enqueueCredential,
      acceptCredential,
      rejectCredential,
      deleteCredential,
      addDocument,
      encryptAndStoreDocument,
      generateProof,
      shareProof,
      addRequest,
      updateRequest,
      updateSettings,
      checkRevocation,
      logEvent,
      setActiveDid: (didId) => dispatch({ type: 'SET_ACTIVE_DID', payload: { didId } }),
    }),
    [
      acceptCredential,
      addDocument,
      addRequest,
      checkRevocation,
      connectEthrDid,
      createDid,
      deleteCredential,
      encryptAndStoreDocument,
      exportDid,
      generateProof,
      importDid,
      loadingStates,
      logEvent,
      enqueueCredential,
      rejectCredential,
      shareProof,
      state,
      updateRequest,
      updateSettings,
    ],
  )

  return <HolderContext.Provider value={value}>{children}</HolderContext.Provider>
}

export function useHolderWallet() {
  const context = useContext(HolderContext)
  if (!context) throw new Error('useHolderWallet must be used within HolderProvider')
  return context
}


