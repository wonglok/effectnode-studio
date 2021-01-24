import React, { Suspense, useRef, useEffect, useMemo, useCallback } from "react"

import { Canvas, useFrame, useResource, useThree, extend } from "react-three-fiber"
import { sRGBEncoding, ACESFilmicToneMapping, Color, BackSide, MeshStandardMaterial } from 'three'
import { useLoader } from "react-three-fiber"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader"

export default function Cross ({ chroma }) {
  // const FBXLoader = require('three/examples/jsm/loaders/FBXLoader').FBXLoader
  const scene = useLoader(FBXLoader, '/map-church/holy-cross.fbx').clone()
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

function MyScene () {
  const { gl } = useThree()

  const ShaderCubeDarkness = require('../shaders/ShaderCubeDarkness').ShaderCubeDarkness

  const chroma = useMemo(() => {
    return new ShaderCubeDarkness({ renderer: gl, res: 128, color: new Color('#ffffff') })
  }, [])

  useFrame(() => {
    if (chroma) {
      chroma.compute({ time: false })
    }
  })

  return (
    <group>
      {/* <hemisphereLight skyColor={'#ffffff'} groundColor={'#ffffff'} intensity={0.35} position={[0, 250, 0]} /> */}

      <directionalLight
        intensity={0.7}
        position={[0, 10 , 50]}
      />

      <mesh>
        <sphereBufferGeometry args={[200, 42, 42]}></sphereBufferGeometry>
        <meshStandardMaterial flatShading side={BackSide} metalness={0.7} roughness={0.4} envMap={chroma.out.envMap}></meshStandardMaterial>
      </mesh>
      <Suspense fallback={null}>
        <Cross chroma={chroma}></Cross>
      </Suspense>
    </group>
  )
}

export function CrossCanvas () {
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
      <Suspense fallback={null}>
        <MyScene></MyScene>
      </Suspense>

    </Canvas>
  )
}
