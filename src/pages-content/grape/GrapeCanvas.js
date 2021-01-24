import React, { Suspense, useRef, useState, useEffect, useMemo, useCallback } from "react"

import { Canvas, useFrame, useResource, useThree, extend } from "react-three-fiber"
import { Color } from "three"
import { VertexColors } from "three"
import { sRGBEncoding, ACESFilmicToneMapping } from 'three'
import { Physics, usePlane, useBox, useSphere } from 'use-cannon'
import niceColors from 'nice-color-palettes'
import { Object3D } from "three"
import { Vector2 } from "three"

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


function SwarmGrape ({ count }) {
  const mesh = useRef()
  const lightPt = useRef()
  const lightDir = useRef()
  const [dummy] = useState(() => new Object3D())
  const { customProgramCacheKey, onCompileMarbleShader } = useMarbel()

  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100
      const factor = 20 + Math.random() * 100
      const speed = 0.01 + Math.random() / 200
      const xFactor = -20 + Math.random() * 40
      const yFactor = -20 + Math.random() * 40
      const zFactor = -20 + Math.random() * 40
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 })
    }
    return temp
  }, [count])

  useEffect(() => {
    if (mesh.current && mesh.current.material) {
      mesh.current.material.needsUpdate = true
    }
  })

  useFrame((state) => {
    if (lightPt.current) {
      lightPt.current.position.set(state.mouse.x * state.viewport.width * 0.3, state.mouse.y * state.viewport.height * 0.3, 0.0)
    }
    // if (lightDir.current) {
    //   lightDir.current.position.set(state.mouse.x * state.viewport.width, state.mouse.y * state.viewport.height, 10.0)
    // }

    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle
      t = particle.t += speed / 2
      const a = Math.cos(t) + Math.sin(t * 1) / 10
      const b = Math.sin(t) + Math.cos(t * 2) / 10
      const s = Math.max(1.5, Math.cos(t) * 5)
      particle.mx += (state.mouse.x * state.viewport.width - particle.mx) * 0.02
      particle.my += (state.mouse.y * state.viewport.height - particle.my) * 0.02
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      )
      dummy.scale.set(s, s, s)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <instancedMesh ref={mesh} args={[null, null, count]} castShadow receiveShadow>
        <sphereBufferGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial metalness={0.5} roughness={0.5} transparent={true} customProgramCacheKey={customProgramCacheKey} onBeforeCompile={onCompileMarbleShader} />
      </instancedMesh>

      <pointLight
        ref={lightPt}
        intensity={0.5}
        position={[0, 0 , 0]}
      />

      <directionalLight
        ref={lightDir}
        intensity={0.5}
        position={[0, 0 , 0]}
      />

    </>
  )
}

function useMarbel () {
  const vertHeader = () => {
    return /* glsl */`
      varying vec2 myUV;
      varying vec4 myPos;
    `
  }
  const vertexExec = () => {
    return /* glsl */`
      myUV = uv;
      myPos = gl_Position * 0.05;
    `
  }

  const fragHeader = () => {
    return /* glsl */`
      uniform float time;
      uniform vec2 mouse;
      varying vec2 myUV;
      varying vec4 myPos;

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
        // float opacity = length(gfColor.rgb);
        gfColor *= vec4(
          1.0 - pattern(mouse.xy * myPos.xz * myUV * 3.6 + -0.23 * cos(time * 0.15)),
          1.0 - pattern(mouse.xy * myPos.xz * myUV * 3.6 +  0.0 * cos(time * 0.15)),
          1.0 - pattern(mouse.xy * myPos.xz * myUV * 3.6 +  0.23 * cos(time * 0.15)),
          1.0
        );

        return gfColor;
      }
    `
  }

  const fragmentExec = () => {
    return /* glsl */`
      gl_FragColor = modColor(gl_FragColor);
    `
  }

  let timeRef = useRef({ value: 0 })
  useFrame(({ clock }) => {
    timeRef.current.value = clock.getElapsedTime()
  })

  let mouseRef = useRef({ value: new Vector2(0.5, 0.5) })
  useFrame(({ mouse }) => {
    mouseRef.current.value.copy(mouse)
  })

  let onShaderfy = (shader) => {
    shader.uniforms.time = timeRef.current
    shader.uniforms.mouse = mouseRef.current

    shader.vertexShader = shader.vertexShader.replace(`void main() {`,`${vertHeader()}\nvoid main() {`)
    shader.vertexShader = shader.vertexShader.replace(`#include <fog_vertex>`,`#include <fog_vertex>\n${vertexExec()}`)

    shader.fragmentShader = shader.fragmentShader.replace(`void main() {`, `${fragHeader()}void main() {`)
    shader.fragmentShader = shader.fragmentShader.replace(`#include <dithering_fragment>`, `#include <dithering_fragment>\n${fragmentExec()}`)
  }

  let onKeyMake = () => {
    return [vertHeader(), vertexExec(), fragHeader(), fragmentExec()].join('-')
  }

  return {
    customProgramCacheKey: onKeyMake,
    onCompileMarbleShader: onShaderfy
  }
}

function MyScene () {
  const { camera, scene } = useThree()

  useFrame(() => {
    camera.position.y = 0
    camera.position.z = 100
    camera.lookAt(0, 0, 0)
  })

  useEffect(() => {
    // scene.background = new Color('#000000')
  })

  return (
    <group>
      {/* <hemisphereLight skyColor={'#ffffff'} groundColor={'#ffffff'} intensity={0.35} position={[0, 250, 0]} /> */}

      {/*  */}

      <directionalLight
        intensity={1.0}
        position={[0, 10 , 50]}
      />

    {/* <group scale={[2, 2, 2]}>
      <Grape />
    </group>
    <group scale={[0.6, 0.6, 0.6]} position={[40, 40, 20]}>
      <Grape />
    </group>
    <group scale={[1.6, 1.6, 1.6]} position={[40, -40, -30]}>
      <Grape />
    </group> */}

    </group>
  )
}

export function GrapeCanvas () {
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
        <group scale={[2, 2, 2]}>
          <SwarmGrape count={100}></SwarmGrape>
        </group>

        <MyScene></MyScene>
      </Suspense>

    </Canvas>
  )
}
