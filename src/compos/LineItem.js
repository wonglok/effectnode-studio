/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree, extend } from 'react-three-fiber'
import { BLOCK_TALL, BLOCK_HEIGHT, BLOCK_WIDTH, SLOT_WIDTH } from './Const'
import { useEffectNode } from './State'

import {
  CatmullRomCurve3,
  Color,
  Vector3,
} from 'three'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { Line2 } from 'three/examples/jsm/lines/Line2'
extend({ Line2 })

export function LineItem({ line }) {
  const PointCount = 75

  const boxes = useEffectNode(s => s.boxes)
  const getBoxByID = (id) => {
    return boxes.find((e) => e._id === id)
  }

  const lineRef = useRef()

  const geometry = useMemo(() => {
    const geometry = new LineGeometry()

    const colors = []
    const colorA = new Color('#00ff00')
    const colorB = new Color('#0000ee')
    const colorC = new Color()

    for (let i = 0; i < PointCount; i++) {
      colorC.copy(colorA).lerp(colorB, ((i / PointCount)))
      colors.push(colorC.r, colorC.g, colorC.b)
    }

    geometry.setColors(colors)

    return geometry
  }, [line._id])

  const mat = useMemo(() => {
    const mat = new LineMaterial({
      linewidth: 5,
      dashed: false,
    })

    return mat
  }, [line._id])

  const getDist = useMemo(() => {
    const from = new Vector3()
    const to = new Vector3()
    return ([fromArr, toArr]) => {
      return from.fromArray(fromArr).sub(to.fromArray(toArr)).length() || 1
    }
  }, [line._id])

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

  return <line2 geometry={geometry} material={mat} ref={lineRef} />
}