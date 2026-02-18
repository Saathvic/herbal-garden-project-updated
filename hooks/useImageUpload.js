import { useState, useCallback } from 'react'
import exifr from 'exifr'

/**
 * useImageUpload – handles picking an image, extracting EXIF GPS,
 * building a record { file, dataUrl, latitude, longitude, plantId, timestamp },
 * and optionally sending it to the backend for AI plant identification.
 *
 * Returns:
 *   uploading        – boolean
 *   error            – string | null
 *   handleFileSelect – (file: File, plantId: string) => Promise<record>
 *   identifyPlant    – (file: File) => Promise<{ identified_plant, medical_value }>
 *   identifying      – boolean
 *   identifyError    – string | null
 */

const BACKEND = 'http://localhost:3000'

export default function useImageUpload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Read a File as a data-URL so it can be shown in the gallery grid
   */
  const readAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  /**
   * Extract GPS coordinates from EXIF.
   * Returns { latitude, longitude } or { latitude: null, longitude: null }.
   */
  const extractGps = async (file) => {
    try {
      const gps = await exifr.gps(file)
      if (gps && gps.latitude != null && gps.longitude != null) {
        return { latitude: gps.latitude, longitude: gps.longitude }
      }
    } catch {
      // No EXIF / GPS block – that's fine
    }
    return { latitude: null, longitude: null }
  }

  /**
   * Main handler – call this when the user picks a file.
   *
   * @param {File}   file
   * @param {string} plantId  – bed id such as "nw-1"
   * @returns {{ dataUrl, latitude, longitude, plantId, timestamp }}
   */
  const handleFileSelect = useCallback(async (file, plantId) => {
    setError(null)
    setUploading(true)

    try {
      // 1. Read preview data URL
      const dataUrl = await readAsDataUrl(file)

      // 2. Extract EXIF GPS
      const { latitude, longitude } = await extractGps(file)

      // 3. Build the record
      const record = {
        dataUrl,
        latitude,
        longitude,
        plantId,
        timestamp: Date.now(),
        fileName: file.name,
      }

      return record
    } catch (err) {
      setError(err.message || 'Failed to process image')
      return null
    } finally {
      setUploading(false)
    }
  }, [])

  /**
   * Send the image to the backend for AI plant identification.
   * Expects POST /identify-plant with multipart/form-data { image, latitude, longitude, plantId }.
   * Returns { identified_plant, medical_value, location_stored } or throws.
   */
  const [identifying, setIdentifying] = useState(false)
  const [identifyError, setIdentifyError] = useState(null)

  const identifyPlant = useCallback(async (file, gpsData = {}, plantId = 'unknown') => {
    setIdentifying(true)
    setIdentifyError(null)
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      // Add GPS coordinates if available
      if (gpsData.latitude != null) {
        formData.append('latitude', gpsData.latitude.toString())
      }
      if (gpsData.longitude != null) {
        formData.append('longitude', gpsData.longitude.toString())
      }
      formData.append('plantId', plantId)

      console.log('Sending plant identification request...')
      
      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

      const res = await fetch(`${BACKEND}/identify-plant`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Server responded with ${res.status}`)
      }
      
      const result = await res.json()
      console.log('Identification result:', result)
      return result
    } catch (err) {
      console.error('Identification error:', err)
      if (err.name === 'AbortError') {
        setIdentifyError('Request timed out. The image may be too large or the server is busy.')
      } else {
        setIdentifyError(err.message || 'Identification failed')
      }
      return null
    } finally {
      setIdentifying(false)
    }
  }, [])

  return { uploading, error, handleFileSelect, identifyPlant, identifying, identifyError }
}
