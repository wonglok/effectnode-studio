/* eslint-disable react-hooks/exhaustive-deps */
import localforage from 'localforage'
import create from 'zustand'

export const useApp = create((set, get) => {
  let projectStorage = localforage.createInstance({
    name: 'EffectNodeEditorProjects',
    version: 1.0,
    description: 'Effect Node Editor Local projects'
  })


  let map = new Map()
  let provdeStroage = (id) => {
    if (map.has(id)) {
      return map.get(id)
    }

    let snapshotStorage = localforage.createInstance({
      name: 'ProjectSnapshots_' + id,
      version: 1.0,
      description: 'Effect Node Editor Local projects'
    })
    map.set(id, snapshotStorage)

    return map.get(id)
  }

  let getID = () => `_${(Math.random() * 100000000).toFixed(0)}`

  return {
    refresher: 0,
    refresh: () => {
      set({ refresher: Math.random() })
    },
    getDocs: async () => {
      let keys = await projectStorage.keys()
      let snaps = []
      for (let key of keys) {
        let item = await projectStorage.getItem(key)
        snaps.push(item)
      }

      return snaps

      // projectStorage.keys().then(keys => {
      //   keys.forEach(key => {
      //     projectStorage.getItem(key)
      //       .then(e => {
      //         let docs = get().docs
      //         set({
      //           docs: [e, ...docs]
      //         })
      //       })
      //   })
      // })
    },
    putDoc: async ({ doc }) => {
      return projectStorage.setItem(doc._id, doc)
    },
    getDoc: async ({ _id }) => {
      return await projectStorage.getItem(_id)
    },
    snapDoc: async ({ _id }) => {
      let doc = await get().getDoc({ _id })
      let storage = provdeStroage(_id)
      let snapID = getID()
      doc.snapID = snapID
      doc.timestamp = Number(new Date().getTime())
      await storage.setItem(snapID, doc)
    },
    removeSnap: async ({ snap }) => {
      let storage = provdeStroage(snap._id)
      await storage.removeItem(snap.snapID)
    },
    getDocSnaps: async ({ _id }) => {
      let storage = provdeStroage(_id)
      let keys = await storage.keys()
      let snaps = []
      for (let key of keys) {
        let item = await storage.getItem(key)
        snaps.push(item)
      }
      snaps = snaps.slice().sort((a, b) => {
        if (a.timestamp > b.timestamp) {
          return -1
        } else if (a.timestamp < b.timestamp) {
          return 1
        } else {
          return 0
        }
      })
      return snaps
    },
    makeDoc: () => {
      return {
        _id: getID(),
        boxes: [
          { _id: `1`, pos: [-10.988941161815694, 0, 42.08334184750419] },
          { _id: `2`, pos: [8.300182017143229, 0, -0.33103547666145783] },
          { _id: `3`, pos: [-5.065318456037108, 0, -33.00809715320201] },
          { _id: `4`, pos: [-11.847359581312615, 0, -67.95400454597868] },
        ],
        lines: [
          { _id: `l1`, from: `1`, to: `2` },
          { _id: `l2`, from: `2`, to: `3` },
          { _id: `l3`, from: `3`, to: `4` },
          // { _id: `l3`, from: `1`, to: `3` },
        ]
      }
    }
  }
})
