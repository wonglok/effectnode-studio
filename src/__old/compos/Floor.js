import React from 'react'
import { useFrame } from 'react-three-fiber'
import { useRef } from 'react'

export function Floor({ bus }) {
  const point = useRef({ x: 0, y: 0, z: 0 })
  useFrame(() => {
    bus.dispatchEvent({ type: 'floor-pt', point: point.current })
  })

  return (
    <mesh
      rotation-x={-0.5 * Math.PI}
      onPointerMove={(ev) => {
        //  console.log(ev)
        point.current = ev.point
      }}
      onClick={(ev) => {
        bus.dispatchEvent({ type: 'floor-click', point: ev.point })
      }}
    >
      <planeBufferGeometry args={[50000, 50000, 2, 2]} />
      <meshStandardMaterial
        metalness={0.3}
        roughness={0.8}
        attach="material"
        color="#bababa"
      />
    </mesh>
  )
}