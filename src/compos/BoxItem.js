/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */

import { SquareSlot } from './SquareSlot'
import { BLOCK_TALL, BLOCK_HEIGHT, BLOCK_WIDTH, SLOT_WIDTH } from './Const'
import React, { useEffect, useRef, useMemo, useState } from 'react'
// import { Canvas, useFrame, useThree, extend } from 'react-three-fiber'
import { Vector3 } from 'three'
import { useEffectNode, useEffectNodeTemp } from './State'

export function BoxItem({ box, boxes, lines, bus, setMode }) {
  const ref = useRef()
  const down = useRef()

  useEffect(() => {
    down.current = false
    const last = new Vector3()
    const diff = new Vector3()
    const h = {
      mu: () => {
        down.current = false
        diff.multiplyScalar(0)
        last.multiplyScalar(0)
      },
      pt: ({ point }) => {
        if (down.current) {
          if (last.length() > 0) {
            diff
              .copy({
                x: point.x,
                y: 0,
                z: point.z,
              })
              .sub(last)
          }

          last.copy({
            x: point.x,
            y: 0,
            z: point.z,
          })
          ref.current.position.add(diff)

          box.pos = [
            ref.current.position.x,
            ref.current.position.y,
            ref.current.position.z,
          ]
        }
      },
    }

    bus.addEventListener('floor-pt', h.pt)
    window.addEventListener('mouseup', h.mu)
    window.addEventListener('pointerup', h.mu)
    return () => {
      bus.removeEventListener('floor-pt', h.pt)
      window.removeEventListener('mouseup', h.mu)
      window.removeEventListener('pointerup', h.mu)
    }
  })

  const getID = useEffectNode(s => s.getID)
  const getReal = useEffectNode(s => s.get)
  const setReal = useEffectNode(s => s.set)
  const setTemp = useEffectNodeTemp(s => s.set)
  const handMode = useEffectNodeTemp(s => s.handMode)
  const handBoxID = useEffectNodeTemp(s => s.handBoxID)
  const handSlotType = useEffectNodeTemp(s => s.handSlotType)

  const checkAddLine = ({ toType }) => {
    let oldLines = getReal().lines

    let ok = true
    if (handBoxID === box._id) {
      ok = false
    }

    if (oldLines.some(s => s.from === handBoxID && s.to === box._id)) {
      ok = false
    }
    if (oldLines.some(s => s.to === handBoxID && s.from === box._id)) {
      ok = false
    }

    if (ok) {
      if (toType === 'output') {
        let newLine = { _id: getID(), from: handBoxID, to: box._id }
        setReal({
          lines: [...oldLines, newLine]
        })
      } else if (toType === 'input') {
        let newLine = { _id: getID(), from: box._id, to: handBoxID }
        setReal({
          lines: [...oldLines, newLine]
        })
      }
    }
  }
  const onClickSlotOutput = () => {
    if (handMode === 'ready') {
      setTemp({
        handMode: 'connect',
        handBoxID: box._id,
        handSlotType: 'output'
      })
    } else if (handMode === 'connect') {
      checkAddLine({ toType: 'output' })
      setTemp({
        handMode: 'ready',
        handBoxID: false,
        handSlotType: false,
      })
    }
  }

  const onClickSlotInput = () => {
    if (handMode === 'ready') {
      setTemp({
        handMode: 'connect',
        handBoxID: box._id,
        handSlotType: 'input'
      })
    } else if (handMode === 'connect') {
      checkAddLine({ toType: 'input' })
      setTemp({
        handMode: 'ready',
        handBoxID: false,
        handSlotType: false,
      })
    }
  }

  useEffect(() => {
    let h = {
      esc: (ev) => {
        if (ev.keyCode === 27) {
          setTemp({
            handMode: 'ready',
            handBoxID: false,
            handSlotType: false,
          })
        }
      },
      cancel: () => {
        if (handMode === 'connect') {
          setTemp({
            handMode: 'ready',
            handBoxID: false,
            handSlotType: false,
          })
        }
      }
    }
    bus.addEventListener('floor-click', h.cancel)
    window.addEventListener('keydown', h.esc)
    return () => {
      bus.removeEventListener('floor-click', h.cancel)
      window.removeEventListener('keydown', h.esc)
    }
  }, [box._id])

  return (
    <group ref={ref} position={box.pos}>
      <mesh
        onPointerDown={() => {
          down.current = true
        }}
        onPointerUp={() => {
          down.current = false
        }}
        onPointerMove={() => {
          bus.dispatchEvent({ type: 'disable-ctrl' })
        }}
        onPointerOver={(e) => {
          bus.dispatchEvent({ type: 'disable-ctrl' })
        }}
        onPointerOut={(e) => {
          bus.dispatchEvent({ type: 'enable-ctrl' })
        }}
      >
        <boxBufferGeometry
          translate={[0, BLOCK_TALL / 2, 0]}
          args={[BLOCK_WIDTH, BLOCK_TALL, BLOCK_HEIGHT, 2, 2, 2]}
          attach="geometry"
        />
        <meshStandardMaterial attach="material" color="#5f5f5f" />
        {/* a____a'v */}
      </mesh>

      {/* top */}
      <group position={[BLOCK_WIDTH / -2, 0, BLOCK_HEIGHT / -2]}>
        <SquareSlot onClickSlot={onClickSlotInput} io="input" bus={bus} />
      </group>

      {/* bottom */}
      <group position={[BLOCK_WIDTH / -2, 0, BLOCK_HEIGHT / 2]}>
        <SquareSlot onClickSlot={onClickSlotOutput} io="output" bus={bus} />
      </group>
    </group>
  )
}
