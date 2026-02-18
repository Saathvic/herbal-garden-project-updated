import { useState, useRef, useEffect } from 'react'
import plantData from '../plantData.json'
import useImageUpload from '../hooks/useImageUpload'

const BACKEND = 'http://localhost:3000'

/**
 * GalleryPanel – futuristic hologram overlay that shows community-uploaded
 * plant images in a grid, with an upload button.
 *
 * Props:
 *   plantId      – bed id e.g. "nw-1"
 *   isOpen       – boolean
 *   onClose      – () => void
 */
export default function GalleryPanel({ plantId, isOpen, onClose }) {
  const plant = plantData[plantId] || {}
  const fileRef = useRef()
  const { uploading, error, handleFileSelect, identifyPlant, identifying, identifyError } = useImageUpload()

  // Local gallery store (in a real app this would be persisted / fetched)
  const [images, setImages] = useState([])
  const [lightbox, setLightbox] = useState(null)  // index or null
  const [aiResult, setAiResult] = useState(null)
  // Track the last uploaded File and its GPS data
  const [lastUploadedFile, setLastUploadedFile] = useState(null)
  const [lastGpsData, setLastGpsData] = useState({ latitude: null, longitude: null })
  
  // Stored plant locations from database
  const [storedLocations, setStoredLocations] = useState([])
  const [loadingLocations, setLoadingLocations] = useState(false)

  // Load stored plant locations when gallery opens
  useEffect(() => {
    if (isOpen && plantId) {
      loadStoredLocations()
    }
  }, [isOpen, plantId])

  const loadStoredLocations = async () => {
    setLoadingLocations(true)
    try {
      const res = await fetch(`${BACKEND}/plant-locations/${plantId}`)
      if (res.ok) {
        const data = await res.json()
        setStoredLocations(data.locations || [])
      }
    } catch (err) {
      console.error('Failed to load stored locations:', err)
    } finally {
      setLoadingLocations(false)
    }
  }

  if (!isOpen) return null

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const record = await handleFileSelect(file, plantId)
    if (record) {
      setImages((prev) => [record, ...prev])
      setLastUploadedFile(file)
      setLastGpsData({ latitude: record.latitude, longitude: record.longitude })
      setAiResult(null)
    }
    // Reset so the same file can be re-selected
    e.target.value = ''
  }

  const onIdentify = async () => {
    if (!lastUploadedFile) return
    console.log('🔍 Starting plant identification...')
    console.log('File:', lastUploadedFile.name, lastUploadedFile.type, lastUploadedFile.size)
    console.log('GPS data:', lastGpsData)
    console.log('Plant ID:', plantId)
    
    const res = await identifyPlant(lastUploadedFile, lastGpsData, plantId)
    console.log('Identification result:', res)
    
    if (res) {
      setAiResult(res)
      // Reload stored locations to show the new entry
      if (res.location_stored) {
        loadStoredLocations()
      }
    }
  }

  const stopProp = (e) => e.stopPropagation()

  return (
    <div className="gp-overlay" onPointerDown={stopProp} onClick={stopProp} onMouseDown={stopProp}>
      <div className="gp-panel">
        {/* Corner accents */}
        <span className="gp-corner gp-tl" />
        <span className="gp-corner gp-tr" />
        <span className="gp-corner gp-bl" />
        <span className="gp-corner gp-br" />

        {/* Header */}
        <div className="gp-header">
          <div className="gp-title-row">
            <span className="gp-icon">◈</span>
            <span className="gp-title">COMMUNITY GALLERY</span>
          </div>
          <button className="gp-close" onClick={onClose}>✕</button>
        </div>

        <div className="gp-divider" />

        <div className="gp-plant-name">{plant.name || plantId}</div>
        <div className="gp-plant-sci">{plant.scientific || ''}</div>

        {/* Upload bar */}
        <div className="gp-upload-bar">
          <button
            className="gp-upload-btn"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? '⏳ Processing…' : '＋ Upload Photo'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={onFile}
          />
        </div>

        {error && <div className="gp-error">⚠ {error}</div>}
        {identifyError && <div className="gp-error">⚠ {identifyError}</div>}

        {/* Identify Plant button — shown after an image is uploaded */}
        {lastUploadedFile && !aiResult && (
          <button
            className="gp-identify-btn"
            disabled={identifying}
            onClick={onIdentify}
          >
            {identifying ? (
              <><span className="gp-spinner" /> Identifying…</>
            ) : (
              '🔍 Identify Plant'
            )}
          </button>
        )}

        {/* AI identification result card */}
        {aiResult && (
          <div className="gp-ai-card">
            <div className="gp-ai-card-header">🌿 AI Identification</div>
            <div className="gp-ai-row">
              <span className="gp-ai-label">Plant</span>
              <strong className="gp-ai-value">{aiResult.identified_plant || 'Unknown'}</strong>
            </div>
            {aiResult.medical_value && (
              <div className="gp-ai-row">
                <span className="gp-ai-label">Medical Value</span>
                <span className="gp-ai-value">{aiResult.medical_value}</span>
              </div>
            )}
            
            {/* Location information extracted from image */}
            {aiResult.location_from_image && aiResult.location_from_image.has_geotag_overlay && (
              <div className="gp-location-section">
                <div className="gp-location-header">📍 Location from Image</div>
                {aiResult.location_from_image.address && (
                  <div className="gp-location-row">
                    <span className="gp-location-label">Address</span>
                    <span className="gp-location-value">{aiResult.location_from_image.address}</span>
                  </div>
                )}
                {(aiResult.location_from_image.city || aiResult.location_from_image.state || aiResult.location_from_image.country) && (
                  <div className="gp-location-row">
                    <span className="gp-location-label">Location</span>
                    <span className="gp-location-value">
                      {[aiResult.location_from_image.city, aiResult.location_from_image.state, aiResult.location_from_image.country]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}
                {aiResult.location_from_image.coordinates && (
                  <div className="gp-location-row">
                    <span className="gp-location-label">Coordinates</span>
                    <span className="gp-location-value">{aiResult.location_from_image.coordinates}</span>
                  </div>
                )}
                {aiResult.location_from_image.timestamp && (
                  <div className="gp-location-row">
                    <span className="gp-location-label">Timestamp</span>
                    <span className="gp-location-value">{aiResult.location_from_image.timestamp}</span>
                  </div>
                )}
              </div>
            )}
            
            {aiResult.location_stored && (
              <div className="gp-ai-row">
                <span className="gp-ai-label">Database</span>
                <span className="gp-ai-value" style={{ color: '#4ade80' }}>✓ Location stored</span>
              </div>
            )}
          </div>
        )}

        {/* Stored plant locations from database */}
        {storedLocations.length > 0 && (
          <div className="gp-stored-section">
            <div className="gp-stored-header">📍 Stored Plant Locations ({storedLocations.length})</div>
            <div className="gp-stored-list">
              {storedLocations.slice(0, 5).map((loc, i) => (
                <div key={loc.id || i} className="gp-stored-item">
                  <div className="gp-stored-plant">{loc.identified_plant}</div>
                  {loc.latitude && loc.longitude && (
                    <div className="gp-stored-coords">
                      📍 {loc.latitude?.toFixed(5)}, {loc.longitude?.toFixed(5)}
                    </div>
                  )}
                  {(loc.city || loc.state || loc.country) && (
                    <div className="gp-stored-location">
                      🌍 {[loc.city, loc.state, loc.country].filter(Boolean).join(', ')}
                    </div>
                  )}
                  {loc.address && (
                    <div className="gp-stored-address">
                      📮 {loc.address}
                    </div>
                  )}
                  {loc.timestamp && (
                    <div className="gp-stored-time">
                      🕒 {new Date(loc.timestamp).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {loadingLocations && (
          <div className="gp-loading">Loading stored locations...</div>
        )}

        {/* Image grid */}
        <div className="gp-grid">
          {images.length === 0 && (
            <div className="gp-empty">No photos yet — be the first contributor!</div>
          )}

          {images.map((img, i) => (
            <div key={i} className="gp-thumb" onClick={() => setLightbox(i)}>
              <img src={img.dataUrl} alt={`upload-${i}`} />
              {img.latitude != null && (
                <span className="gp-gps-badge" title={`${img.latitude.toFixed(4)}, ${img.longitude.toFixed(4)}`}>
                  📍
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {lightbox !== null && images[lightbox] && (
          <div className="gp-lightbox" onClick={() => setLightbox(null)}>
            <img src={images[lightbox].dataUrl} alt="full" />
            <div className="gp-lb-meta">
              {images[lightbox].latitude != null && (
                <span>
                  📍 {images[lightbox].latitude.toFixed(5)}, {images[lightbox].longitude.toFixed(5)}
                </span>
              )}
              <span className="gp-lb-name">{images[lightbox].fileName}</span>
            </div>
            <button className="gp-lb-close" onClick={() => setLightbox(null)}>✕</button>
          </div>
        )}
      </div>

      {/* Inline styles matching the project's hologram aesthetic */}
      <style>{galleryCSS}</style>
    </div>
  )
}

/* ── CSS ──────────────────────────────────────────────── */
const galleryCSS = `
/* ── Overlay backdrop ───────────────────────────────── */
.gp-overlay {
  position: fixed;
  inset: 0;
  z-index: 9500;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  animation: gp-fade-in 0.25s ease-out;
}

@keyframes gp-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ── Panel ──────────────────────────────────────────── */
.gp-panel {
  position: relative;
  width: 520px;
  max-width: calc(100vw - 40px);
  max-height: 82vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 14px;
  padding: 22px 26px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  animation: gp-slide-up 0.3s ease-out;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  overflow: hidden;
}

@keyframes gp-slide-up {
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── Corner accents ─────────────────────────────────── */
.gp-corner {
  position: absolute;
  width: 14px;
  height: 14px;
  border-color: #228B22;
  border-style: solid;
  pointer-events: none;
}
.gp-tl { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
.gp-tr { top: -1px; right: -1px; border-width: 2px 2px 0 0; }
.gp-bl { bottom: -1px; left: -1px; border-width: 0 0 2px 2px; }
.gp-br { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }

/* ── Header ─────────────────────────────────────────── */
.gp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.gp-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gp-icon {
  font-size: 18px;
  color: #228B22;
}

.gp-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  letter-spacing: 3px;
}

.gp-close {
  background: transparent;
  border: 1px solid #ccc;
  color: #666;
  font-size: 16px;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.gp-close:hover {
  background: #f0f0f0;
  border-color: #999;
}

.gp-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 12px 0;
}

/* ── Plant info ─────────────────────────────────────── */
.gp-plant-name {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  letter-spacing: 1.5px;
}

.gp-plant-sci {
  font-size: 11px;
  color: #888;
  font-style: italic;
  margin-top: 2px;
  letter-spacing: 1px;
  margin-bottom: 14px;
}

/* ── Upload bar ─────────────────────────────────────── */
.gp-upload-bar {
  margin-bottom: 14px;
}

.gp-upload-btn {
  width: 100%;
  padding: 10px 0;
  border: 1px dashed #228B22;
  border-radius: 8px;
  background: #f5faf5;
  color: #228B22;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
}
.gp-upload-btn:hover:not(:disabled) {
  background: #e8f5e8;
  border-color: #1a7a1a;
}
.gp-upload-btn:disabled {
  opacity: 0.5;
  cursor: wait;
}

.gp-error {
  font-size: 12px;
  color: #d32f2f;
  margin-bottom: 8px;
}

.gp-identify-btn {
  width: 100%;
  padding: 10px 0;
  border: 1px solid #228B22;
  border-radius: 8px;
  background: #228B22;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.gp-identify-btn:hover:not(:disabled) {
  background: #1a7a1a;
  border-color: #1a7a1a;
}
.gp-identify-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

@keyframes gp-spin {
  to { transform: rotate(360deg); }
}
.gp-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid #ccc;
  border-top-color: #228B22;
  border-radius: 50%;
  animation: gp-spin 0.7s linear infinite;
}

.gp-ai-card {
  background: #f5faf5;
  border: 1px solid #c8e6c9;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 12px;
  animation: gp-fade-in 0.3s ease-out;
}
.gp-ai-card-header {
  font-size: 12px;
  font-weight: 600;
  color: #228B22;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
}
.gp-ai-row {
  display: flex;
  gap: 10px;
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.5;
}
.gp-ai-label {
  color: #888;
  min-width: 90px;
  flex-shrink: 0;
  letter-spacing: 0.5px;
}
.gp-ai-value {
  color: #333;
}

/* ── Location from Image section ───────────────────── */
.gp-location-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
}

.gp-location-header {
  font-size: 11px;
  font-weight: 600;
  color: #228B22;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.gp-location-row {
  display: flex;
  gap: 10px;
  margin-top: 6px;
  font-size: 11px;
  line-height: 1.6;
}

.gp-location-label {
  color: #888;
  min-width: 80px;
  flex-shrink: 0;
  letter-spacing: 0.5px;
  font-size: 10px;
  text-transform: uppercase;
}

.gp-location-value {
  color: #333;
  flex: 1;
  word-break: break-word;
}

/* ── Image grid ─────────────────────────────────────── */
.gp-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding-right: 4px;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.gp-grid::-webkit-scrollbar { width: 4px; }
.gp-grid::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.gp-empty {
  grid-column: 1 / -1;
  text-align: center;
  color: #999;
  font-size: 12px;
  padding: 30px 0;
  letter-spacing: 0.5px;
}

.gp-thumb {
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.2s;
}
.gp-thumb:hover {
  border-color: #228B22;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transform: scale(1.04);
}
.gp-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.gp-gps-badge {
  position: absolute;
  bottom: 4px;
  right: 4px;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  padding: 1px 4px;
  line-height: 1;
}

/* ── Lightbox ───────────────────────────────────────── */
.gp-lightbox {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  animation: gp-fade-in 0.2s ease-out;
}
.gp-lightbox img {
  max-width: 90%;
  max-height: 70%;
  border-radius: 8px;
  border: 1px solid #ddd;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}
.gp-lb-meta {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  font-size: 11px;
  color: #ccc;
  letter-spacing: 0.5px;
}
.gp-lb-name {
  color: #aaa;
  font-style: italic;
}
.gp-lb-close {
  position: absolute;
  top: 12px;
  right: 14px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 18px;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gp-lb-close:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* ── Stored Locations ────────────────────────────────── */
.gp-stored-section {
  margin: 16px 0;
  padding: 14px;
  background: #f5faf5;
  border: 1px solid #c8e6c9;
  border-radius: 8px;
}

.gp-stored-header {
  font-size: 13px;
  font-weight: 600;
  color: #228B22;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}

.gp-stored-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.gp-stored-item {
  padding: 10px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  transition: all 0.2s;
}

.gp-stored-item:hover {
  background: #f5f5f5;
  border-color: #228B22;
}

.gp-stored-plant {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.gp-stored-coords {
  font-size: 11px;
  color: #228B22;
  font-family: 'Consolas', monospace;
  margin-bottom: 2px;
}

.gp-stored-location {
  font-size: 10px;
  color: #555;
  margin-bottom: 2px;
  letter-spacing: 0.3px;
}

.gp-stored-address {
  font-size: 10px;
  color: #777;
  margin-bottom: 2px;
  line-height: 1.4;
}

.gp-stored-time {
  font-size: 10px;
  color: #999;
  font-style: italic;
}

.gp-loading {
  text-align: center;
  color: #888;
  font-size: 12px;
  padding: 10px;
  font-style: italic;
}
`
