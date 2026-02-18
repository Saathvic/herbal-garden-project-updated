import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls, Html, Sky, useGLTF, useTexture } from '@react-three/drei'
import { useRef, useEffect, useMemo, useState, useCallback, createContext, useContext, Suspense } from 'react'
import * as THREE from 'three'
import plantData from './plantData.json'
import { getPlantInfo } from './services/geminiService'
import ChatWidget from './components/ChatWidget'
import CommunityBox from './components/CommunityBox'
import GalleryPanel from './components/GalleryPanel'

// App version for cache busting
const APP_VERSION = '1.0.2'

const SelectionContext = createContext()
const SettingsContext = createContext()
const GalleryContext = createContext()

function useGallery() {
  return useContext(GalleryContext)
}

function useSelection() {
  return useContext(SelectionContext)
}

function useSettings() {
  return useContext(SettingsContext)
}

const bedPositions = {
  'nw-1': [-7, 0, -7],
  'nw-2': [-7, 0, -13],
  'ne-1': [7, 0, -7],
  'ne-2': [7, 0, -13],
  'sw-1': [-7, 0, 7],
  'sw-2': [-7, 0, 13],
  'se-1': [7, 0, 7],
  'se-2': [7, 0, 13],
}

function SelectionProvider({ children }) {
  const [selectedBed, setSelectedBed] = useState(null)
  const [geminiData, setGeminiData] = useState(null)
  const [geminiLoading, setGeminiLoading] = useState(false)

  const selectBed = useCallback((bedId) => {
    setSelectedBed(bedId)
    setGeminiData(null)

    if (bedId && plantData[bedId]) {
      setGeminiLoading(true)
      getPlantInfo(plantData[bedId].name).then((result) => {
        setGeminiData(result)
        setGeminiLoading(false)
      })
    } else {
      setGeminiLoading(false)
    }
  }, [])

  return (
    <SelectionContext.Provider value={{ selectedBed, setSelectedBed: selectBed, geminiData, geminiLoading }}>
      {children}
    </SelectionContext.Provider>
  )
}

function InfoPanel() {
  const { selectedBed } = useSelection()
  
  if (!selectedBed || !plantData[selectedBed]) return null
  
  const data = plantData[selectedBed]
  const pos = bedPositions[selectedBed]
  
  return (
    <group position={[pos[0], 2, pos[2]]}>
      <Html center distanceFactor={10}>
        <div className="holo-panel">
          <div className="holo-header">{data.name}</div>
          <div className="holo-scientific">{data.scientific}</div>
          <div className="holo-divider"></div>
          <div className="holo-section">
            <div className="holo-label">HERBAL USE</div>
            <div className="holo-text">{data.use}</div>
          </div>
          <div className="holo-section">
            <div className="holo-label">PREPARATION</div>
            <div className="holo-text">{data.preparation}</div>
          </div>
          <div className="holo-corner tl"></div>
          <div className="holo-corner tr"></div>
          <div className="holo-corner bl"></div>
          <div className="holo-corner br"></div>
        </div>
      </Html>
    </group>
  )
}

function GeminiPanel() {
  const { selectedBed, geminiData, geminiLoading } = useSelection()

  if (!selectedBed || !plantData[selectedBed]) return null

  const data = plantData[selectedBed]

  return (
    <div className="gemini-panel">
      <div className="gemini-panel-header">
        <span className="gemini-panel-icon">✦</span>
        <span className="gemini-panel-title">AI Insights — {data.name}</span>
      </div>
      <div className="gemini-panel-divider"></div>

      {geminiLoading && (
        <div className="gemini-loading">
          <div className="gemini-spinner"></div>
          <span>Consulting Gemini AI…</span>
        </div>
      )}

      {!geminiLoading && geminiData && geminiData.error && (
        <div className="gemini-error">
          <span className="gemini-error-icon">⚠</span>
          <span>{geminiData.message}</span>
        </div>
      )}

      {!geminiLoading && geminiData && !geminiData.error && (
        <div className="gemini-content">
          <div className="gemini-section">
            <div className="gemini-label">DESCRIPTION</div>
            <div className="gemini-text">{geminiData.description}</div>
          </div>
          <div className="gemini-section">
            <div className="gemini-label">CULTIVATION METHOD</div>
            <div className="gemini-text">{geminiData.cultivation_method}</div>
          </div>
          <div className="gemini-section">
            <div className="gemini-label">MEDICINAL USES</div>
            <div className="gemini-text">{geminiData.medical_uses}</div>
          </div>
          {geminiData.disclaimer && (
            <div className="gemini-disclaimer">{geminiData.disclaimer}</div>
          )}
        </div>
      )}

      <div className="gemini-corner tl"></div>
      <div className="gemini-corner tr"></div>
      <div className="gemini-corner bl"></div>
      <div className="gemini-corner br"></div>
    </div>
  )
}

