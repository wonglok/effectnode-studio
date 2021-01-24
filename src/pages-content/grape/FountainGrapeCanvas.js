import React, { Suspense, useRef, useState, useEffect, useMemo, useCallback } from "react"

import { Canvas, useFrame, useResource, useThree, extend } from "react-three-fiber"
import { Color } from "three"
import { VertexColors } from "three"
import { sRGBEncoding, ACESFilmicToneMapping } from 'three'
import { Physics, usePlane, useBox, useSphere } from 'use-cannon'
import niceColors from 'nice-color-palettes'

// function Grape ({ ...props }) {
//   return (
//     <group {...props}>
//       <mesh>
//         <sphereBufferGeometry args={[50, 32, 32]} />
//         <meshStandardMaterial color={'purple'} metalness={0.1} roughness={0.5}></meshStandardMaterial>
//       </mesh>
//     </group>
//   )
// }

// function GrapeVine () {
//   return (
//     <group>
//       <Grape></Grape>
//       <Grape></Grape>
//       <Grape></Grape>
//     </group>
//   )
// }


function Plane(props) {
  const [ref] = usePlane(() => ({ mass: 0, ...props }))
  return (
    <mesh ref={ref} receiveShadow>
      <planeBufferGeometry attach="geometry" args={[5, 5]} />
      <shadowMaterial attach="material" color="#171717" opacity={0.5} />
    </mesh>
  )
}

function Grapes({ number }) {
  let sphereRadius = 0.2
  const [ref, api] = useSphere(() => ({
    mass: 1,
    args: sphereRadius,
    position: [Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5]
  }))

  const colors = useMemo(() => {
    const array = new Float32Array(number * 3)
    const color = new Color()
    for (let i = 0; i < number; i++)
      color
        .set(niceColors[26][Math.floor(Math.random() * 5)])
        .convertSRGBToLinear()
        .toArray(array, i * 3)
    return array
  }, [number])

  useFrame(() => {
    let idx = Math.floor(Math.random() * number)
    api.at(idx)
      .position
        .set(0, Math.random() * 2, 0)
  })

  let timeRef = useRef({ value: 0 })
  useFrame(({ clock }) => {
    timeRef.current.value = clock.getElapsedTime()
  })

  let onShaderfy = (shader) => {
    let vertHeader = () => {
      return /* glsl */`
        varying vec2 myUV;
      `
    }
    let vertexExec = () => {
      return /* glsl */`
        myUV = uv;
      `
    }

    let fragHeader = () => {
      return /* glsl */`
        uniform float time;
        varying vec2 myUV;
        const mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );

        float noise( in vec2 p ) {
          return sin(p.x)*sin(p.y);
        }

        float fbm4( vec2 p ) {
            float f = 0.0;
            f += 0.5000 * noise( p ); p = m * p * 2.02;
            f += 0.2500 * noise( p ); p = m * p * 2.03;
            f += 0.1250 * noise( p ); p = m * p * 2.01;
            f += 0.0625 * noise( p );
            return f / 0.9375;
        }

        float fbm6( vec2 p ) {
            float f = 0.0;
            f += 0.500000*(0.5 + 0.5 * noise( p )); p = m*p*2.02;
            f += 0.250000*(0.5 + 0.5 * noise( p )); p = m*p*2.03;
            f += 0.125000*(0.5 + 0.5 * noise( p )); p = m*p*2.01;
            f += 0.062500*(0.5 + 0.5 * noise( p )); p = m*p*2.04;
            f += 0.031250*(0.5 + 0.5 * noise( p )); p = m*p*2.01;
            f += 0.015625*(0.5 + 0.5 * noise( p ));
            return f/0.96875;
        }

        float pattern (vec2 p) {
          float vout = fbm4( p + time + fbm6(  p + fbm4( p + time )) );
          return abs(vout);
        }

        vec4 modColor (vec4 gfColor) {
          gfColor *= vec4(
            1.0 - pattern(myUV * 3.6 + -0.23 * cos(time * 0.15)),
            1.0 - pattern(myUV * 3.6 +  0.0 * cos(time * 0.15)),
            1.0 - pattern(myUV * 3.6 +  0.23 * cos(time * 0.15)),
            1.0
          );

          return gfColor;
        }
      `
    }

    let fragmentExec = () => {
      return /* glsl */`
        gl_FragColor = modColor(gl_FragColor);
      `
    }

    shader.uniforms.time = timeRef.current
    shader.vertexShader = shader.vertexShader.replace(`void main() {`,`${vertHeader()}\nvoid main() {`)
    shader.vertexShader = shader.vertexShader.replace(`void main() {`,`void main() {\n${vertexExec()}`)

    shader.fragmentShader = shader.fragmentShader.replace(`void main() {`, `${fragHeader()}void main() {`)
    shader.fragmentShader = shader.fragmentShader.replace(`#include <dithering_fragment>`, `#include <dithering_fragment>\n${fragmentExec()}`)
  }

  return (
    <instancedMesh receiveShadow castShadow ref={ref} args={[null, null, number]}>
      <sphereBufferGeometry attach="geometry" args={[sphereRadius, 24, 24]}>
        <instancedBufferAttribute attachObject={['attributes', 'color']} args={[colors, 3]} />
      </sphereBufferGeometry>
      <meshStandardMaterial attach="material" needsUpdate={true} onBeforeCompile={onShaderfy} flatShading={false} vertexColors={VertexColors} />
    </instancedMesh>
  )
}

function MyScene () {
  const { camera } = useThree()

  useFrame(() => {
    camera.position.y = 50
    camera.position.z = 100
    camera.lookAt(0,0,0)
  })

  return (
    <group>
      {/* <hemisphereLight skyColor={'#ffffff'} groundColor={'#ffffff'} intensity={0.35} position={[0, 250, 0]} /> */}

      <directionalLight
        intensity={0.7}
        position={[0, 10 , 50]}
      />

    <group scale={[20, 20, 20]}>
      <Physics>
        <Plane rotation={[-Math.PI / 2, 0, 0]} />
        <Grapes number={200} />
      </Physics>
    </group>

    </group>
  )
}

export function FountainGrapeCanvas () {
  return (
    <Canvas
      style={{ borderRadius: '10px' }}
      shadowMap
      pixelRatio={[1.0, 3.0]}
      camera={{ position: [0, .0, 100] }}

      colorManagement
      onCreated={({ gl }) => {
        if (gl) {
          gl.toneMapping = ACESFilmicToneMapping
          gl.outputEncoding = sRGBEncoding
        }
      }}
    >
      <Suspense fallback={null}>
        <MyScene></MyScene>
      </Suspense>

    </Canvas>
  )
}
