import { useRef } from 'react'
import * as THREE from 'three'

/**
 * CommunityBox – a small futuristic glass cube placed in front of a plant bed.
 *
 * Props:
 *   position  – [x, y, z]  world position of the parent plant bed
 *   bedSize   – the bed's square size (default 5) so we can offset in front
 *   plantId   – bed id string passed to the gallery callback
 *   openGallery – (plantId: string) => void
 */
export default function CommunityBox({ position = [0, 0, 0], bedSize = 5, plantId, openGallery }) {
  const meshRef = useRef()
  const glowRef = useRef()

  // Cube dimensions
  const cubeSize = 0.35

  // Place it in front of the bed (positive Z edge) and slightly above ground
  const offsetZ = bedSize / 2 + 0.6
  const localPos = [position[0], 0.45, position[2] + offsetZ]

  // Animation removed for cleaner appearance

  const handleClick = (e) => {
    e.stopPropagation()
    if (openGallery) openGallery(plantId)
  }

  return (
    <group>
      {/* Outer glow shell */}
      <mesh ref={glowRef} position={localPos} scale={[1.45, 1.45, 1.45]}>
        <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
        <meshBasicMaterial
          color="#00e5ff"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Glass cube */}
      <mesh
        ref={meshRef}
        position={localPos}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          document.body.style.cursor = ''
        }}
        castShadow
      >
        <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
        <meshPhysicalMaterial
          color="#88e0ef"
          metalness={0.1}
          roughness={0.05}
          transmission={0.92}
          thickness={0.4}
          ior={1.5}
          transparent
          opacity={0.55}
          envMapIntensity={1.2}
          clearcoat={1}
          clearcoatRoughness={0.05}
          emissive="#00e5ff"
          emissiveIntensity={0.35}
        />
      </mesh>

      {/* Edge wireframe for futuristic look */}
      <lineSegments position={localPos} rotation={meshRef.current?.rotation ?? [0, 0, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)]} />
        <lineBasicMaterial color="#00e5ff" transparent opacity={0.6} />
      </lineSegments>

      {/* Tiny point light for local glow cast */}
      <pointLight
        position={[localPos[0], localPos[1], localPos[2]]}
        color="#00e5ff"
        intensity={0.6}
        distance={2.5}
        decay={2}
      />
    </group>
  )
}
