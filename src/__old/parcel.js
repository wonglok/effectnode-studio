const fs = window.require('fs-extra')

export function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

function makeHTMLCode () {
  return /* html */`<!DOCTYPE html>
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>EffectNode Project</title>
    <style>
      body,html,.full, #root{
        width: 100%;
        height: 100%;
      }
      body,html{
        margin: 0px;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script src="./dist/js/entry.js"></script>
    <script>
      console.log(window.MyCanvas.default({ mounter: document.querySelector('#root') }))
    </script>
  </body>
  </html>`
}

function writeHTML ({ folder }) {
  const indexHTML = makeHTMLCode({ nonce: getNonce(), cspSource: 'http://localhost:3333' })
  fs.writeFileSync(folder.path + '/prod/index.html', indexHTML, 'utf8')
}

function makeFolders ({ folder }) {
  fs.mkdirSync(folder.path + '/prod', { recursive: true })
  fs.mkdirSync(folder.path + '/prod/dist', { recursive: true })
  fs.mkdirSync(folder.path + '/prod/dist/js', { recursive: true })
  fs.mkdirSync(folder.path + '/src', { recursive: true })

  fs.mkdirSync(folder.path + '/src/assets', { recursive: true })
  fs.mkdirSync(folder.path + '/src/js', { recursive: true })
  fs.mkdirSync(folder.path + '/src/js/boxes', { recursive: true })
  fs.mkdirSync(folder.path + '/src/js/meta_backup', { recursive: true })
}

function makeEntryJS ({ folder }) {
  let codeJS = /* j sx */`import all from './boxes/*.js'
import lowdb from 'lowdb'
import Base from 'lowdb/adapters/Base'

class Memory extends Base {
  read() {
    return this.defaultValue
  }
  write () {
  }
}
let adapter = new Memory()
export const db = lowdb(adapter)

window.StreamInput = (val) => {
  db.setState(val).write()
  window.dispatchEvent(new CustomEvent('sync-state', { detail: db.getState() }))
  console.log(JSON.stringify(db.getState()))
}

if (process.env.NODE_ENV === 'production') {
  let meta = require('./meta.json')
  db.defaults(meta).write()
}

function godebug ({ mounter }) {
  // debuggers
  mounter.style.whiteSpacing = 'pre'
  mounter.innerText = JSON.stringify(db.getState())
  window.addEventListener('sync-state', ({ detail }) => {
    mounter.innerText = JSON.stringify(detail)
  })
}

function setup ({ mounter }) {
  godebug({ mounter })
}

export default setup
export { setup }
`
  fs.writeFileSync(folder.path + '/src/js/entry.js', codeJS, 'utf8')
}

function makeBoxJSa ({ folder }) {
  let codeJS = /* jsx */`
  import moment from 'moment'
export default () => {
  console.log('core.js', moment().calendar())
  return moment().calendar() + 'core' + Math.random()
}
  `
  fs.writeFileSync(folder.path + '/src/js/boxes/core.js', codeJS, 'utf8')
}

function makeBoxJSb ({ folder }) {
  let codeJS = /* jsx */`
import moment from 'moment'
export default () => {
  console.log('apple.js', moment().calendar())
  return moment().calendar() + 'apple'
}
  `
  fs.writeFileSync(folder.path + '/src/js/boxes/apple.js', codeJS, 'utf8')
}

function makeMeta ({ folder }) {
  let metaJSON = JSON.stringify({
    "boxes": [],
    "cables": [],
    "slots": []
  }, null, 2)

  fs.writeFileSync(folder.path + '/src/js/meta.json', metaJSON, 'utf8')
}

function makePackage ({ folder }) {
  let packageJSON = JSON.stringify({
    "name": "effectnode-project",
    "license": "MIT",
    "devDependencies": {
      "parcel-bundler": "*",
      "npm-run-all": "^0.0.0",
      "serve": "*"
    },
    "scripts": {
      "dev": "run-p watchjs start",
      "watchjs": "parcel watch ./src/js/entry.js --out-dir prod/dist/js --cache-dir cache --no-source-maps --global MyCanvas",
      "build": "NODE_ENV=production parcel build ./src/js/entry.js --out-dir prod/dist/js --cache-dir cache --no-source-maps --global MyCanvas",
      "start": "serve ./prod"
    },
    "dependencies": {
      "lowdb": "^1.0.0",
      "moment": "^2.29.1"
    }
  })
  fs.writeFileSync(folder.path + '/package.json', packageJSON, 'utf8')
}

function makeGitIgnore ({ folder }) {
  let gitIgnore = `# See https://help.github.com/ignore-files/ for more about ignoring files.

# dependencies
/node_modules

# testing
/coverage

# production
/build
/dist

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
.idea

/cache`

  fs.writeFileSync(folder.path + '/.gitignore', gitIgnore, 'utf8')
}

export function createFiles ({ folderPath }) {
  // let fs = window.require('fs')
  // let path = window.require('path')

  let folder = { path: folderPath }

  makeFolders({ folder })
  writeHTML({ folder })
  makeEntryJS({ folder })
  makeBoxJSa({ folder })
  makeBoxJSb({ folder })
  makePackage({ folder })
  makeMeta({ folder })
  makeGitIgnore({ folder })
}

export async function installDeps ({ folder }) {
  let spawn = window.require('child_process').spawn

  return new Promise((resolve) => {
    let process = spawn('npm', ['i'], { cwd: folder.path })
    process.stderr.on('data', (e) => {
      // logRef.current.innerText += '\n' + (e + '')
      // logRef.current.scrollTop = logRef.current.scrollHeight

      console.log(e + '')
    })
    process.stdout.on('data', (e) => {
      // logRef.current.innerText += '\n' + (e + '')
      // logRef.current.scrollTop = logRef.current.scrollHeight

      console.log(e + '')
    })
    process.on('exit', () => {
      console.log('open project')
      resolve()
    })
  })
}