function Fountain() {
  // Load fountain water texture for the outer body
  const fountainTexture = useTexture('./Textures/Full-frame-fountain-water-texture-patternpictures-5406-1500x997.jpg')
  
  // Configure texture for fountain body
  useEffect(() => {
    if (fountainTexture) {
      fountainTexture.wrapS = fountainTexture.wrapT = THREE.RepeatWrapping
      fountainTexture.repeat.set(3, 2) // Adjust repeat for best visual
      fountainTexture.needsUpdate = true
    }
  }, [fountainTexture])
  
  return (
    <group position={[0, 0, 0]}>
      {/* Stone base with texture */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow frustumCulled={false}>
        <cylinderGeometry args={[2, 2.2, 0.4, 32]} />
        <meshStandardMaterial 
          map={fountainTexture} 
          roughness={0.75} 
          metalness={0.15}
        />
      </mesh>
      
      {/* Water pool - keep original appearance */}
      <mesh position={[0, 0.41, 0]} receiveShadow frustumCulled={false}>
        <cylinderGeometry args={[1.8, 1.8, 0.05, 32]} />
        <meshStandardMaterial color="#5a9ab8" roughness={0.15} metalness={0.2} transparent opacity={0.85} />
      </mesh>
      
      {/* Center pillar with texture */}
      <mesh position={[0, 0.6, 0]} castShadow frustumCulled={false}>
        <cylinderGeometry args={[0.3, 0.35, 0.8, 16]} />
        <meshStandardMaterial 
          map={fountainTexture} 
          roughness={0.75} 
          metalness={0.15}
        />
      </mesh>
    </group>
  )
}

function Grassland() {
  const grassRef = useRef()
  const GARDEN_BOUNDARY = 16.5 // Garden is 34x34, so ±17 but with wall thickness
  
  // Minimal grass count for performance
  const GRASS_COUNT = 2000
  
  const { matrices, colors } = useMemo(() => {
    const mat = []
    const col = []
    
    const grassColors = [
      new THREE.Color('#3d6b35'),
      new THREE.Color('#4a7a42'),
      new THREE.Color('#5a8a4a'),
      new THREE.Color('#456b3a'),
      new THREE.Color('#3a5f32'),
      new THREE.Color('#4d7d45'),
    ]
    
    let seed = 12345
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
    
    // Check if position is valid for grass
    const isValidPosition = (x, z) => {
      // Must be inside garden boundary
      if (Math.abs(x) > GARDEN_BOUNDARY || Math.abs(z) > GARDEN_BOUNDARY) return false
      
      // Not on pathways
      const onHorizontalPath = Math.abs(z) < 1.8 && Math.abs(x) < 14.5
      const onVerticalPath = Math.abs(x) < 1.8 && Math.abs(z) < 14.5
      if (onHorizontalPath || onVerticalPath) return false
      
      // Not on plant beds
      const onBed = (Math.abs(x - 7) < 2.8 || Math.abs(x + 7) < 2.8) && 
                    (Math.abs(z - 7) < 2.8 || Math.abs(z + 7) < 2.8 || 
                     Math.abs(z - 13) < 2.8 || Math.abs(z + 13) < 2.8)
      if (onBed) return false
      
      // Not on fountain
      if (Math.sqrt(x * x + z * z) < 2.5) return false
      
      return true
    }
    
    // Distance to nearest path for density variation
    const getPathEdgeDistance = (x, z) => {
      const distToHPath = Math.abs(Math.abs(z) - 1.8)
      const distToVPath = Math.abs(Math.abs(x) - 1.8)
      return Math.min(distToHPath, distToVPath)
    }
    
    for (let i = 0; i < GRASS_COUNT; i++) {
      // Generate within garden bounds only
      const x = (seededRandom() - 0.5) * GARDEN_BOUNDARY * 2
      const z = (seededRandom() - 0.5) * GARDEN_BOUNDARY * 2
      
      if (!isValidPosition(x, z)) continue
      
      // Denser near paths
      const pathDist = getPathEdgeDistance(x, z)
      const densityBoost = pathDist < 2 ? 0.9 : 0.6
      if (seededRandom() > densityBoost) continue
      
      // Height varies - shorter near paths
      const baseHeight = pathDist < 2 
        ? 0.5 + seededRandom() * 0.3 
        : 0.7 + seededRandom() * 0.5
      
      const rotY = seededRandom() * Math.PI * 2
      const rotZ = (seededRandom() - 0.5) * 0.35
      
      const matrix = new THREE.Matrix4()
      matrix.compose(
        new THREE.Vector3(x, baseHeight * 0.1, z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotY, rotZ)),
        new THREE.Vector3(0.4, baseHeight, 0.4)
      )
      mat.push(matrix)
      col.push(grassColors[Math.floor(seededRandom() * grassColors.length)])
    }
    
    return { matrices: mat, colors: col }
  }, [])
  
  useEffect(() => {
    if (grassRef.current && matrices.length > 0) {
      matrices.forEach((matrix, i) => {
        grassRef.current.setMatrixAt(i, matrix)
        grassRef.current.setColorAt(i, colors[i])
      })
      grassRef.current.instanceMatrix.needsUpdate = true
      grassRef.current.instanceColor.needsUpdate = true
    }
  }, [matrices, colors])
  
  return (
    <instancedMesh 
      ref={grassRef} 
      args={[null, null, matrices.length]} 
      frustumCulled={false}
    >
      <coneGeometry args={[0.025, 0.22, 4, 1]} />
      <meshStandardMaterial color="#4a8a4a" roughness={0.85} side={THREE.DoubleSide} />
    </instancedMesh>
  )
}

