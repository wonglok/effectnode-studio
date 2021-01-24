import React, { Suspense, useRef, useEffect, useMemo, useCallback } from "react"

import { Canvas, useFrame, useResource, useThree } from "react-three-fiber"
import { sRGBEncoding, ACESFilmicToneMapping, Color, BackSide, MeshStandardMaterial } from 'three'
import { useLoader } from "react-three-fiber"
import { ThankyouEmoji } from "../emojis/Emojis"
// import { Color, DoubleSide, MeshStandardMaterial } from 'three'

export default function Cross ({ chroma }) {
  const FBXLoader = require('three/examples/jsm/loaders/FBXLoader').FBXLoader
  const scene = useLoader(FBXLoader, '/map-church/holy-cross.fbx')
  useEffect(() => {
    scene.traverse((item) => {
      if (item.isMesh) {
        item.material = new MeshStandardMaterial({ envMap: chroma.out.envMap, metalness: 0.5, roughness: 0.1 })
      }
    })

    scene.scale.set(0.3, 0.3, 0.3)
    scene.position.set(-4, 20, 0)
    scene.rotation.x = Math.PI * 0.5
    scene.rotation.y = Math.PI * -0.133333

    return () => {
      scene.traverse((item) => {
        if (item.material) {
          item.material.dispose()
        }
        if (item.geometry) {
          item.geometry.dispose()
        }
      })
    }
  })

  return (
    <group>
      <primitive object={scene}></primitive>
    </group>
  )
}

function FloatingPray ({ children }) {
  const gp = useRef()
  useFrame((state) => {
    gp.current.scale.set(1.3, 1.3, 1.3)
    gp.current.position.set(0, -13, 0)
    gp.current.rotation.x = 0.1 + Math.sin(state.clock.getElapsedTime()) * 0.2
  })
  return <group ref={gp}>
    {children}
  </group>
}

function MyScene () {
  // const ShaderCubeDarkness = require('../shaders/ShaderCubeDarkness').ShaderCubeDarkness
  // const { gl, scene } = useThree()

  // const chroma = useMemo(() => {
  //   return new ShaderCubeDarkness({ renderer: gl, res: 128, color: new Color('#ffffff') })
  // }, [])

  // // useEffect(() => {
  // //   scene.background = chroma.out.envMap
  // // }, [])

  // useFrame(() => {
  //   if (chroma) {
  //     chroma.compute({ time: false })
  //   }
  // })

  return (
    <group>
      {/* <hemisphereLight skyColor={'#ffffff'} groundColor={'#ffffff'} intensity={0.35} position={[0, 250, 0]} /> */}
      <directionalLight
        intensity={1.0}
        position={[0, 10 , 50]}
      />
      <ambientLight intensity={0.3}></ambientLight>
      <mesh>
        <sphereBufferGeometry args={[200, 42, 42]}></sphereBufferGeometry>
        <meshStandardMaterial side={BackSide} metalness={0.7} roughness={0.4}></meshStandardMaterial>
      </mesh>
      <Suspense fallback={null}>
        <FloatingPray>
          <ThankyouEmoji></ThankyouEmoji>
        </FloatingPray>
        {/* <Cross chroma={chroma}></Cross> */}
      </Suspense>
    </group>
  )
}

export function ThankyouCanvas () {
  return (
    <Canvas
      style={{ borderRadius: '10px' }}
      shadowMap
      pixelRatio={[1.0, 3.0]}
      camera={{ position: [0, 0.0, 100] }}

      colorManagement
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping
        gl.outputEncoding = sRGBEncoding
      }}
    >
      <MyScene></MyScene>
    </Canvas>
  )
}
