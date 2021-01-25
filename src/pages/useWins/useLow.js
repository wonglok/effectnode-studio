/* eslint-disable react-hooks/exhaustive-deps */
import create from 'zustand'

let getID = () => `_${(Math.random() * 100000000).toFixed(0)}`

let cache = false

export const useLowFile = ({ filePath }) => {
  if (cache) {
    return cache
  } else {
    const low = window.require('lowdb')
    const FileAsync = window.require('lowdb/src/adapters/FileAsync.js')
    const adapter = new FileAsync(filePath)
    const db = low(adapter)

    cache = db
    return cache
  }
}