function GardenBoundary() {
  const size = 34
  const wallHeight = 0.6
  const wallThickness = 0.4
  
  return (
    <group>
      {/* North wall */}
      <mesh position={[0, 0.3, -size / 2]} castShadow receiveShadow frustumCulled={false}>
        <boxGeometry args={[size + wallThickness, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#4a5d4a" roughness={0.9} />
      </mesh>
      
      {/* South wall */}
      <mesh position={[0, 0.3, size / 2]} castShadow receiveShadow frustumCulled={false}>
        <boxGeometry args={[size + wallThickness, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#4a5d4a" roughness={0.9} />
      </mesh>
      
      {/* East wall */}
      <mesh position={[size / 2, 0.3, 0]} castShadow receiveShadow frustumCulled={false}>
        <boxGeometry args={[wallThickness, wallHeight, size]} />
        <meshStandardMaterial color="#4a5d4a" roughness={0.9} />
      </mesh>
      
      {/* West wall */}
      <mesh position={[-size / 2, 0.3, 0]} castShadow receiveShadow frustumCulled={false}>
        <boxGeometry args={[wallThickness, wallHeight, size]} />
        <meshStandardMaterial color="#4a5d4a" roughness={0.9} />
      </mesh>
    </group>
  )
}

function PathwaySystem() {
  // Load stone texture
  const stoneTexture = useTexture('./Textures/natural-stone-paviment.jpg')
  
  // Configure texture for realistic tiling
  useEffect(() => {
    if (stoneTexture) {
      stoneTexture.wrapS = stoneTexture.wrapT = THREE.RepeatWrapping
      stoneTexture.repeat.set(2, 2) // Repeat texture for realistic stone pattern
      stoneTexture.needsUpdate = true
    }
  }, [stoneTexture])
  
  const tiles = []
  const tileSize = 1
  const pathWidth = 3
  const pathLength = 28
  
  // Horizontal path tiles (East-West)
  for (let i = 0; i < pathLength; i++) {
    for (let j = 0; j < pathWidth; j++) {
      const x = -pathLength / 2 + i * tileSize + tileSize / 2
      const z = -pathWidth / 2 + j * tileSize + tileSize / 2
      tiles.push(
        <mesh key={`h-${i}-${j}`} position={[x, 0.02, z]} receiveShadow frustumCulled={false}>
          <boxGeometry args={[tileSize - 0.05, 0.06, tileSize - 0.05]} />
          <meshStandardMaterial 
            map={stoneTexture} 
            roughness={0.85} 
            metalness={0.1}
          />
        </mesh>
      )
    }
  }
  
  // Vertical path tiles (North-South)
  for (let i = 0; i < pathLength; i++) {
    for (let j = 0; j < pathWidth; j++) {
      const x = -pathWidth / 2 + j * tileSize + tileSize / 2
      const z = -pathLength / 2 + i * tileSize + tileSize / 2
      
      // Skip tiles that overlap with horizontal path
      const overlapHorizontal = Math.abs(z) < pathWidth / 2
      if (!overlapHorizontal) {
        tiles.push(
          <mesh key={`v-${i}-${j}`} position={[x, 0.02, z]} receiveShadow frustumCulled={false}>
            <boxGeometry args={[tileSize - 0.05, 0.06, tileSize - 0.05]} />
            <meshStandardMaterial 
              map={stoneTexture} 
              roughness={0.85} 
              metalness={0.1}
            />
          </mesh>
        )
      }
    }
  }
  
  return <group>{tiles}</group>
}

// Default plant configurations per model
const DEFAULT_PLANT_CONFIG = {
  'a_cloesup_shot_of_tulsi_plant.glb': { scale: 0.75, yOffset: 0.2, brightness: 1.0, gridRows: 3, gridCols: 3 },
  'coriander-compressed.glb': { scale: 1.2, yOffset: 0.2, brightness: 1.0, gridRows: 4, gridCols: 4 },
  'Curry leaves 3d model.glb': { scale: 0.5, yOffset: 0.2, brightness: 1.0, gridRows: 4, gridCols: 4 },
  'neem_plant_0218122341_texture_obj.glb': { scale: 0.45, yOffset: 0.1, brightness: 1.0, gridRows: 4, gridCols: 4 },
  'amla_plant_containing_fruits.glb': { scale: 0.4, yOffset: 0.2, brightness: 1.0, gridRows: 4, gridCols: 4 },
  'lemon_grass.glb': { scale: 3.5, yOffset: 0.15, brightness: 1.0, gridRows: 12, gridCols: 12 },
  'mint_freshness.glb': { scale: 0.6, yOffset: 0.2, brightness: 1.0, gridRows: 3, gridCols: 3 },
  'aloe_vera_plant (1).glb': { scale: 0.55, yOffset: -0.3, brightness: 1.0, gridRows: 3, gridCols: 3 },
}

const PLANT_SPACING = 1.2
const LEMONGRASS_SPACING = 0.3 // Tighter spacing for grassland effect

// Build bed-to-model mapping from plantData
const bedModelMap = {}
Object.entries(plantData).forEach(([bedId, data]) => {
  bedModelMap[bedId] = data.model
})

function SettingsProvider({ children }) {
  const [plantSettings, setPlantSettings] = useState(() => {
    const initial = {}
    Object.entries(plantData).forEach(([bedId, data]) => {
      const model = data.model
      const defaults = DEFAULT_PLANT_CONFIG[model] || { scale: 0.6, yOffset: 0.2, brightness: 1.0, gridRows: 3, gridCols: 3 }
      initial[bedId] = { ...defaults }
    })
    return initial
  })

  const updateSetting = useCallback((bedId, key, value) => {
    setPlantSettings(prev => ({
      ...prev,
      [bedId]: { ...prev[bedId], [key]: value }
    }))
  }, [])

  const resetBed = useCallback((bedId) => {
    const model = bedModelMap[bedId]
    const defaults = DEFAULT_PLANT_CONFIG[model] || { scale: 0.6, yOffset: 0.2, brightness: 1.0, gridRows: 3, gridCols: 3 }
    setPlantSettings(prev => ({
      ...prev,
      [bedId]: { ...defaults }
    }))
  }, [])

  const resetAll = useCallback(() => {
    const initial = {}
    Object.entries(plantData).forEach(([bedId, data]) => {
      const model = data.model
      const defaults = DEFAULT_PLANT_CONFIG[model] || { scale: 0.6, yOffset: 0.2, brightness: 1.0, gridRows: 3, gridCols: 3 }
      initial[bedId] = { ...defaults }
    })
    setPlantSettings(initial)
  }, [])

  return (
    <SettingsContext.Provider value={{ plantSettings, updateSetting, resetBed, resetAll }}>
      {children}
    </SettingsContext.Provider>
  )
}

function PlantInstance({ modelPath, position, rotation = 0, bedId }) {
  const { scene } = useGLTF(modelPath)
  const { plantSettings } = useSettings()
  const settings = plantSettings[bedId]
  const plantScale = settings.scale
  const brightness = settings.brightness
  
  const clonedScene = useMemo(() => {
    const clone = scene.clone()
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return clone
  }, [scene])
  
  // Apply brightness via emissive when > 1.0 (without changing base color)
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        if (!child.userData.originalMaterial) {
          child.userData.originalMaterial = child.material
        }
        if (brightness > 1.0) {
          const mat = child.userData.originalMaterial.clone()
          mat.emissive = mat.color.clone()
          mat.emissiveIntensity = (brightness - 1.0) * 0.3
          child.material = mat
        } else {
          child.material = child.userData.originalMaterial
        }
      }
    })
  }, [clonedScene, brightness])
  
  const yOffset = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene)
    return -box.min.y * plantScale + settings.yOffset
  }, [clonedScene, plantScale, settings.yOffset])
  
  return (
    <primitive 
      object={clonedScene} 
      scale={plantScale} 
      position={[position[0], yOffset, position[2]]}
      rotation={[0, rotation, 0]}
    />
  )
}

