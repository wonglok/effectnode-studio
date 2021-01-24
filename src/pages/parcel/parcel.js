
export function createFiles ({ folder }) {
  console.log(folder.path)
  let fs = window.require('fs')
  let path = window.require('path')

  let indexHTML = /* html */`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EffectNode Project</title>
  <style>
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="./js/code.js"></script>
</body>
</html>`
  fs.writeFileSync(folder.path + '/index.html', indexHTML, 'utf8')

  fs.mkdirSync(folder.path + '/js', { recursive: true })
  let codeJS = /* jsx */`
console.log('test');
  `
  fs.writeFileSync(folder.path + '/js/code.js', codeJS, 'utf8')

  let packageJSON = JSON.stringify(window.require('./template/package.json'))
  fs.writeFileSync(folder.path + '/package.json', packageJSON, 'utf8')
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