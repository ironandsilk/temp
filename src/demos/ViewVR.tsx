import { 
  Environment, 
  OrbitControls, 
  PerspectiveCamera, 
  Preload, 
  TransformControls, 
  useGLTF,
  PointerLockControls,
  GradientTexture
} from '@react-three/drei'
import {
  Canvas,
  useFrame,
  useThree,
} from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { useControls } from 'leva'

function Scene({ isPointerLocked }: { isPointerLocked: boolean }) {
  const sphereRef = useRef<THREE.Mesh>(null!)
  const cubeRef = useRef<THREE.Mesh>(null!)

  const { sphereColor, cubeColor } = useControls({
    sphereColor: '#orange',
    cubeColor: '#purple',
  })

  const moveForward = useRef(false)
  const moveBackward = useRef(false)
  const moveLeft = useRef(false)
  const moveRight = useRef(false)
  const { camera } = useThree()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveForward.current = true
          break
        case 'KeyA':
        case 'ArrowLeft':
          moveLeft.current = true
          break
        case 'KeyS':
        case 'ArrowDown':
          moveBackward.current = true
          break
        case 'KeyD':
        case 'ArrowRight':
          moveRight.current = true
          break
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveForward.current = false
          break
        case 'KeyA':
        case 'ArrowLeft':
          moveLeft.current = false
          break
        case 'KeyS':
        case 'ArrowDown':
          moveBackward.current = false
          break
        case 'KeyD':
        case 'ArrowRight':
          moveRight.current = false
          break
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
    // No animation for the dome or cube

    if (isPointerLocked) {
      const speed = 5.0
      const velocity = new THREE.Vector3()
      const direction = new THREE.Vector3()

      camera.getWorldDirection(direction)
      const forward = new THREE.Vector3(direction.x, 0, direction.z).normalize()
      const right = new THREE.Vector3(-forward.z, 0, forward.x)

      if (moveForward.current) {
        velocity.add(forward)
      }
      if (moveBackward.current) {
        velocity.sub(forward)
      }
      if (moveLeft.current) {
        velocity.sub(right)
      }
      if (moveRight.current) {
        velocity.add(right)
      }

      if (velocity.length() > 0) {
        velocity.normalize().multiplyScalar(speed * delta)
        camera.position.add(velocity)
      }
    }
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} color="blue" intensity={0.5} />
      
      {/* Blue hemisphere light inside the sphere */}
      <hemisphereLight 
        position={[0, -2, -5]} 
        color="#87CEEB" 
        groundColor="#000080" 
        intensity={0.8} 
      />
      
      {/* 4 red directional lights at cube corners */}
      <directionalLight 
        position={[-2, 2, -6.5]} 
        color="red" 
        intensity={0.6} 
        castShadow 
      />
      <directionalLight 
        position={[2, 2, -6.5]} 
        color="red" 
        intensity={0.6} 
        castShadow 
      />
      <directionalLight 
        position={[-2, -2, -6.5]} 
        color="red" 
        intensity={0.6} 
        castShadow 
      />
      <directionalLight 
        position={[2, -2, -6.5]} 
        color="red" 
        intensity={0.6} 
        castShadow 
      />
      
      <mesh scale={100}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial side={THREE.BackSide}>
          <GradientTexture stops={[0, 1]} colors={['#B0C4DE', '#4682B4']} />
        </meshBasicMaterial>
      </mesh>
      <mesh ref={sphereRef} position={[0, -2, -5]}>
        <sphereGeometry args={[2, 32, 32, 0, Math.PI * 2, 0, 2 * Math.PI / 3]} />
        <meshStandardMaterial 
          color={sphereColor} 
          metalness={0.8} 
          roughness={0.2} 
          transparent={true} 
          opacity={0.5} 
          side={THREE.DoubleSide}
          map={new THREE.TextureLoader().load('/pmndrs.png')}
        />
      </mesh>
      <mesh ref={cubeRef} position={[0, 0, -5]}>
        <boxGeometry args={[4, 4, 3]} />
        <meshStandardMaterial 
          color={cubeColor} 
          metalness={0.6} 
          roughness={0.4} 
          transparent={true} 
          opacity={0.5}
          side={THREE.DoubleSide}
          map={new THREE.TextureLoader().load('/pmndrs.png')}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="darkgreen" />
      </mesh>
      {Array.from({ length: 50 }).map((_, i) => (
        <mesh
          key={i}
          position={[(Math.random() - 0.5) * 20, Math.random() * 10, (Math.random() - 0.5) * 20]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial
            color={`hsl(${Math.random() * 360}, 70%, 60%)`}
            emissive={`hsl(${Math.random() * 360}, 70%, 30%)`}
          />
        </mesh>
      ))}

      {isPointerLocked ? (
        <PointerLockControls />
      ) : (
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
          enableDamping={true}
          dampingFactor={0.05}
        />
      )}
    </>
  )
}