function PlantGrid({ modelPath, innerSize, bedId }) {
  const { plantSettings } = useSettings()
  const settings = plantSettings[bedId]
  const rows = settings.gridRows
  const cols = settings.gridCols
  
  const positions = useMemo(() => {
    const grid = []
    // Use tighter spacing for lemongrass to create grassland effect
    const isLemongrass = modelPath.includes('lemon_grass.glb')
    const spacing = isLemongrass ? LEMONGRASS_SPACING : PLANT_SPACING
    
    const spacingX = cols > 1 ? (innerSize - spacing) / (cols - 1) : 0
    const spacingZ = rows > 1 ? (innerSize - spacing) / (rows - 1) : 0
    const startX = cols > 1 ? -innerSize / 2 + spacing / 2 : 0
    const startZ = rows > 1 ? -innerSize / 2 + spacing / 2 : 0
    
    let seed = modelPath.length * 1000
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const baseX = startX + col * spacingX
        const baseZ = startZ + row * spacingZ
        // Less random offset for lemongrass for denser coverage
        const offsetRange = isLemongrass ? 0.15 : 0.3
        const offsetX = (seededRandom() - 0.5) * offsetRange
        const offsetZ = (seededRandom() - 0.5) * offsetRange
        const rotation = seededRandom() * Math.PI * 2
        
        grid.push({
          position: [baseX + offsetX, 0, baseZ + offsetZ],
          rotation
        })
      }
    }
    return grid
  }, [innerSize, modelPath, rows, cols])
  
  return (
    <>
      {positions.map((plant, index) => (
        <PlantInstance 
          key={`${bedId}-${rows}-${cols}-${index}`} 
          modelPath={modelPath} 
          position={plant.position}
          rotation={plant.rotation}
          bedId={bedId}
        />
      ))}
    </>
  )
}

