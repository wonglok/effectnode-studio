import { WebGLCubeRenderTarget, Camera, Scene, Mesh, PlaneBufferGeometry, ShaderMaterial, CubeRefractionMapping, BackSide, NoBlending, BoxBufferGeometry, CubeCamera, Color, LinearMipmapLinearFilter, CanvasTexture, sRGBEncoding } from 'three'
import { Vector2, MeshBasicMaterial, DoubleSide, RGBFormat, LinearFilter, CubeReflectionMapping, WebGLRenderTarget, EquirectangularReflectionMapping } from 'three'
// import { cloneUniforms } from 'three/src/renderers/shaders/UniformsUtils.js'
// import * as dat from '';

const easeOutSine = (t, b, c, d) => {
  return c * Math.sin((t / d) * (Math.PI / 2)) + b
}

const easeOutQuad = (t, b, c, d) => {
  t /= d
  return -c * t * (t - 2) + b
}

class TouchTexture {
  constructor () {
    this.size = 64
    this.width = 64
    this.height = 64
    this.width = this.height = this.size

    this.maxAge = 350
    this.radius = 0.1 * this.size
    // this.radius = 0.15 * 1000

    this.speed = 2.33 / this.maxAge
    // this.speed = 0.01

    this.trail = []
    this.last = null

    this.initTexture()

    this.colorDot = new Color('#ffff00')
    this.colorBG = new Color('#000000')
  }

  get hueDot () {
    let hue = this.colorDot.getHSL(this.colorDot).h
    return (hue * 360).toFixed(0)
  }
  get satuationDot () {
    let satuation = this.colorDot.getHSL(this.colorDot).s
    return (satuation * 100).toFixed(0)
  }
  get lightnessDot () {
    let lightness = this.colorDot.getHSL(this.colorDot).l
    return (lightness * 100).toFixed(0)
  }

  initTexture () {
    this.canvas = document.createElement('canvas')

    this.canvas.width = this.width
    this.canvas.height = this.height
    this.ctx = this.canvas.getContext('2d')
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.canvas.id = 'touchTexture'
  }

  update (delta) {
    this.clear()
    let speed = this.speed
    this.trail.forEach((point, i) => {
      let f = point.force * speed * (1 - point.age / this.maxAge)
      // let x = point.x
      // let y = point.y

      point.x += point.vx * f
      point.y += point.vy * f
      point.age++
      if (point.age > this.maxAge) {
        this.trail.splice(i, 1)
      }
    })

    this.trail.forEach((point, i) => {
      this.drawPoint(point)
    })

    // this.drawPoints()

    // this.ctx.fillStyle = "rgba(255,0,0,0.5)"
    // this.ctx.fillRect(0, 0, 200, 200)
    // this.ctx.fillStyle = "rgba(0,255,0,0.5)"
    // this.ctx.fillRect(50, 0, 200, 200)
    // this.test()
  }

  clear () {
    // this.ctx.fillStyle = 'hsl(61, 100%, 100%)'
    // this.ctx.fillStyle = 'white'

    // this.ctx.fillStyle = '#' + this.colorDot.getHexString()

    this.ctx.fillStyle = '#' + this.colorBG.getHexString()

    // this.ctx.fillStyle = this.gradient
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }
  addTouch (point) {
    let force = 0
    let vx = 0
    let vy = 0
    const last = this.last
    if (last) {
      const dx = point.x - last.x
      const dy = point.y - last.y
      if (dx === 0 && dy === 0) return
      const dd = dx * dx + dy * dy
      let d = Math.sqrt(dd)
      vx = dx / d
      vy = dy / d

      force = Math.min(dd * 10000, 1)
      // force = Math.sqrt(dd)* 50.
      // force = 1
    }
    this.last = {
      x: point.x,
      y: point.y
    }
    this.trail.push({ x: point.x, y: point.y, age: 0, force, vx, vy })
  }
  drawPoint (point) {
    const ctx = this.ctx
    const pos = {
      x: point.x * this.width,
      y: (1 - point.y) * this.height
    }

    let intensity = 1

    if (point.age < this.maxAge * 0.3) {
      intensity = easeOutSine(point.age / (this.maxAge * 0.3), 0, 1, 1)
    } else {
      intensity = easeOutQuad(
        1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7),
        0,
        1,
        1
      )
    }
    intensity *= point.force

    const radius = this.radius
    let color = `${((point.vx + 1) / 2) * 255}, ${((point.vy + 1) / 2) *
      255}, ${intensity * 255}`

