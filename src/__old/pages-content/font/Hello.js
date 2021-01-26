import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useResource, useThree, useUpdate } from 'react-three-fiber'
import { Clock, DynamicDrawUsage, Font, MathUtils, Mesh, MeshStandardMaterial, Object3D, TextBufferGeometry, VertexColors } from 'three'

export function Hello ({ myText = 'Jesus' }) {
  const gp = useRef()
  const inst = useRef()
  let [scale, setScale] = useState(0.5)
  let { size, viewport } = useThree()

  let fontGeo = useMemo(() => {
    let lovelo = require('./lovelo-bold-regular.json')

    var makeFontGeo = ({ text, font, width }) => new TextBufferGeometry(text, {
      font: new Font(font),
      size: width,
      height: 1.2,
      curveSegments: 16,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 1.0,
      bevelOffset: 0.6,
      bevelSegments: 3
    })

    let text = myText || 'Jesus'
    let geo = makeFontGeo({ text, font: lovelo, width: 50 })
    geo.computeBoundingSphere()
    geo.computeBoundingBox()
    let radius = geo.boundingSphere.radius
    let height = geo.boundingBox.max.y
    geo.translate(radius * -1, height * -0.5, 0)
    geo.userData.width = radius * 2.0
    geo.userData.height = height
    return geo
  }, [myText])

  useEffect(() => {


    if (window.innerWidth < 768) {
      let newScale = viewport().width / (fontGeo.boundingSphere.radius * 2) * 0.8
      setScale(newScale)
      // let newScale = viewport().height / (fontGeo.userData.height) * 0.7
      // setScale(newScale)
    } else {

      // let newScale = viewport().width / (fontGeo.boundingSphere.radius * 2) * 0.9
      // setScale(newScale)
    }

  }, [size.width, size.height])

  let row = 1
  let eachPerRow = 1
  let count = row * eachPerRow

  let data = useMemo(() => {
    return Array(50).fill(0).map((e, i) => {
      return {
        index: i,
        init: 0,
        accu: 0,
        o3d: new Object3D()
      }
    })
  }, [])
  useEffect(() => {
    if (inst.current) {
      inst.current.geometry = fontGeo
      inst.current.needsUpdate = true
    }
  }, [])

  useFrame((state, delta) => {
    let i = 0
    if (inst.current) {
      for (let r = 0; r < row; r++) {
        for (let pr = 0; pr < eachPerRow; pr++) {
          let obj = data[i]
          // let direction = r % 2 === 0 ? 1 : -1
          // obj.o3d.position.y = (r - (row / 2)) * 80

          let time = state.clock.getElapsedTime() * 0.1
          let progress = Math.sin(time) * Math.sin(time)
          // if (window.innerWidth < 768) {
          //   obj.o3d.position.x = MathUtils.lerp(fontGeo.userData.width * 0.5, fontGeo.userData.width * -0.5, progress)
          // }

          // obj.o3d.position.x = fontGeo.userData.width * 0.5
          // obj.o3d.position.x = fontGeo.userData.width * -0.5

          //
          // obj.o3d.position.x += 1 * direction
          // if (Math.abs(obj.o3d.position.x) > Math.abs(obj.limit)) {
          //   obj.o3d.position.x = obj.init
          // }

          obj.o3d.updateMatrix()

          inst.current.setMatrixAt(i, obj.o3d.matrix)
          i++
        }
      }
      inst.current.instanceMatrix.needsUpdate = true
    }
  })

  let matRef = useRef()
  let { scene } = useThree()
  useEffect(() => {
    if (matRef.current) {
      matRef.current.envMap = scene.environment
    }
  }, [scene.environment && scene.environment.id])

  return <group ref={gp} scale={[scale, scale, scale]} position-z={0}>
    <instancedMesh ref={inst} args={[null, null, count]}>
      {/* <meshStandardMaterial metalness={0.5} roughness={0.1} color={'#00ffff'} /> */}
      <meshBasicMaterial flatShading={true} ref={matRef} />
    </instancedMesh>
  </group>
}
