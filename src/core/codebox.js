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

    window.addEventListener("save-state", saver);
    return () => {
      window.removeEventListener("save-state", saver);
    };
  });

  const updateBox = async (box) => {
    db.get("boxes")
      .find((e) => e._id === box._id)
      .assign({
        ...box,
      })
      .write();
    window.dispatchEvent(new Event("save-state"));
    window.dispatchEvent(new Event("stream-to-webview"));
  };

  const addBox = async () => {
    const state = db.getState();

    let _id = getID();

    let displayName = await smalltalk.prompt(
      "Please enter name for your new box.",
      "Example: newbox"
    );
    let name = displayName || "box";
    name = makeSlug(name);

    let file = `${_id}__ID__${name}.js`;
    let filePath = path.join(root, `./src/js/boxes/${file}`);
    db.get("boxes")
      .push({
        protected: state.boxes.length === 0,
        isUserBoxes: true,
        _id,
        x: 20,
        y: 60,
        displayName,
        name,
        file,
      })
      .write();

    fs.ensureDirSync(path.join(root, `./src/js/boxes/`));

    fs.ensureFileSync(filePath);
    fs.writeFileSync(
      filePath,
      /* jsx */ `
module.exports.box = () => {
  return {
    name: ${JSON.stringify(name)},
  }
}
    `,
      "utf-8"
    );

    window.dispatchEvent(new Event("save-state"));
    window.dispatchEvent(new Event("stream-to-webview"));
  };

  const removeBox = async ({ file }) => {
    let _id = file._id;
    db.get("boxes").remove({ _id }).write();
    fs.removeSync(file.path);

    window.dispatchEvent(new Event("save-state"));
    window.dispatchEvent(new Event("stream-to-webview"));
  };

  const resolvePath = ({ box }) => {
    if (box.isEntry) {
      return path.join(root, "src/js/", box.file);
    } else if (box.isUserBoxes) {
      return path.join(root, "src/js/boxes", box.file);
    } else {
      return path.join(root, "src/js/boxes", box.file);
    }
  };

  return {
    resolvePath,
    updateBox,
    removeBox,
    addBox,
  };
};
