import slugify from "slugify";
import create from "zustand";
/* eslint-disable react-hooks/exhaustive-deps */
// let getID = () => `_${(Math.random() * 100000000).toFixed(0)}`

let dbCache = false;

export const getLowDB = ({ filePath }) => {
  if (dbCache) {
    return dbCache;
  } else {
    const fs = window.require("fs");
    const low = window.require("lowdb");
    const Memory = window.require("lowdb/adapters/Memory");
    const adapter = new Memory();
    adapter.write = () => {};
    const db = low(adapter);

    const text = fs.readFileSync(filePath, "utf-8");

    let json = {};

    try {
      json = JSON.parse(text);
      db.setState(json);
    } catch (e) {
      console.log(e);
    }

    dbCache = db;
    return dbCache;
  }
};

export const makeUseEngine = ({ projectRoot }) => {
  return create((set, get) => {
    return {};
  });
};
