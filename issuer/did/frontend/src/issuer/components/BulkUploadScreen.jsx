import React, { useState } from 'react'

export default function BulkUploadScreen({ onUpload }) {
  const [file, setFile] = useState(null)
  const [mapping, setMapping] = useState({
    name: 'name',
    email: 'email',
    program: 'program',
    year: 'year',
  })
  const [dryRunResults, setDryRunResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
    } else {
      alert('Please select a CSV file')
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile)
    }
  }

  const handleDryRun = async () => {
    if (!file) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('mapping', JSON.stringify(mapping))

      const response = await fetch('/bulk-upload/dry-run', {
        method: 'POST',
        body: formData,
      })
      const results = await response.json()
      setDryRunResults(results)
    } catch (error) {
      console.error('Dry run failed:', error)
      alert('Dry run failed')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!file || !dryRunResults) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('mapping', JSON.stringify(mapping))

      const response = await fetch('/bulk-upload', {
        method: 'POST',
        body: formData,
      })
      const results = await response.json()
      onUpload(results)
      alert(`Successfully uploaded ${results.count} credentials!`)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bulk-upload-screen">
      <h2>Bulk Upload Credentials</h2>

      <div
        className="drop-zone"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="file-input"
          id="csv-upload"
        />
        <label htmlFor="csv-upload" className="drop-zone-label">
          {file ? file.name : 'Drag & drop CSV file or click to select'}
        </label>
      </div>

      {file && (
        <>
          <div className="mapping-section">
            <h3>Column Mapping</h3>
            <div className="mapping-grid">
              <div className="mapping-item">
                <label>Name Column</label>
                <input
                  type="text"
                  value={mapping.name}
                  onChange={(e) => setMapping({ ...mapping, name: e.target.value })}
                />
              </div>
              <div className="mapping-item">
                <label>Email Column</label>
                <input
                  type="text"
                  value={mapping.email}
                  onChange={(e) => setMapping({ ...mapping, email: e.target.value })}
                />
              </div>
              <div className="mapping-item">
                <label>Program Column</label>
                <input
                  type="text"
                  value={mapping.program}
                  onChange={(e) => setMapping({ ...mapping, program: e.target.value })}
                />
              </div>
              <div className="mapping-item">
                <label>Year Column</label>
                <input
                  type="text"
                  value={mapping.year}
                  onChange={(e) => setMapping({ ...mapping, year: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="bulk-actions">
            <button className="btn-secondary" onClick={handleDryRun} disabled={loading}>
              {loading ? 'Running...' : 'Dry Run'}
            </button>
            {dryRunResults && (
              <button className="btn-primary" onClick={handleUpload} disabled={loading}>
                {loading ? 'Uploading...' : 'Upload Credentials'}
              </button>
            )}
          </div>

          {dryRunResults && (
            <div className="dry-run-results">
              <h3>Dry Run Results</h3>
              <div className="results-stats">
                <div className="stat">
                  <span className="stat-label">Total Rows:</span>
                  <span className="stat-value">{dryRunResults.total}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Valid:</span>
                  <span className="stat-value stat-valid">{dryRunResults.valid}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Errors:</span>
                  <span className="stat-value stat-error">{dryRunResults.errors}</span>
                </div>
              </div>
              {dryRunResults.errors > 0 && (
                <div className="error-list">
                  <h4>Errors:</h4>
                  <ul>
                    {dryRunResults.errorDetails?.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

