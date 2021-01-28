const fs = require("fs-extra");

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

let makeHTMLCode = (module.exports.makeHTMLCode = function makeHTMLCode() {
  return /* html */ `<!DOCTYPE html>
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>EffectNode Project</title>
    <style>
      body,html,.full, #root{
        width: 100%;
        height: 100%;
      }
      body,html{
        margin: 0px;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script src="./dist/js/entry.js"></script>
    <script>
      console.log(window.MyCanvas.default({ mounter: document.querySelector('#root') }))
    </script>
  </body>
  </html>`;
});

function writeHTML({ folder }) {
  const indexHTML = makeHTMLCode({
    nonce: getNonce(),
    cspSource: "http://localhost:3333",
  });
  fs.writeFileSync(folder.path + "/prod/index.html", indexHTML, "utf8");
}

function makeFolders({ folder }) {
  fs.mkdirSync(folder.path + "/prod", { recursive: true });
  fs.mkdirSync(folder.path + "/prod/dist", { recursive: true });
  fs.mkdirSync(folder.path + "/prod/dist/js", { recursive: true });
  fs.mkdirSync(folder.path + "/src", { recursive: true });

  fs.mkdirSync(folder.path + "/src/assets", { recursive: true });
  fs.mkdirSync(folder.path + "/src/js", { recursive: true });
  fs.mkdirSync(folder.path + "/src/js/boxes", { recursive: true });
  fs.mkdirSync(folder.path + "/src/js/meta_backup", { recursive: true });
}

function makeEntryJS({ folder }) {
  /* ----- START ---- */
  /* ----- START ---- */
  /* ----- START ---- */
  /* ----- START ---- */
  /* ----- START ---- */

  let codeJS = /* jsx */ `

import "regenerator-runtime/runtime";
import BoxScripts from "./boxes/*.js";
import lowdb from "lowdb";
import Base from "lowdb/adapters/Base";

class Memory extends Base {
  read() {
    return this.defaultValue;
  }
  write() {}
}
let adapter = new Memory();
export const db = lowdb(adapter);

window.StreamInput = (val) => {
  db.setState(val).write();

  window.dispatchEvent(
    new CustomEvent("refresh-state", { detail: db.getState() })
  );

  // console.log(JSON.stringify(db.getState()));
};

if (process.env.NODE_ENV === "production") {
  let meta = require("./meta.json");
  db.setState(meta).write();
}

const onReady = (cb) => {
  let tt = setInterval(() => {
    let state = db.getState();
    if (state && state.boxes && state.cables) {
      clearTimeout(tt);
      cb();
    }
  });
};

function MyCore({ mounter }) {
  let globalMap = new Map();
  let context = {
    get: (name) => {
      return new Promise((resolve) => {
        let tt = setInterval(() => {
          if (globalMap.has(name)) {
            clearInterval(tt);
            resolve(globalMap.get(name));
          }
        });
      });
    },
    set: async (name, val) => {
      globalMap.set(name, val);
      return val;
    },
  };

  let runEachModule = () => {
    let boxes = db.getState().boxes;

    for (let box of boxes) {
      let onChangeRootState = async (cb) => {
        let lastClean = () => {};
        window.addEventListener("refresh-state", async () => {
          typeof lastClean === "function" && (await lastClean());
          lastClean = await cb({ state: db.getState() });
        });
        lastClean = await cb({ state: db.getState() });
      };

      let onChangeBox = async (cb) => {
        let lastClean = () => {};
        window.addEventListener("refresh-state", async () => {
          typeof lastClean === "function" && (await lastClean());
          let state = db.getState();
          let newBox = boxes.find((e) => e.moduleName === box.moduleName);
          lastClean = await cb({ state, box: newBox });
        });
        let state = db.getState();
        let newBox = boxes.find((e) => e.moduleName === box.moduleName);
        lastClean = await cb({ state, box: newBox });
      };

      let args = {
        log: (data) => {
          console.log(JSON.stringify(data, null, "    "));
        },
        context,
        onChangeBox,
        onChangeRootState,
        domElement: mounter,
      };
      BoxScripts[box.moduleName].box(args);
    }
  };

  runEachModule();
  return;
}

function main({ mounter }) {
  onReady(() => {
    MyCore({ mounter });
  });
}

export default main;
export { main };


`;

  /* -----END---- */
  /* -----END---- */
  /* -----END---- */
  /* -----END---- */
  /* -----END---- */

  fs.writeFileSync(folder.path + "/src/js/entry.js", codeJS, "utf8");
}

// function makeBoxJSa({ folder }) {
//   let codeJS = /* jsx */ `
//   import moment from 'moment'
// export default () => {
//   console.log('core.js', moment().calendar())
//   return moment().calendar() + 'core' + Math.random()
// }
//   `;
//   fs.writeFileSync(folder.path + "/src/js/boxes/core.js", codeJS, "utf8");
// }

