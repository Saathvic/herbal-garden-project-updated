import { useState, useRef } from 'react'
import plantData from '../plantData.json'
import useImageUpload from '../hooks/useImageUpload'

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
  // Track the last uploaded File so user can click "Identify Plant" after upload
  const [lastUploadedFile, setLastUploadedFile] = useState(null)

  if (!isOpen) return null

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const record = await handleFileSelect(file, plantId)
    if (record) {
      setImages((prev) => [record, ...prev])
      setLastUploadedFile(file)
      setAiResult(null)
    }
    // Reset so the same file can be re-selected
    e.target.value = ''
  }

  const onIdentify = async () => {
    if (!lastUploadedFile) return
    const res = await identifyPlant(lastUploadedFile)
    if (res) setAiResult(res)
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
          </div>
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
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
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
  background: linear-gradient(
    135deg,
    rgba(20, 50, 60, 0.88) 0%,
    rgba(10, 30, 40, 0.92) 100%
  );
  backdrop-filter: blur(18px);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 10px;
  padding: 22px 26px;
  box-shadow:
    0 0 40px rgba(0, 229, 255, 0.12),
    0 10px 40px rgba(0, 0, 0, 0.35),
    inset 0 0 60px rgba(0, 229, 255, 0.03);
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
  border-color: rgba(0, 229, 255, 0.55);
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
  color: #00e5ff;
  text-shadow: 0 0 12px rgba(0, 229, 255, 0.7);
}

.gp-title {
  font-size: 14px;
  font-weight: 600;
  color: #b8e8f8;
  letter-spacing: 3px;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.35);
}

.gp-close {
  background: transparent;
  border: 1px solid rgba(0, 229, 255, 0.25);
  color: #88d8e8;
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
  background: rgba(0, 229, 255, 0.12);
  border-color: rgba(0, 229, 255, 0.5);
}

.gp-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.4), transparent);
  margin: 12px 0;
}

/* ── Plant info ─────────────────────────────────────── */
.gp-plant-name {
  font-size: 18px;
  font-weight: 500;
  color: #d0f0e8;
  text-shadow: 0 0 8px rgba(0, 229, 255, 0.3);
  letter-spacing: 1.5px;
}

.gp-plant-sci {
  font-size: 11px;
  color: rgba(160, 210, 220, 0.7);
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
  border: 1px dashed rgba(0, 229, 255, 0.4);
  border-radius: 8px;
  background: rgba(0, 229, 255, 0.06);
  color: #80dce8;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
}
.gp-upload-btn:hover:not(:disabled) {
  background: rgba(0, 229, 255, 0.14);
  border-color: rgba(0, 229, 255, 0.55);
  text-shadow: 0 0 6px rgba(0, 229, 255, 0.5);
}
.gp-upload-btn:disabled {
  opacity: 0.5;
  cursor: wait;
}

.gp-error {
  font-size: 12px;
  color: #ff8a80;
  margin-bottom: 8px;
}

.gp-identify-btn {
  width: 100%;
  padding: 10px 0;
  border: 1px solid rgba(0, 229, 255, 0.4);
  border-radius: 8px;
  background: rgba(0, 229, 255, 0.1);
  color: #80dce8;
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
  background: rgba(0, 229, 255, 0.2);
  border-color: rgba(0, 229, 255, 0.6);
  text-shadow: 0 0 8px rgba(0, 229, 255, 0.5);
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
  border: 2px solid rgba(0, 229, 255, 0.3);
  border-top-color: #00e5ff;
  border-radius: 50%;
  animation: gp-spin 0.7s linear infinite;
}

.gp-ai-card {
  background: rgba(0, 229, 255, 0.06);
  border: 1px solid rgba(0, 229, 255, 0.25);
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 12px;
  animation: gp-fade-in 0.3s ease-out;
}
.gp-ai-card-header {
  font-size: 12px;
  font-weight: 600;
  color: #00e5ff;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
  text-shadow: 0 0 8px rgba(0, 229, 255, 0.4);
}
.gp-ai-row {
  display: flex;
  gap: 10px;
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.5;
}
.gp-ai-label {
  color: rgba(160, 210, 220, 0.6);
  min-width: 90px;
  flex-shrink: 0;
  letter-spacing: 0.5px;
}
.gp-ai-value {
  color: #d0f0e8;
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
  scrollbar-color: rgba(0, 229, 255, 0.2) transparent;
}

.gp-grid::-webkit-scrollbar { width: 4px; }
.gp-grid::-webkit-scrollbar-thumb {
  background: rgba(0, 229, 255, 0.2);
  border-radius: 4px;
}

.gp-empty {
  grid-column: 1 / -1;
  text-align: center;
  color: rgba(160, 210, 220, 0.5);
  font-size: 12px;
  padding: 30px 0;
  letter-spacing: 0.5px;
}

.gp-thumb {
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(0, 229, 255, 0.2);
  cursor: pointer;
  transition: all 0.2s;
}
.gp-thumb:hover {
  border-color: rgba(0, 229, 255, 0.6);
  box-shadow: 0 0 14px rgba(0, 229, 255, 0.2);
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
  border: 1px solid rgba(0, 229, 255, 0.3);
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.15);
}
.gp-lb-meta {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  font-size: 11px;
  color: rgba(160, 210, 220, 0.7);
  letter-spacing: 0.5px;
}
.gp-lb-name {
  color: rgba(160, 210, 220, 0.5);
  font-style: italic;
}
.gp-lb-close {
  position: absolute;
  top: 12px;
  right: 14px;
  background: transparent;
  border: 1px solid rgba(0, 229, 255, 0.3);
  color: #88d8e8;
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
  background: rgba(0, 229, 255, 0.12);
}
`
