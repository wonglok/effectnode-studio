const getPort = window.require('get-port');
const fs = window.require('fs')

export function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

function makeHTMLCode ({ cspSource, nonce }) {
  return /* html */`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <meta http-equiv="Content-Security-Policy" content="default-src ${cspSource} blob:; img-src ${cspSource}; style-src 'nonce-${nonce}' ${cspSource}; script-src 'nonce-${nonce}';">
    <title>EffectNode Project</title>
    <style nonce="${nonce}" >
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
    <script nonce="${nonce}" src="./js/entry.js"></script>
    <script nonce="${nonce}">
      console.log(window.MyCanvas.default({ mounter: document.querySelector('#root') }))
    </script>
  </body>
  </html>`
}

function writeHTML ({ folder }) {
  const indexHTML = makeHTMLCode({ nonce: getNonce(), cspSource: 'http://localhost:3333' })
  fs.writeFileSync(folder.path + '/dist/index.html', indexHTML, 'utf8')
}

function makeFolders ({ folder }) {
  fs.mkdirSync(folder.path + '/dist', { recursive: true })
  fs.mkdirSync(folder.path + '/src', { recursive: true })
  fs.mkdirSync(folder.path + '/src/js', { recursive: true })
  fs.mkdirSync(folder.path + '/src/js/boxes', { recursive: true })
}

function makeEntryJS ({ folder }) {
  let codeJS = /* jsx */`
import * as All from './boxes/*.js'
for (let kn in All) {
  All[kn]();
}
  `
  fs.writeFileSync(folder.path + '/src/js/entry.js', codeJS, 'utf8')
}

function makePackage ({ folder }) {
  let packageJSON = JSON.stringify({
    "name": "effectnode-project",
    "devDependencies": {
      "parcel-bundler": "*"
    },
    "scripts": {
      "dev": "parcel index.html",
      "build": "parcel build index.html"
    }
  })
  fs.writeFileSync(folder.path + '/package.json', packageJSON, 'utf8')
}

export function createFiles ({ folder }) {
  // let fs = window.require('fs')
  // let path = window.require('path')

  makeFolders({ folder })
  writeHTML({ folder })
  makeEntryJS({ folder })
  makePackage({ folder })
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

export async function runSession ({ projectRoot, onReload = () => {} }) {
  const Bundler = window.require('parcel-bundler');
  const path = require('path');
  const entryFiles = path.join(projectRoot, './src/js/entry.js');

  const options = {
    outDir: path.join(projectRoot, './dist/js/'), // The out directory to put the build files in, defaults to dist
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

  try {
    let port = await getPort({port: 3333})
    // Initializes a bundler using the entrypoint location and options provided
    const bundler = new Bundler(entryFiles, options);
    bundler.on('buildStart', entry => {
      // Do something...
      console.log('buildStart', entry)
    });

    bundler.on('buildEnd', () => {
      // Do something...
      console.log('buildEnd')
      onReload({ port, url: `http://localhost:${port}` })
    });

    bundler.on('buildError', (error) => {
      console.log('buildError', error)
    });

    bundler.on('bundled', (bundle) => {
      console.log('bundled', bundle)
      // bundler contains all assets and bundles, see documentation for details
    });

    // Run the bundler, this returns the main bundle
    // Use the events if you're using watch mode as this promise will only trigger once and not for every rebuild
    const bundle = await bundler.bundle();
    console.log(bundle)

    var express = window.require('express')
    var app = express()

    app.get('/', (req, res) => {
      res.send(makeHTMLCode({ nonce: getNonce(), cspSource: 'http://localhost:' + port }))
    })

    app.use(express.static(path.join(projectRoot, './dist/')))

    app.listen(port, () => {
      console.log('http://localhost:' + port)
    })
  } catch (e) {
    console.log(e)
  }
}