export default function App() {
  const [isVRSupported, setIsVRSupported] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isPointerLocked, setIsPointerLocked] = useState(false)
  const [gl, setGl] = useState<THREE.WebGLRenderer | null>(null)

  const { color, scale } = useControls({
    color: '#ff0000',
    scale: { value: 1, min: 0.5, max: 2 },
  })

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      setIsMobile(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase()))
    }
    checkMobile()
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-vr').then(setIsVRSupported)
    }
    const handleResize = () => checkMobile()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handlePointerLockChange = () => setIsPointerLocked(document.pointerLockElement !== null)
    document.addEventListener('pointerlockchange', handlePointerLockChange)
    return () => document.removeEventListener('pointerlockchange', handlePointerLockChange)
  }, [])

  const enterVR = async () => {
    if (gl && navigator.xr?.isSessionSupported('immersive-vr')) {
      try {
        const session = await navigator.xr.requestSession('immersive-vr', {
          optionalFeatures: ['local-floor', 'bounded-floor'],
        })
        gl.xr.enabled = true
        await gl.xr.setSession(session)
      } catch (error) {
        console.error('Failed to enter VR:', error)
      }
    }
  }

  const togglePointerLock = () => {
    if (isPointerLocked) {
      document.exitPointerLock()
    } else {
      document.body.requestPointerLock()
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas
        onCreated={(state) => setGl(state.gl)}
        camera={{ position: [0, 1.6, 5], fov: 75 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}>
        <Scene isPointerLocked={isPointerLocked} />
        <PerspectiveCamera makeDefault />
        <Preload all />
      </Canvas>
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          textAlign: 'center',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '15px',
          borderRadius: '8px',
          maxWidth: '400px',
        }}>
        <h3 style={{ margin: '0 0 10px 0' }}>ViewVR Controls</h3>
        {isMobile ? (
          <p style={{ margin: 0, fontSize: '14px' }}>
            📱 <strong>Touch:</strong> Drag to rotate, pinch to zoom
            <br />
            🥽 <strong>VR:</strong> Tap "Enter VR" for immersive experience
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: '14px' }}>
            🖱️ <strong>Mouse:</strong> Drag to rotate, scroll to zoom
            <br />
            🔒 <strong>Lock:</strong> Click "Mouse Lock" for FPS-style controls (Use WASD to move)
            <br />
            🥽 <strong>VR:</strong> Click "Enter VR" for immersive experience
          </p>
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
        {isVRSupported && (
          <button
            onClick={enterVR}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
            }}>
            🥽 Enter VR
          </button>
        )}
        {!isMobile && (
          <button
            onClick={togglePointerLock}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: isPointerLocked ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
            }}>
            {isPointerLocked ? '🔓 Exit Mouse Lock' : '🔒 Mouse Lock'}
          </button>
        )}
        <div
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            borderRadius: '8px',
            fontFamily: 'Arial, sans-serif',
          }}>
          {isMobile ? '📱 Touch Controls' : '🖱️ Mouse + Keyboard'}
        </div>
      </div>
    </div>
  )
} 