function PlantBed({ position = [0, 0, 0], size = 5, borderColor = "#6a6258", soilColor = "#3a2a1a", bedId = "bed" }) {
  const borderHeight = 0.35
  const borderThickness = 0.25
  const innerSize = size - borderThickness * 2
  
  const { selectedBed, setSelectedBed } = useSelection()
  const isSelected = selectedBed === bedId
  
  const highlightColor = "#c4a962"
  const currentBorderColor = isSelected ? highlightColor : borderColor
  
  // Get plant data for this bed
  const bedData = plantData[bedId]
  const modelPath = bedData ? `/models/${bedData.model}` : null
  
  const handleClick = (e) => {
    e.stopPropagation()
    setSelectedBed(isSelected ? null : bedId)
  }
  
  return (
    <group position={position} onClick={handleClick}>
      {/* North border */}
      <mesh position={[0, borderHeight / 2, -size / 2 + borderThickness / 2]} castShadow receiveShadow>
        <boxGeometry args={[size, borderHeight, borderThickness]} />
        <meshStandardMaterial color={currentBorderColor} roughness={0.9} emissive={isSelected ? highlightColor : "#000000"} emissiveIntensity={isSelected ? 0.3 : 0} />
      </mesh>
      
      {/* South border */}
      <mesh position={[0, borderHeight / 2, size / 2 - borderThickness / 2]} castShadow receiveShadow>
        <boxGeometry args={[size, borderHeight, borderThickness]} />
        <meshStandardMaterial color={currentBorderColor} roughness={0.9} emissive={isSelected ? highlightColor : "#000000"} emissiveIntensity={isSelected ? 0.3 : 0} />
      </mesh>
      
      {/* East border */}
      <mesh position={[size / 2 - borderThickness / 2, borderHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[borderThickness, borderHeight, size - borderThickness * 2]} />
        <meshStandardMaterial color={currentBorderColor} roughness={0.9} emissive={isSelected ? highlightColor : "#000000"} emissiveIntensity={isSelected ? 0.3 : 0} />
      </mesh>
      
      {/* West border */}
      <mesh position={[-size / 2 + borderThickness / 2, borderHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[borderThickness, borderHeight, size - borderThickness * 2]} />
        <meshStandardMaterial color={currentBorderColor} roughness={0.9} emissive={isSelected ? highlightColor : "#000000"} emissiveIntensity={isSelected ? 0.3 : 0} />
      </mesh>
      
      {/* Soil inside */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[innerSize, 0.2, innerSize]} />
        <meshStandardMaterial color={soilColor} roughness={0.95} />
      </mesh>
      
      {/* GLB Plant Models */}
      {modelPath && (
        <Suspense fallback={null}>
          <PlantGrid modelPath={modelPath} innerSize={innerSize} bedId={bedId} />
        </Suspense>
      )}
    </group>
  )
}

function PlantBox({ position, width, depth, plantType, plantsCount = 30 }) {
  const stemRef = useRef()
  const topRef = useRef()
  
  const colors = {
    0: '#3a7d44',  // Green 1
    1: '#2d6b3a',  // Green 2
    2: '#4a8b52',  // Green 3
    3: '#356d3f',  // Green 4
    4: '#447a4c',  // Green 5
    5: '#2e6838',  // Green 6
  }
  
  const plantColor = colors[plantType % 6]
  
  const { stemMatrices, topMatrices } = useMemo(() => {
    const stemMat = []
    const topMat = []
    
    const rows = Math.ceil(Math.sqrt(plantsCount))
    const cols = Math.ceil(plantsCount / rows)
    
    for (let i = 0; i < plantsCount; i++) {
      const row = Math.floor(i / cols)
      const col = i % cols
      
      const xOffset = (col - cols / 2) * (width / cols) * 0.7
      const zOffset = (row - rows / 2) * (depth / rows) * 0.7
      
      const randomX = (Math.random() - 0.5) * 0.3
      const randomZ = (Math.random() - 0.5) * 0.3
      
      const stemMatrix = new THREE.Matrix4()
      stemMatrix.setPosition(
        position[0] + xOffset + randomX,
        0.25,
        position[2] + zOffset + randomZ
      )
      stemMat.push(stemMatrix)
      
      const topMatrix = new THREE.Matrix4()
      topMatrix.setPosition(
        position[0] + xOffset + randomX,
        0.45,
        position[2] + zOffset + randomZ
      )
      topMat.push(topMatrix)
    }
    
    return { stemMatrices: stemMat, topMatrices: topMat }
  }, [position, width, depth, plantsCount])
  
  useEffect(() => {
    stemMatrices.forEach((matrix, i) => {
      stemRef.current.setMatrixAt(i, matrix)
    })
    stemRef.current.instanceMatrix.needsUpdate = true
    
    topMatrices.forEach((matrix, i) => {
      topRef.current.setMatrixAt(i, matrix)
    })
    topRef.current.instanceMatrix.needsUpdate = true
  }, [stemMatrices, topMatrices])
  
  return (
    <group>
      {/* Raised bed border */}
      <mesh position={[position[0], 0.15, position[2]]} castShadow receiveShadow frustumCulled={false}>
        <boxGeometry args={[width, 0.3, depth]} />
        <meshStandardMaterial color="#654321" roughness={0.9} />
      </mesh>
      
      {/* Soil inside */}
      <mesh position={[position[0], 0.12, position[2]]} receiveShadow frustumCulled={false}>
        <boxGeometry args={[width - 0.2, 0.24, depth - 0.2]} />
        <meshStandardMaterial color="#3d2817" roughness={0.95} />
      </mesh>
      
      <instancedMesh ref={stemRef} args={[null, null, plantsCount]} castShadow receiveShadow frustumCulled={false}>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 6]} />
        <meshStandardMaterial color={plantColor} roughness={0.7} />
      </instancedMesh>
      
      <instancedMesh ref={topRef} args={[null, null, plantsCount]} castShadow receiveShadow frustumCulled={false}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color={plantColor} roughness={0.6} />
      </instancedMesh>
    </group>
  )
}

