/* eslint-disable react-hooks/exhaustive-deps */
import create from 'zustand'

let getID = () => `_${(Math.random() * 100000000).toFixed(0)}`

let cache = false

export const useLowFile = ({ filePath }) => {
  if (cache) {
    return cache
  } else {
    cache = create((set, get) => {
      const low = window.require('lowdb')
      const FileAsync = window.require('lowdb/src/adapters/FileAsync.js')
      const adapter = new FileAsync(filePath)
      const db = low(adapter)
      return {
        db
      }
    })

    return cache
  }
}