    color = `${(this.hueDot - 20 + (intensity * (20) * point.vx)).toFixed(0)}, ${this.satuationDot}%, ${this.lightnessDot}%`
    // color = `${(this.colorDot.getHSL(this.colorDot).h * 360).toFixed(0)}, 100%, 87%`

    let offset = this.size * 5
    ctx.shadowOffsetX = offset // (default 0)
    ctx.shadowOffsetY = offset // (default 0)
    ctx.shadowBlur = radius // (default 0)
    ctx.shadowColor = `hsla(${color},${1 * intensity})` // (default transparent black)

    this.ctx.beginPath()
    this.ctx.fillStyle = 'rgba(255,0,0,1)'
    this.ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2)
    this.ctx.fill()
  }
}

class CustomWebGLCubeRenderTarget extends WebGLCubeRenderTarget {
  constructor (width, height, options) {
    super(width, height, options)
    this.ok = true
  }

  setup (renderer, texture) {
    this.texture.type = texture.type
    this.texture.format = texture.format
    this.texture.encoding = texture.encoding

    var scene = new Scene()

    var shader = {

      uniforms: {
        tEquirect: { value: null }
      },

      vertexShader: `
        varying vec3 vWorldDirection;
        vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
          return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
        }
        void main() {
          vWorldDirection = transformDirection( position, modelMatrix );
          #include <begin_vertex>
          #include <project_vertex>
        }
      `,

      fragmentShader: `
        uniform sampler2D tEquirect;
        varying vec3 vWorldDirection;
        #define RECIPROCAL_PI 0.31830988618
        #define RECIPROCAL_PI2 0.15915494
        void main() {
          vec3 direction = normalize( vWorldDirection );
          vec2 sampleUV;
          sampleUV.y = asin( clamp( direction.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
          sampleUV.x = atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.5;
          gl_FragColor = texture2D( tEquirect, sampleUV );
        }
      `
    }

    let cloneUniforms = require('three/src/renderers/shaders/UniformsUtils.js').cloneUniforms

    var material = new ShaderMaterial({
      type: 'CubemapFromEquirect',
      uniforms: cloneUniforms(shader.uniforms),
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      side: BackSide,
      blending: NoBlending
    })

    material.uniforms.tEquirect.value = texture

    var mesh = new Mesh(new BoxBufferGeometry(5, 5, 5), material)
    scene.add(mesh)

    // var cubeRtt = new WebGLCubeRenderTarget(this.width, {format: RGBFormat, generateMipmaps: true, minFilter: LinearMipmapLinearFilter });
    var camera = new CubeCamera(1, 100000, this)

    camera.renderTarget = this
    camera.renderTarget.texture.name = 'CubeCameraTexture'

    camera.update(renderer, scene)

    this.compute = () => {
      camera.update(renderer, scene)
    }

    // mesh.geometry.dispose()
    // mesh.material.dispose()
  }
}

export class ShaderCubeFlow {
  constructor ({ renderer, res = 72 }) {
    // this.onLoop = ctx.onLoop
    // console.log(renderer)
    this.renderer  = renderer
    this.resX = res
    this.renderTargetCube = new CustomWebGLCubeRenderTarget(this.resX, { format: sRGBEncoding, generateMipmaps: false, magFilter: LinearFilter, minFilter: LinearMipmapLinearFilter })

    this.renderTargetCube.texture.mapping = CubeReflectionMapping
    this.renderTargetCube.texture.mapping = CubeRefractionMapping
    this.renderTargetCube.texture.mapping = CubeReflectionMapping

    let touchTexture = new TouchTexture()
    let texture = new CanvasTexture(touchTexture.canvas)

    this.renderTargetCube.setup(this.renderer, texture)

    let itt = 0
    this.compute = () => {
      if (itt % 4 === 0) {
        touchTexture.addTouch({
          x: Math.random() - 0.5,
          y: Math.random() - 0.5
        })
      }
      itt++;
      touchTexture.update()
      texture.needsUpdate = true

      this.renderTargetCube.compute()
    }

    window.addEventListener('add-touch-shader', ({ detail }) => {
      touchTexture.addTouch(detail.touch)
    })

    this.out = {
      texture: texture,
      envMap: this.renderTargetCube.texture,
      material: new MeshBasicMaterial({ side: DoubleSide, envMap: this.renderTargetCube.texture })
    }
  }
}