function HerbalGarden() {
  const bedSize = 5
  const offset = 7
  const { openGallery } = useGallery()

  const beds = [
    { pos: [-offset, 0, -offset],              id: 'nw-1' },
    { pos: [-offset, 0, -offset - bedSize - 1], id: 'nw-2' },
    { pos: [offset, 0, -offset],                id: 'ne-1' },
    { pos: [offset, 0, -offset - bedSize - 1],  id: 'ne-2' },
    { pos: [-offset, 0, offset],                id: 'sw-1' },
    { pos: [-offset, 0, offset + bedSize + 1],  id: 'sw-2' },
    { pos: [offset, 0, offset],                 id: 'se-1' },
    { pos: [offset, 0, offset + bedSize + 1],   id: 'se-2' },
  ]

  return (
    <group>
      {beds.map(({ pos, id }) => (
        <group key={id}>
          <PlantBed position={pos} size={bedSize} bedId={id} />
          <CommunityBox
            position={pos}
            bedSize={bedSize}
            plantId={id}
            openGallery={openGallery}
          />
        </group>
      ))}
    </group>
  )
}

function Player() {
  const { camera } = useThree()
  const velocity = useRef(new THREE.Vector3())
  const targetVelocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  const moveState = useRef({ forward: false, backward: false, left: false, right: false })
  
  // Camera settings
  const EYE_HEIGHT = 1.65 // Natural human eye height (meters)
  const MOVE_SPEED = 4 // Walking speed
  const ACCELERATION = 8 // How fast to reach target speed
  const DECELERATION = 6 // How fast to slow down
  const HEAD_BOB_AMOUNT = 0.02 // Subtle head bobbing
  const HEAD_BOB_SPEED = 8
  
  // Initialize camera height
  useEffect(() => {
    camera.position.y = EYE_HEIGHT
  }, [camera])
  
  useEffect(() => {
    const onKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW': moveState.current.forward = true; break
        case 'KeyS': moveState.current.backward = true; break
        case 'KeyA': moveState.current.left = true; break
        case 'KeyD': moveState.current.right = true; break
      }
    }
    
    const onKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW': moveState.current.forward = false; break
        case 'KeyS': moveState.current.backward = false; break
        case 'KeyA': moveState.current.left = false; break
        case 'KeyD': moveState.current.right = false; break
      }
    }
    
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
    }
  }, [])
  
  useFrame((state, delta) => {
    // Clamp delta to prevent physics explosions on lag spikes / tab-switch
    const dt = Math.min(delta, 0.1)
    
    const move = moveState.current
    const isMoving = move.forward || move.backward || move.left || move.right
    
    // Calculate target direction
    direction.current.set(0, 0, 0)
    if (move.forward) direction.current.z -= 1
    if (move.backward) direction.current.z += 1
    if (move.left) direction.current.x -= 1
    if (move.right) direction.current.x += 1
    
    if (direction.current.lengthSq() > 0) {
      direction.current.normalize()
    }
    direction.current.applyEuler(camera.rotation)
    direction.current.y = 0
    
    // Set target velocity
    if (isMoving) {
      targetVelocity.current.x = direction.current.x * MOVE_SPEED
      targetVelocity.current.z = direction.current.z * MOVE_SPEED
    } else {
      targetVelocity.current.set(0, 0, 0)
    }
    
    // Smooth acceleration/deceleration (easing)
    const ease = isMoving ? ACCELERATION : DECELERATION
    velocity.current.x += (targetVelocity.current.x - velocity.current.x) * ease * dt
    velocity.current.z += (targetVelocity.current.z - velocity.current.z) * ease * dt
    
    // Snap to zero when nearly stopped to prevent micro-drift
    if (!isMoving && Math.abs(velocity.current.x) < 0.01) velocity.current.x = 0
    if (!isMoving && Math.abs(velocity.current.z) < 0.01) velocity.current.z = 0
    
    // Apply movement
    camera.position.x += velocity.current.x * dt
    camera.position.z += velocity.current.z * dt
    
    // Subtle head bobbing when walking
    const speed = Math.sqrt(velocity.current.x ** 2 + velocity.current.z ** 2)
    if (speed > 0.5) {
      const bobOffset = Math.sin(state.clock.elapsedTime * HEAD_BOB_SPEED) * HEAD_BOB_AMOUNT * (speed / MOVE_SPEED)
      camera.position.y = EYE_HEIGHT + bobOffset
    } else {
      // Smoothly return to eye height when stopped
      camera.position.y += (EYE_HEIGHT - camera.position.y) * 5 * dt
    }
    
    // Clamp to garden bounds
    const BOUNDARY = 14
    camera.position.x = Math.max(-BOUNDARY, Math.min(BOUNDARY, camera.position.x))
    camera.position.z = Math.max(-BOUNDARY, Math.min(BOUNDARY, camera.position.z))
  })
  
  return null
}