export async function runSession ({ projectRoot, onReady = () => {} }) {
  const Bundler = window.require('parcel-bundler');
  const getPort = window.require('get-port');
  const path = require('path');
  const entryFiles = path.join(projectRoot, './src/js/entry.js');

  const options = {
    outDir: path.join(projectRoot, './prod/dist/js/'), // The out directory to put the build files in, defaults to dist
    // outFile: '*.js', // The name of the outputFile
    publicUrl: '/', // The url to serve on, defaults to '/'
    watch: true, // Whether to watch the files and rebuild them on change, defaults to process.env.NODE_ENV !== 'production'
    cache: true, // Enabled or disables caching, defaults to true
    cacheDir: path.join(projectRoot, './cache'), // The directory cache gets put in, defaults to .cache
    contentHash: false, // Disable content hash from being included on the filename
    global: 'MyCanvas', // Expose modules as UMD under this name, disabled by default
    minify: false, // Minify files, enabled if process.env.NODE_ENV === 'production'
    scopeHoist: false, // Turn on experimental scope hoisting/tree shaking flag, for smaller production bundles
    target: 'browser', // Browser/node/electron, defaults to browser
    bundleNodeModules: true, // By default, package.json dependencies are not included when using 'node' or 'electron' with 'target' option above. Set to true to adds them to the bundle, false by default

    // https: { // Define a custom {key, cert} pair, use true to generate one or false to use http
    //   cert: './ssl/c.crt', // Path to custom certificate
    //   key: './ssl/k.key' // Path to custom key
    // },
    logLevel: 3, // 5 = save everything to a file, 4 = like 3, but with timestamps and additionally log http requests to dev server, 3 = log info, warnings & errors, 2 = log warnings & errors, 1 = log errors, 0 = log nothing
    hmr: false, // Enable or disable HMR while watching
    hmrPort: 0, // The port the HMR socket runs on, defaults to a random free port (0 in node.js resolves to a random free port)
    sourceMaps: false, // Enable or disable sourcemaps, defaults to enabled (minified builds currently always create sourcemaps)
    hmrHostname: '', // A hostname for hot module reload, default to ''
    detailedReport: true, // Prints a detailed report of the bundles, assets, filesizes and times, defaults to false, reports are only printed if watch is disabled
    autoInstall: true, // Enable or disable auto install of missing dependencies found during bundling
  };

  let server = false
  try {
    let port = await getPort({ port: 3333 })
    // Initializes a bundler using the entrypoint location and options provided
    const bundler = new Bundler(entryFiles, options);
    bundler.on('buildStart', entry => {
      // Do something...
      console.log('start-packing', entry)
    });

    bundler.on('buildEnd', () => {
      // Do something...
      console.log('done-packing')
      window.dispatchEvent(new CustomEvent('done-packing', { detail: { port } }))
    });

    bundler.on('buildError', (error) => {
      console.log('error-packing', error)
    });

    bundler.on('bundled', (bundle) => {
      console.log('done-packing', bundle)
      window.dispatchEvent(new CustomEvent('done-packing', { detail: { port } }))
      // bundler contains all assets and bundles, see documentation for details
    });

    // Run the bundler, this returns the main bundle
    // Use the events if you're using watch mode as this promise will only trigger once and not for every rebuild
    const bundle = await bundler.bundle();
    console.log(bundle)

    onReady({
      port,
      pack: async () => {
        await bundler.bundle();
      },
      onDonePack: (donePack) => {
        window.addEventListener('done-packing', donePack)
        return () => {
          window.removeEventListener('done-packing', donePack)
        }
      }
    })

    var express = window.require('express')
    var app = express()

    app.get('/', (req, res) => {
      res.send(makeHTMLCode({ nonce: getNonce(), cspSource: 'http://localhost:' + port }))
    })

    app.use(express.static(path.join(projectRoot, './prod/')))

    server = app.listen(port, () => {
      console.log('http://localhost:' + port + '/?r=' + Math.random())
    })
  } catch (e) {
    console.log(e)
  }

  return () => {
    if (server) {
      server.close()
    }
  }
}

export function watchFiles ({ projectRoot, onTree = () => {} }) {
  // const fs = window.require('fs-extra')
  var watch = window.require('node-watch');
  // const dirTree = window.require("directory-tree");

  // fs.ensureDirSync(projectRoot + '/src/js/boxes')

  // const getTree = () => {
  //   fs.ensureDirSync(projectRoot + '/src/js/boxes')
  //   dirTree(projectRoot + '/src/js/boxes');
  // }

  let watcher = watch(projectRoot + '/src/js/boxes', { recursive: false });

  watcher.on('change', function(evt, name) {
    console.log(evt, name)
    onTree()
    // window.dispatchEvent(new CustomEvent('reload-tree', { detail: {} }))
    // onTree({ tree: getTree() })
  });

  watcher.on('error', function(err) {
    // handle error
    console.log(err)
    window.location.assign('/')
  });

  watcher.on('ready', function() {
    // the watcher is ready to respond to changes
    console.log('ready')
    onTree()
    // window.dispatchEvent(new CustomEvent('reload-tree', { detail: {} }))
    // onTree({ tree: getTree() })
  });

  window.process.on('SIGINT', () => {
    if (!watcher.isClosed()) {
      watcher.close()
    }
  });

  return () => {
    if (!watcher.isClosed()) {
      watcher.close()
    }
  }
}
