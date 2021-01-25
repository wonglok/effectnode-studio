/* eslint-disable react-hooks/exhaustive-deps */
let getID = () => `_${(Math.random() * 100000000).toFixed(0)}`

let cache = false

export const getLowDB = ({ filePath }) => {
  if (cache) {
    return cache
  } else {
    const fs = window.require('fs')
    const low = window.require('lowdb')
    const Memory = window.require('lowdb/adapters/Memory')
    const adapter = new Memory()
    const db = low(adapter)

    const text = fs.readFileSync(filePath, 'utf-8')

    let json = {}

    try {
      json = JSON.parse(text)
      db.setState(json)
    } catch (e) {
      console.log(e)
    }

    cache = db
    return cache
  }
}