// Atmospheric fog component for optimization and realism
function AtmosphericFog() {
  const { scene, camera } = useThree()
  
  useEffect(() => {
    // Dense fog to hide reduced render distance, keeps garden interior clear
    const fog = new THREE.FogExp2('#e8dfd4', 0.045)
    scene.fog = fog
    scene.background = new THREE.Color('#e8dfd4')
    
    return () => {
      scene.fog = null
    }
  }, [scene])
  
  // Dynamic fog density based on camera position (optimization helper)
  useFrame(() => {
    if (scene.fog) {
      // Slightly increase fog when looking at distant areas
      const distFromCenter = Math.sqrt(
        camera.position.x * camera.position.x + 
        camera.position.z * camera.position.z
      )
      // Keep fog light in garden center, denser at edges
      const baseDensity = 0.045
      const edgeDensity = 0.07
      const t = Math.min(distFromCenter / 15, 1)
      scene.fog.density = baseDensity + (edgeDensity - baseDensity) * t * 0.5
    }
  })
  
  return null
}

function SliderControl({ label, value, min, max, step, onChange, unit = '' }) {
  return (
    <div className="settings-slider">
      <div className="settings-slider-header">
        <span className="settings-slider-label">{label}</span>
        <span className="settings-slider-value">{value.toFixed(2)}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="settings-range"
      />
    </div>
  )
}

function PlantSettingsCard({ bedId }) {
  const { plantSettings, updateSetting, resetBed } = useSettings()
  const [expanded, setExpanded] = useState(false)
  const data = plantData[bedId]
  const settings = plantSettings[bedId]

  if (!data || !settings) return null

  return (
    <div className={`settings-card ${expanded ? 'expanded' : ''}`}>
      <div className="settings-card-header" onClick={() => setExpanded(!expanded)}>
        <span className="settings-card-icon">{expanded ? '▾' : '▸'}</span>
        <span className="settings-card-name">{data.name}</span>
        <span className="settings-card-bed">{bedId}</span>
      </div>
      {expanded && (
        <div className="settings-card-body">
          <SliderControl
            label="Scale"
            value={settings.scale}
            min={0.1}
            max={5.0}
            step={0.05}
            onChange={(v) => updateSetting(bedId, 'scale', v)}
          />
          <SliderControl
            label="Y Position"
            value={settings.yOffset}
            min={-2.0}
            max={2.0}
            step={0.05}
            onChange={(v) => updateSetting(bedId, 'yOffset', v)}
          />
          <SliderControl
            label="Brightness"
            value={settings.brightness}
            min={0.5}
            max={3.0}
            step={0.1}
            onChange={(v) => updateSetting(bedId, 'brightness', v)}
          />
          <div className="settings-grid-controls">
            <div className="settings-grid-item">
              <label className="settings-slider-label">Rows</label>
              <div className="settings-stepper">
                <button onClick={() => updateSetting(bedId, 'gridRows', Math.max(1, settings.gridRows - 1))}>−</button>
                <span>{settings.gridRows}</span>
                <button onClick={() => updateSetting(bedId, 'gridRows', Math.min(6, settings.gridRows + 1))}>+</button>
              </div>
            </div>
            <div className="settings-grid-item">
              <label className="settings-slider-label">Cols</label>
              <div className="settings-stepper">
                <button onClick={() => updateSetting(bedId, 'gridCols', Math.max(1, settings.gridCols - 1))}>−</button>
                <span>{settings.gridCols}</span>
                <button onClick={() => updateSetting(bedId, 'gridCols', Math.min(6, settings.gridCols + 1))}>+</button>
              </div>
            </div>
          </div>
          <button className="settings-reset-btn" onClick={() => resetBed(bedId)}>
            ↺ Reset
          </button>
        </div>
      )}
    </div>
  )
}

