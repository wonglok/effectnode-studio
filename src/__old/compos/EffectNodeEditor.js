/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree, extend } from 'react-three-fiber'
import {
  EventDispatcher,
  Vector3,
} from 'three'
import { useEffectNode } from './State'
import { LineItem } from './LineItem'
import { BoxItem } from './BoxItem'
import { Floor } from './Floor'
import { HandyLine } from './HandyLine'

function ENScene({ initState = {}, onSave = () => {}, onAutoSave = () => {}, children }) {
  const MapControls = require('three/examples/jsm/controls/OrbitControls').MapControls
  const boxes = useEffectNode(s => s.boxes)
  const lines = useEffectNode(s => s.lines)
  const set = useEffectNode(s => s.set)
  const get = useEffectNode(s => s.get)
  const handBoxID = useEffectNode(s => s.handBoxID)
  const handSlotType = useEffectNode(s => s.handSlotType)
  const groupRef = useRef()
  const controls = useRef()
  const { gl, camera, scene } = useThree()

  useEffect(() => {
    set(initState)
  }, [initState])

  useEffect(() => {
    let last = false
    let timer = setInterval(() => {
      let json = JSON.stringify(get())
      if (last && last !== json) {
        onAutoSave(JSON.parse(json))
      }
      last = json
    }, 500)

    return () => {
      clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    let h = {
      onSave: (ev) => {
        if (ev.key === 's' && ev.metaKey) {
          onSave(JSON.parse(JSON.stringify(get())))
        }
      }
    }

    // window.addEventListener('mouseup', () => {
    //   onAutoSave(JSON.parse(JSON.stringify(get())))
    // })

    window.addEventListener('keydown', h.onSave)
    return () => {
      window.removeEventListener('keydown', h.onSave)
    }
  }, [])

  // const [boxes, setBoxes] = useState()
  // const [lines, setLines] = useState([
  //   { _id: `l1`, from: `1`, to: `2` },
  //   { _id: `l2`, from: `2`, to: `3` },
  //   { _id: `l3`, from: `3`, to: `4` },
  //   // { _id: `l3`, from: `1`, to: `3` },
  // ])

  const bus = useMemo(() => {
    return new EventDispatcher()
  }, [])

  const mapTarget = useRef()
  const panSpeed = 1

  useEffect(() => {
    controls.current = new MapControls(camera, gl.domElement)
    controls.current.maxDistance = 3000
    controls.current.minDistance = 0.1
    controls.current.enabled = true
    controls.current.enablePan = true
    controls.current.enableRotate = false

    controls.current.panSpeed = 1
    controls.current.enableDamping = true
    controls.current.enableZoom = true
    controls.current.screenSpacePanning = true

    camera.position.x = 0
    camera.position.y = 150
    camera.position.z = 5

    controls.current.target.x = 0
    controls.current.target.y = 0
    controls.current.target.z = 0

    mapTarget.current = {
      latest: new Vector3(),
      last: new Vector3(),
      delta: new Vector3(),
    }

    controls.current.update()

    bus.addEventListener('disable-ctrl', () => {
      // controls.current.enabled = false
      controls.current.enablePan = false
      controls.current.screenSpacePanning = false
    })
    bus.addEventListener('enable-ctrl', () => {
      // controls.current.enabled = true
      controls.current.enablePan = true
      controls.current.screenSpacePanning = true
    })

    camera.near = 0.5
    camera.far = 8000
    camera.aspect = gl.domElement.width / gl.domElement.height
    camera.updateProjectionMatrix()

    const onResize = () => {
      controls.current.panSpeed = (1024 / gl.domElement.height) * panSpeed

      camera.aspect = gl.domElement.width / gl.domElement.height
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    // let onWheel = (evt) => {
    //   // evt.preventDefault()
    //   // if (evt.ctrlKey) {
    //   //   controls.current.target.y += -evt.deltaY * wheelRate;
    //   //   controls.current.target.z += evt.deltaY * wheelRate;
    //   //   camera.position.z += evt.deltaY * wheelRate
    //   // }
    //   // camera.position.z += evt.deltaY * wheelRate
    //   // controls.current.target.z += evt.deltaY * wheelRate

    //   // camera.position.x += evt.deltaX * wheelRate
    //   // controls.current.target.x += evt.deltaX * wheelRate
    // }
    // gl.domElement.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      controls.current.dispose()
      window.removeEventListener('resize', onResize)
      // if (gl && gl.domElement) {
      //   gl.domElement.removeEventListener('wheel', onWheel)
      // }
    }
  }, [scene.id])

  useFrame(() => {
    controls.current.update()
  })

  const Boxes = () => {
    return boxes.map((box) => {
      return <BoxItem bus={bus} key={box._id} box={box} />
    })
  }

  const Lines = () => {
    return lines.map((line) => {
      return <LineItem bus={bus} key={line._id} line={line} />
    })
  }

  return (
    <group ref={groupRef}>
      <Floor bus={bus} />
      <group>{Boxes()}</group>
      <group>{Lines()}</group>
      {<group><HandyLine bus={bus}></HandyLine></group>}
      {children}
    </group>
  )
}

export function EffectNodeEditor ({ initState, onSave, onAutoSave }) {
  return (
    <Canvas colorManagement={true}>
      <ambientLight intensity={1} />
      <ENScene initState={initState} onSave={onSave} onAutoSave={onAutoSave}></ENScene>
    </Canvas>
  )
}

