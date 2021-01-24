import { useEffect, useMemo } from "react"
import { useFrame, useThree } from "react-three-fiber"
import { Color, Vector2 } from "three"
import { ShaderCubeFlow } from "../shaders/ShaderCubeFlow"

export function WaveShader () {
  let { gl, scene } = useThree()

  let shaderCube = useMemo(() => {
    return new ShaderCubeFlow({ renderer: gl, res: 64 })
  }, [ShaderCubeFlow])

  useFrame((state) => {
    let time = state.clock.getElapsedTime()
    if (shaderCube) {
      shaderCube.compute({ time })
    }
  })

  let envMap = useMemo(() => {
    return shaderCube.out.envMap
  }, [shaderCube])

  useEffect(() => {
    // scene.background = envMap
    scene.background = new Color('#000033')
    scene.environment = envMap
  })

  // useEffect(() => {
  //   let addTouch = (pos) => {
  //     window.dispatchEvent(new CustomEvent('add-touch-shader', { detail: { touch: pos } }))
  //   }

  //   let mouse = new Vector2()
  //   let on = {
  //     onTouchStart (ev) {
  //       ev.preventDefault()
  //     },
  //     onTouchMove (ev) {
  //       ev.preventDefault()

  //       const touch = ev.targetTouches[0]

  //       mouse = {
  //         x: touch.clientX / window.innerWidth,
  //         y: 1 - touch.clientY / window.innerHeight
  //       }

  //       addTouch(mouse)
  //     },
  //     onMouseMove (ev) {
  //       mouse = {
  //         x: ev.clientX / window.innerWidth,
  //         y: 1 - ev.clientY / window.innerHeight
  //       }

  //       addTouch(mouse)
  //     },
  //     onWheel: (ev) => {
  //       ev.preventDefault()
  //     }
  //   }

  //   for (var i = 0; i < 10; i++) {
  //     addTouch({
  //       x: Math.random(),
  //       y: Math.random()
  //     })
  //   }

  //   gl.domElement.addEventListener('mousemove', on.onMouseMove, { passive: false })
  //   gl.domElement.addEventListener('touchstart', on.onTouchStart, { passive: false })
  //   gl.domElement.addEventListener('touchmove', on.onTouchMove, { passive: false })
  //   gl.domElement.addEventListener('wheel', on.onWheel, { passive: false })

  //   return () => {
  //     gl.domElement.removeEventListener('mousemove', on.onMouseMove)
  //     gl.domElement.removeEventListener('touchstart', on.onTouchStart)
  //     gl.domElement.removeEventListener('touchmove', on.onTouchMove)
  //     gl.domElement.removeEventListener('wheel', on.onWheel)
  //   }
  // }, [])


  return <group></group>
}