function SettingsPanel({ isOpen, onClose }) {
  const { resetAll } = useSettings()
  const bedIds = Object.keys(plantData)

  if (!isOpen) return null

  return (
    <div className="settings-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="settings-panel">
        <div className="settings-header">
          <h2 className="settings-title">🌿 Plant Settings</h2>
          <button className="settings-close" onClick={onClose}>✕</button>
        </div>
        <div className="settings-hint">Adjust scale, position, brightness and density for each plant bed.</div>
        <div className="settings-body">
          {bedIds.map(bedId => (
            <PlantSettingsCard key={bedId} bedId={bedId} />
          ))}
        </div>
        <div className="settings-footer">
          <button className="settings-reset-all-btn" onClick={resetAll}>↺ Reset All to Defaults</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [galleryPlantId, setGalleryPlantId] = useState(null)

  const openGallery = useCallback((plantId) => setGalleryPlantId(plantId), [])
  const closeGallery = useCallback(() => setGalleryPlantId(null), [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        setSettingsOpen(prev => !prev)
      }
      if (e.key === 'Escape' && galleryPlantId) {
        setGalleryPlantId(null)
      }
      // TEMP TEST: Open gallery with 'g' key
      if (e.key === 'g' && !galleryPlantId) {
        setGalleryPlantId('nw-1')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [galleryPlantId])

  return (
    <GalleryContext.Provider value={{ openGallery }}>
    <SettingsProvider>
      <SelectionProvider>
        <div style={{ width: '100vw', height: '100vh' }}>
          {/* Settings toggle button */}
          <button
            className="settings-toggle-btn"
            onClick={() => setSettingsOpen(prev => !prev)}
            title="Plant Settings (Tab)"
          >
            ⚙
          </button>

          <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

          {/* Gemini AI panel - right side overlay */}
          <GeminiPanel />

          {/* Health Chatbot overlay widget */}
          <ChatWidget />

          {/* Community Gallery overlay */}
          <GalleryPanel
            plantId={galleryPlantId}
            isOpen={galleryPlantId !== null}
            onClose={closeGallery}
          />

          <Canvas 
            camera={{ position: [0, 1.6, 5], fov: 75, near: 0.1, far: 40 }} 
            shadows={{ type: THREE.PCFSoftShadowMap }}
            gl={{ physicallyCorrectLights: true, powerPreference: 'high-performance' }}
          >
            <PointerLockControls />
            <Player />
          
          {/* Atmospheric fog for optimization */}
          <AtmosphericFog />
          
          {/* Warm morning ambient fill */}
          <ambientLight intensity={0.4} color="#ffecd2" />
          
          {/* Main sunlight - warm morning sun from east */}
          <directionalLight 
            position={[25, 15, 20]} 
            intensity={1.5} 
            color="#ffb347"
            castShadow 
            shadow-mapSize={[1024, 1024]}
            shadow-camera-far={35}
            shadow-camera-left={-16}
            shadow-camera-right={16}
            shadow-camera-top={16}
            shadow-camera-bottom={-16}
            shadow-bias={-0.0001}
            shadow-radius={4}
          />
          
          {/* Secondary fill light - cooler sky bounce */}
          <directionalLight 
            position={[-10, 10, -10]} 
            intensity={0.3} 
            color="#87ceeb"
          />
          
          {/* Hemisphere light - sky/ground color blend */}
          <hemisphereLight 
            args={['#ffd89b', '#4a7a52', 0.5]} 
            position={[0, 20, 0]}
          />
          
          {/* Ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[40, 40]} />
            <meshStandardMaterial color="#4a7a52" roughness={0.95} />
          </mesh>
          
          <Grassland />
          <GardenBoundary />
          <Fountain />
          <PathwaySystem />
          <HerbalGarden />
          <InfoPanel />
          
          {/* Morning sky */}
          <Sky 
            distance={450000}
            sunPosition={[100, 20, 80]}
            inclination={0.52}
            azimuth={0.15}
            mieCoefficient={0.005}
            mieDirectionalG={0.85}
            rayleigh={0.8}
            turbidity={10}
          />
        </Canvas>
        </div>
      </SelectionProvider>
    </SettingsProvider>
    </GalleryContext.Provider>
  )
}

