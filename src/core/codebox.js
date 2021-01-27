import { useEffect } from "react";
import slugify from "slugify";
const _ = window.require("lodash");
const smalltalk = require("smalltalk");
let path = window.require("path");
let getID = () => `_${(Math.random() * 100000000).toFixed(0)}`;
let fs = window.require("fs-extra");

function makeSlug(str) {
  return slugify(str, {
    replacement: "_", // replace spaces with replacement character, defaults to `-`
    lower: true, // convert to lower case, defaults to `false`
    strict: true, // strip special characters except replacement, defaults to `false`
  });
}

export const useBoxes = ({ db, root }) => {
  useEffect(() => {
    let saveInstant = (json) => {
      // let tag = moment().format('YYYY-MM-DD__[time]__hh-mm-ss-a') + '__randomID_' + getID()
      fs.writeFileSync(
        path.join(root, "./src/js/meta.json"),
        JSON.stringify(json, null, "\t"),
        "utf-8"
      );
    };

    let saver = _.debounce(
      () => {
        saveInstant(db.getState());
      },
      1000,
      { leading: true, trailing: true }
    );

    window.addEventListener("try-save-state", saver);
    return () => {
      window.removeEventListener("try-save-state", saver);
    };
  });

  const updateBox = async ({ box }) => {
    db.get("boxes")
      .find((e) => e._id === box._id)
      .assign({
        ...box,
      })
      .write();

    window.dispatchEvent(new Event("try-save-state"));
    window.dispatchEvent(new Event("stream-state-to-webview"));
  };

  const sepToken = `__ID__`;

  const addBox = async () => {
    const state = db.getState();
    const boxes = state.boxes;

    let _id = getID();

    let displayName = await smalltalk.prompt(
      "Please enter name for your new box.",
      "Example: newbox"
    );
    let name = displayName || "box";
    let slug = makeSlug(name);

    let moduleName = `${_id}${sepToken}${slug}`;
    let fileName = `${moduleName}.js`;
    let filePath = path.join(root, `./src/js/boxes/${fileName}`);
    db.get("boxes")
      .push({
        isFirstUserBox: boxes.length === 0,
        isProtected: false,
        isUserBoxes: true,
        _id,
        x: 20,
        y: 60 + 55 * boxes.length,
        displayName,
        moduleName,
        fileName,
        slug,
      })
      .write();

    fs.ensureDirSync(path.join(root, `./src/js/boxes/`));

    fs.ensureFileSync(filePath);
    fs.writeFileSync(
      filePath,
      /* jsx */ `
module.exports.box = () => {
  return {
    name: ${JSON.stringify(displayName)},
  }
}
    `,
      "utf-8"
    );

    window.dispatchEvent(new Event("try-save-state"));
    window.dispatchEvent(new Event("stream-state-to-webview"));
    window.dispatchEvent(new Event("reoad-page"));
  };

  const removeBox = async ({ box }) => {
    let _id = box._id;
    db.get("boxes").remove({ _id }).write();
    fs.removeSync(resolvePath({ box: box }));

    window.dispatchEvent(new Event("try-save-state"));
    window.dispatchEvent(new Event("stream-state-to-webview"));
    window.dispatchEvent(new Event("reoad-page"));
  };

  const resolvePath = ({ box }) => {
    // fileName
    let path = window.require("path");
    let state = db.getState();
    let JS_FOLDER = state.JS_FOLDER;
    let BOXES_FOLDER = state.BOXES_FOLDER;
    if (box.isEntry) {
      return path.join(root, JS_FOLDER, box.fileName);
    } else if (box.isUserBoxes) {
      return path.join(root, BOXES_FOLDER, box.fileName);
    } else {
      return path.join(root, BOXES_FOLDER, box.fileName);
    }
  };

  return {
    resolvePath,
    updateBox,
    removeBox,
    addBox,
  };
};