// function makeBoxJSb({ folder }) {
//   let codeJS = /* jsx */ `
// import moment from 'moment'
// export default () => {
//   console.log('apple.js', moment().calendar())
//   return moment().calendar() + 'apple'
// }
//   `;
//   fs.writeFileSync(folder.path + "/src/js/boxes/apple.js", codeJS, "utf8");
// }

function makeMeta({ folder }) {
  let metaJSON = JSON.stringify(
    {
      boxes: [
        {
          isFirstUserBox: true,
          isProtected: true,
          isUserBoxes: true,
          _id: "AAA",
          x: 31.04864501953125,
          y: 82.77220153808594,
          displayName: "app",
          moduleName: "AAA__ID__app",
          fileName: "AAA__ID__app.js",
          slug: "app",
          inputs: [
            {
              _id: "main_rID_123",
              name: "main",
            },
            {
              _id: "mode_rID_456",
              name: "mode",
            },
          ],
        },
        {
          isFirstUserBox: false,
          isProtected: false,
          isUserBoxes: true,
          _id: "_47033524",
          x: 182.8225860595703,
          y: 219.65512084960938,
          displayName: "funfun",
          moduleName: "_47033524__ID__funfun",
          fileName: "_47033524__ID__funfun.js",
          slug: "funfun",
          inputs: [
            {
              _id: "_10240359",
              name: "main",
            },
            {
              _id: "_71389125",
              name: "speed",
            },
            {
              _id: "_424298",
              name: "color",
            },
          ],
        },
        {
          isFirstUserBox: false,
          isProtected: false,
          isUserBoxes: true,
          _id: "_5987859",
          x: 325.2441101074219,
          y: 362.7184753417969,
          displayName: "bb",
          moduleName: "_5987859__ID__bb",
          fileName: "_5987859__ID__bb.js",
          slug: "bb",
          inputs: [
            {
              _id: "_87739092",
              name: "main",
            },
            {
              _id: "_97050811",
              name: "speed",
            },
            {
              _id: "_3577102",
              name: "color",
            },
          ],
        },
      ],
      cables: [
        {
          _id: "_5304519",
          outputBoxID: "AAA",
          inputBoxID: "_47033524",
          inputSlotID: "_10240359",
        },
        {
          _id: "_92190910",
          outputBoxID: "_47033524",
          inputBoxID: "_5987859",
          inputSlotID: "_87739092",
        },
      ],
      slots: [],
    },
    null,
    2
  );
  let startingAppFile = `
module.exports.box = ({
  log,
  onChangeBox,
  context,
  domElement,
  onChangeRootState,
}) => {
  context.set("videoModule", {
    text: "test a 123, b 123, c 123 ",
  });
  context.get("videoModule").then((val) => {
    log(val);
  });

  let sleep = (t) => new Promise((resolve) => setTimeout(resolve, t));

  onChangeBox(async ({ box, boxes }) => {
    domElement.innerHTML = "running";
    await sleep(1000);
    domElement.innerHTML = box.moduleName + "_" + Math.random();

    return async () => {
      domElement.innerHTML = "cleaning";
      await sleep(1000);
    };
  });

  return {
    name: "app",
  };
};


`;

  fs.writeFileSync(folder.path + "/src/js/meta.json", metaJSON, "utf8");
  fs.writeFileSync(
    folder.path + "/src/js/boxes/AAA__ID__app.js",
    startingAppFile,
    "utf8"
  );
}

function makePackage({ folder }) {
  let packageJSON = JSON.stringify({
    name: "effectnode-project",
    license: "MIT",
    devDependencies: {
      "parcel-bundler": "*",
      "npm-run-all": "^0.0.0",
      serve: "*",
    },
    scripts: {
      dev: "run-p watchjs start",
      watchjs:
        "parcel watch ./src/js/entry.js --out-dir prod/dist/js --cache-dir cache --no-source-maps --global MyCanvas",
      build:
        "NODE_ENV=production parcel build ./src/js/entry.js --out-dir prod/dist/js --cache-dir cache --no-source-maps --global MyCanvas",
      start: "serve ./prod",
    },
    dependencies: {
      lowdb: "^1.0.0",
      moment: "^2.29.1",
    },
  });
  fs.writeFileSync(folder.path + "/package.json", packageJSON, "utf8");
}

function makeGitIgnore({ folder }) {
  let gitIgnore = `# See https://help.github.com/ignore-files/ for more about ignoring files.

# dependencies
/node_modules

# testing
/coverage

# production
/build
/dist

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
.idea

/cache`;

  fs.writeFileSync(folder.path + "/.gitignore", gitIgnore, "utf8");
}

module.exports.createProjectFiles = function createProjectFiles({
  folderPath,
}) {
  // let fs = window.require('fs')
  // let path = window.require('path')

  let folder = { path: folderPath };

  makeFolders({ folder });
  writeHTML({ folder });
  makeEntryJS({ folder });
  makeMeta({ folder });

  // makeBoxJSa({ folder });
  // makeBoxJSb({ folder });
  makePackage({ folder });
  makeGitIgnore({ folder });
};
