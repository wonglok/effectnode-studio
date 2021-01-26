const fs = require('fs-extra')

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

let makeHTMLCode = module.exports.makeHTMLCode = function makeHTMLCode () {
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

module.exports.createProjectFiles = function createProjectFiles ({ folderPath }) {
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