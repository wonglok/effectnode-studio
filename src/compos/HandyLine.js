/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree, extend } from 'react-three-fiber'
import { BLOCK_TALL, BLOCK_HEIGHT, BLOCK_WIDTH, SLOT_WIDTH, OFFSET_HEIGHT, OFFSET_WIDTH } from './Const'
import { useEffectNode, useEffectNodeTemp } from './State'

import {
  CatmullRomCurve3,
  Color,
  Vector3,
} from 'three'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { Line2 } from 'three/examples/jsm/lines/Line2'
extend({ Line2 })

export function HandyLine ({ bus }) {
  const handBoxID = useEffectNodeTemp(s => s.handBoxID)
  const handSlotType = useEffectNodeTemp(s => s.handSlotType)
  const handMode = useEffectNodeTemp(s => s.handMode)

  const getID = useEffectNode(s => s.getID)

  const line = useMemo(() => {
    if (handSlotType === 'output') {
      return { _id: getID(), from: false, to: handBoxID }
    } else if (handSlotType === 'input') {
      return { _id: getID(), from: handBoxID, to: false }
    } else {
      return false
    }
  }, [handBoxID, handSlotType])

  const PointCount = 75

  const boxes = useEffectNode(s => s.boxes)
  const mouse = useRef({ pos: [0, 0, 0] })
  useEffect(() => {
    let h = {
      floor: ({ point }) => {
        if (handSlotType === 'input') {
          mouse.current.pos[0] = point.x + OFFSET_WIDTH + SLOT_WIDTH / 2
          mouse.current.pos[1] = point.y
          mouse.current.pos[2] = point.z + -BLOCK_HEIGHT / 2 + OFFSET_HEIGHT
        }
        if (handSlotType === 'output') {
          mouse.current.pos[0] = point.x + OFFSET_WIDTH + SLOT_WIDTH / 2
          mouse.current.pos[1] = point.y
          mouse.current.pos[2] = point.z + BLOCK_HEIGHT / 2 + -OFFSET_HEIGHT
        }
      }
    }
    bus.addEventListener('floor-pt', h.floor)
    return () => {
      bus.removeEventListener('floor-pt', h.floor)
    }
  })
  const getBoxByID = (id) => {
    return boxes.find((e) => e._id === id) || mouse.current
    //  || mouse.current
  }

  const lineRef = useRef()

  const geometry = useMemo(() => {
    const geometry = new LineGeometry()

    const colors = []
    const colorA = new Color('#00ff00')
    const colorB = new Color('#0000ee')
    const colorC = new Color()

    for (let i = 0; i < PointCount; i++) {
      colorC.copy(colorA).lerp(colorB, (i / PointCount) * 1)
      colors.push(colorC.r, colorC.g, colorC.b)
    }

    geometry.setColors(colors)

    return geometry
  }, [line && line._id])

  const mat = useMemo(() => {
    const mat = new LineMaterial({
      linewidth: 5,
      dashed: false,
    })

    return mat
  }, [line && line._id])

  const getDist = useMemo(() => {
    const from = new Vector3()
    const to = new Vector3()
    return ([fromArr, toArr]) => {
      return from.fromArray(fromArr).sub(to.fromArray(toArr)).length() || 1
    }
  }, [line && line._id])

  const [reload, setReload] = useState(0)

  useEffect(() => {
    const from = getBoxByID(line.from)
    const to = getBoxByID(line.to)

    const OFFSET_HEIGHT = SLOT_WIDTH / 2
    const OFFSET_WIDTH = BLOCK_WIDTH / 2
    const VERTICAL_HEIGHT = getDist([from.pos, to.pos]) * 0.15
    const curve = new CatmullRomCurve3([
      new Vector3(
        from.pos[0] - OFFSET_WIDTH - SLOT_WIDTH / 2,
        0,
        from.pos[2] + -BLOCK_HEIGHT / 2 + OFFSET_HEIGHT
      ),
      new Vector3(
        from.pos[0] - OFFSET_WIDTH - SLOT_WIDTH / 2,
        VERTICAL_HEIGHT,
        from.pos[2] + -BLOCK_HEIGHT / 2 + OFFSET_HEIGHT
      ),
      new Vector3(
        to.pos[0] - OFFSET_WIDTH - SLOT_WIDTH / 2,
        VERTICAL_HEIGHT,
        to.pos[2] + BLOCK_HEIGHT / 2 + -OFFSET_HEIGHT
      ),
      new Vector3(
        to.pos[0] - OFFSET_WIDTH - SLOT_WIDTH / 2,
        0,
        to.pos[2] + BLOCK_HEIGHT / 2 + -OFFSET_HEIGHT
      ),
    ])

    const points = curve.getPoints(PointCount)
    const poss = []

    points.forEach((e, i) => {
      poss.push(e.x, e.y, e.z)
    })

    geometry.setPositions(poss)

    if (lineRef.current) {
      lineRef.current.computeLineDistances()
      lineRef.current.scale.set(1, 1, 1)
      lineRef.current.needsUpdate = true
      lineRef.current.material.linewidth = 0.004
      lineRef.current.material.vertexColors = true
      lineRef.current.material.needsUpdate = true
      lineRef.current.geometry.needsUpdate = true
    }
  }, [reload])

  useFrame(() => {
    const from = getBoxByID(line.from)
    const to = getBoxByID(line.to)

    const newStr = JSON.stringify([from.pos, to.pos])
    if (newStr !== reload) {
      setReload(newStr)
    }
  })

  // console.log(handBoxID)
  return <line2 visible={handMode === 'connect'} geometry={geometry} material={mat} ref={lineRef} />
}