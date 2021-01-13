import create from 'zustand'

export function makeMod () {
  return create((set, get) => {
    return {
      boxes: [],
      lines: [],
      getID: () => {
        return `_ID_${(10000000000000 * Math.random()).toFixed(0)}`
      },
      get,
      set
    }
  })
}

export const useEffectNode = makeMod()

export const useEffectNodeTemp = create((set, get) => {
  return {
    handMode: 'ready',
    handBoxID: false,
    handSlotType: false,
    get,
    set
  }
})
