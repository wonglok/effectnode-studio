import localforage from "localforage";
import slugify from "slugify";
import create from "zustand";
// import produce, { createDraft, finishDraft } from "immer"

let getID = () => `_${(Math.random() * 100000000).toFixed(0)}`;

const smalltalk = require("../ui/smalltalk/smalltalk");

export const makeUseWinBoxStore = (groupID) =>
  create((set, get) => {
    let rootStorage = localforage.createInstance({
      name: "EffectNodeWinBox" + groupID,
      version: 1.0,
      description: "Effect Node Windows",
    });

    let getSnaps = async () => {
      let keys = await rootStorage.keys();
      let snaps = [];
      for (let key of keys) {
        let item = await rootStorage.getItem(key);
        snaps.push(item);
      }
      return snaps;
    };

    getSnaps().then((s) => {
      set({ winboxes: s });
    });

    return {
      winboxes: [],
      getDoc: async ({ _id }) => {
        return await rootStorage.getItem(_id);
      },
      getSlug: (name) => {
        return slugify(name, { strict: true, replacement: "_", lower: true });
      },
      makeDoc: async ({ name = "box", pos = {} }) => {
        return {
          _id: getID(),
          name,
          x: 0,
          y: 0,
          w: 515,
          h: 515,
          ...pos,
          zIndex: 0,
          hidden: false,
        };
      },
      makeDocAsk: async ({ pos = {} }) => {
        let name = await smalltalk().prompt(
          "Please enter name for your new box.",
          "Example: newbox"
        );
        name = name || "box";
        name = slugify(name);
        return {
          _id: getID(),
          name,
          x: 0,
          y: 0,
          w: 515,
          h: 515,
          ...pos,
          hidden: false,
        };
      },
      removeDoc: async ({ doc }) => {
        await rootStorage.removeItem(doc._id);
        await get().reload();
      },
      save: async ({ doc }) => {
        await rootStorage.setItem(doc._id, doc);
        await get().reload();
      },
      reload: async () => {
        let snaps = await getSnaps();
        set({ winboxes: snaps });
        return JSON.parse(JSON.stringify(snaps));
      },
    };
  });
