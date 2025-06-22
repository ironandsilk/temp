import { OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

function ViewRing() {
  const { gl, scene: defaultScene, camera: defaultCamera, size, events } = useThree()
  const scene = useMemo(() => new THREE.Scene(), [])
  const camera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000), [])

  useLayoutEffect(() => {
    camera.left = -size.width / 2
    camera.right = size.width / 2
    camera.top = size.height / 2
    camera.bottom = -size.height / 2
    camera.position.set(0, 0, 100)
    camera.updateProjectionMatrix()
  }, [size])

  const ref = useRef<THREE.Group>(null!)
  const [hover, setHover] = useState<boolean>(false)
  const matrix = new THREE.Matrix4()
  const { scene: lightningScene } = useGLTF('/lightning.gltf')

  useFrame((state, delta) => {
    matrix.copy(defaultCamera.matrix).invert()
    ref.current.quaternion.setFromRotationMatrix(matrix)
    // Add rotation to the lightning model
    lightningScene.rotation.y += delta
    gl.autoClear = true
    gl.render(defaultScene, defaultCamera)
    gl.autoClear = false
    gl.clearDepth()
    gl.render(scene, camera)
  }, 1)

  return (
    <>
      {createPortal(
        <group>
          <group
            ref={ref}
            position={[size.width / 2 - 120, size.height / 2 - 120, 0]}
            onPointerOut={(e) => setHover(false)}
            onPointerOver={(e) => setHover(true)}>
            <primitive 
              object={lightningScene} 
              scale={hover ? 1.2 : 1}
            />
          </group>
          <ambientLight intensity={0.5 * Math.PI} />
          <pointLight decay={0} position={[10, 10, 10]} intensity={0.5} />
        </group>,
        scene,
        { camera, events: { priority: events.priority + 1 } },
      )}
    </>
  )
}

export default function App() {
  return (
    <Canvas>
      <mesh>
        <boxGeometry args={[2, 1, 1]} />
        <meshNormalMaterial />
      </mesh>
      <ViewRing />
      <OrbitControls />
    </Canvas>
  )
} 