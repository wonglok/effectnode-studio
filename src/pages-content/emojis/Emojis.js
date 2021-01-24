import { Color } from 'three'

const { useEffect } = require('react')
const { useLoader } = require('react-three-fiber')

function materialModifications ({ gltf }) {
  gltf.scene = gltf.scene.clone()
  gltf.scene.traverse(item => {
    if (item) {
      if (item.material) {
        item.material.roughness = 0.6
        item.material.metalness = 0.3
      }
    }
  })
}

function cleanUp ({ gltf }) {
  gltf.scene.traverse(item => {
    if (item) {
      if (item.material) {
        item.material.dispose()
      }
      if (item.geometry) {
        item.geometry.dispose()
      }
    }
  })
}

export function ThankyouEmoji () {
  let GLTFLoader = require('three/examples/jsm/loaders/GLTFLoader').GLTFLoader
  let gltf = useLoader(GLTFLoader, '/emojis/thankyou.glb')

  useEffect(() => {
    materialModifications({ gltf })
    return () => {
      cleanUp({ gltf })
    }
  }, [])

  return <group scale={[100, 100, 100]} rotation-y={Math.PI}>
    <primitive object={gltf.scene}></primitive>
  </group>
}

export function LoveEmoji () {
  let GLTFLoader = require('three/examples/jsm/loaders/GLTFLoader').GLTFLoader
  let gltf = useLoader(GLTFLoader, '/emojis/heart-sparkle.glb')

  useEffect(() => {
    materialModifications({ gltf })
    return () => {
      cleanUp({ gltf })
    }
  }, [])

  return <group scale={[100, 100, 100]} rotation-y={Math.PI}>
    <primitive object={gltf.scene}></primitive>
  </group>
}


export function HandshakeEmoji ({ envMap }) {
  let GLTFLoader = require('three/examples/jsm/loaders/GLTFLoader').GLTFLoader
  let gltf = useLoader(GLTFLoader, '/emojis/handshake.glb')

  useEffect(() => {
    materialModifications({ gltf })

    gltf.scene.traverse((item) => {
      if (item.material) {
        // item.material.color = new Color('#ffffff')
        if (envMap) {
          item.material.envMap = envMap
          item.metalness = 0.7
          item.roughness = 0.1
        }
      }
    })

    return () => {
      cleanUp({ gltf })
    }
  }, [])

  return <group scale={[100, 100, 100]} rotation-y={Math.PI}>
    <primitive object={gltf.scene}></primitive>
  </group>
}


export function CallMeEmoji () {
  let GLTFLoader = require('three/examples/jsm/loaders/GLTFLoader').GLTFLoader
  let gltf = useLoader(GLTFLoader, '/emojis/call-me.glb')

  useEffect(() => {
    materialModifications({ gltf })

    return () => {
      cleanUp({ gltf })
    }
  }, [])

  return <group scale={[100, 100, 100]} rotation-y={Math.PI}>
    <primitive object={gltf.scene}></primitive>
  </group>
}

export function OpenHands () {
  let GLTFLoader = require('three/examples/jsm/loaders/GLTFLoader').GLTFLoader
  let gltf = useLoader(GLTFLoader, '/emojis/open-hands.glb')

  useEffect(() => {
    materialModifications({ gltf })
    return () => {
      cleanUp({ gltf })
    }
  }, [])

  return <group scale={[100, 100, 100]} rotation-y={Math.PI}>
    <primitive object={gltf.scene}></primitive>
  </group>
}
