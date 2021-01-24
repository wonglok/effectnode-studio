/* eslint-disable react-hooks/exhaustive-deps */
import localforage from 'localforage'
import create from 'zustand'

let getID = () => `_${(Math.random() * 100000000).toFixed(0)}`

export const useWinsNamed = (nameSpace) => create((set, get) => {
  let rootStorage = localforage.createInstance({
    name: 'EffectNodeWindows-' + nameSpace,
    version: 1.0,
    description: 'Effect Node Windows'
  })

  return {
    refresh: 0,
    rootStorage,
    get,
    set,
    getDocs: async () => {
      let keys = await rootStorage.keys()
      let snaps = []
      for (let key of keys) {
        let item = await rootStorage.getItem(key)
        snaps.push(item)
      }
      return snaps
    },
    setDoc: async ({ doc }) => {
      setTimeout(() => {
        set({ refresh: Math.random() })
      }, 0)

      return rootStorage.setItem(doc._id, doc)
    },
    getDoc: async ({ _id }) => {
      return await rootStorage.getItem(_id)
    },
    removeDoc: async ({ doc }) => {
      setTimeout(() => {
        set({ refresh: Math.random() })
      }, 0)

      let res = await rootStorage.removeItem(doc._id)
      return res
    },
    makeDoc: () => {
      return {
        _id: getID()
      }
    }
  }
})


export const useAppsNamed = (nameSpace) => create((set, get) => {
  let rootStorage = localforage.createInstance({
    name: 'EffectNodeApps-' + nameSpace,
    version: 1.0,
    description: 'Effect Node Apps'
  })

  return {
    refresh: 0,
    rootStorage,
    get,
    set,
    getDocs: async () => {
      let keys = await rootStorage.keys()
      let snaps = []
      for (let key of keys) {
        let item = await rootStorage.getItem(key)
        snaps.push(item)
      }
      return snaps
    },
    setDoc: async ({ doc }) => {
      set({ refresh: Math.random() })
      return rootStorage.setItem(doc._id, doc)
    },
    getDoc: async ({ _id }) => {
      return await rootStorage.getItem(_id)
    },
    removeDoc: async ({ doc }) => {
      setTimeout(() => {
        set({ refresh: Math.random() })
      }, 0)

      let res = await rootStorage.removeItem(doc._id)
      return res
    },
    makeDoc: () => {
      return {
        _id: getID()
      }
    }
  }
})
