import _ from 'lodash'
import { useEffect, useState } from 'react'
import slugify from 'slugify'
import { getLowDB } from './useLow'

const smalltalk = require('smalltalk')

let path = window.require('path')
let getID = () => `_${(Math.random() * 100000000).toFixed(0)}`
let fs = window.require('fs-extra')

function makeSlug (str) {
  return slugify(str, {
    replacement: '_',  // replace spaces with replacement character, defaults to `-`
    lower: true,      // convert to lower case, defaults to `false`
    strict: true     // strip special characters except replacement, defaults to `false`
  })
}

export const useWorkbench = ({ projectRoot }) => {
  const [refresh, setRefresh] = useState(0)
  const db = getLowDB({ filePath: path.join(projectRoot, '/src/js/meta.json') })
  const state = db.getState()

  useEffect(() => {
    let saveInstant = (json) => {
      // let tag = moment().format('YYYY-MM-DD__[time]__hh-mm-ss-a') + '__randomID_' + getID()
      fs.writeFileSync(path.join(projectRoot, './src/js/meta.json'), JSON.stringify(json, null, '\t'), 'utf-8')
    }

    let saver = _.debounce(() => {
      saveInstant(db.getState())
    }, 1000, { leading: true, trailing: true })

    window.addEventListener('save', saver)
    return () => {
      window.removeEventListener('save', saver)
    }
  })

  const updateBox = (box) => {
    db.get('boxes').find(e => e._id === box._id).assign({
      ...box
    }).write()
    window.dispatchEvent(new Event('save'))
  }

  const addBox = async () => {
    let _id = getID()

    let name = await smalltalk.prompt('Please enter name for your new box.', 'Example: newbox')
    name = name || 'box'
    name = makeSlug(name)

    let file = `${name}__ID__${_id}.js`
    let filePath = path.join(projectRoot, `./src/js/boxes/${file}`)
    db.get('boxes').push({
      _id,
      x: 0,
      y: 0,
      name,
      file,
      path: filePath
    }).write()

    fs.ensureDirSync(path.join(projectRoot, `./src/js/boxes/`))

    fs.ensureFileSync(filePath)
    fs.writeFileSync(filePath, /* jsx */`
module.exports = () => {
}
    `, 'utf-8')

    window.dispatchEvent(new Event('save'))
    setRefresh(s => s + 1)
  }

  const removeBox = ({ file }) => {
    let _id = file._id
    db.get('boxes').remove({ _id }).write()
    fs.removeSync(file.path)

    window.dispatchEvent(new Event('save'))
    setRefresh(s => s + 1)
  }

  return {
    state,
    refresh,
    updateBox,
    removeBox,
    addBox,
    projectRoot
  }
}