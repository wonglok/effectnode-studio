function makeHTMLCode() {
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
      window.MyCanvas.default({ mounter: document.querySelector('#root') });
    </script>
  </body>
  </html>`;
}

export async function runServer({ projectRoot, onReady = () => {} }) {
  const Bundler = window.require("parcel-bundler");
  const getPort = window.require("get-port");
  const path = window.require("path");
  const fs = window.require("fs-extra");
  const entryFiles = path.join(projectRoot, "./src/js/entry.js");

  const ensureMetaFolderPath = path.join(projectRoot, "./prod/dist/js/");
  const metaFileSRC = path.join(projectRoot, "./src/js/meta.json");
  const metaFileProd = path.join(projectRoot, "./prod/dist/js/meta.json");

  let copyMETA = async () => {
    try {
      await fs.ensureDir(ensureMetaFolderPath);
      await fs.copy(metaFileSRC, metaFileProd);
    } catch (e) {
      console.log(e);
    }
  };

  const options = {
    outDir: path.join(projectRoot, "./prod/dist/js/"), // The out directory to put the build files in, defaults to dist
    // outFile: '*.js', // The name of the outputFile
    publicUrl: "/", // The url to serve on, defaults to '/'
    watch: true, // Whether to watch the files and rebuild them on change, defaults to process.env.NODE_ENV !== 'production'
    cache: true, // Enabled or disables caching, defaults to true
    cacheDir: path.join(projectRoot, "./cache"), // The directory cache gets put in, defaults to .cache
    contentHash: false, // Disable content hash from being included on the filename
    global: "MyCanvas", // Expose modules as UMD under this name, disabled by default
    minify: false, // Minify files, enabled if process.env.NODE_ENV === 'production'
    scopeHoist: false, // Turn on experimental scope hoisting/tree shaking flag, for smaller production bundles
    target: "browser", // Browser/node/electron, defaults to browser
    bundleNodeModules: true, // By default, package.json dependencies are not included when using 'node' or 'electron' with 'target' option above. Set to true to adds them to the bundle, false by default

    // https: { // Define a custom {key, cert} pair, use true to generate one or false to use http
    //   cert: './ssl/c.crt', // Path to custom certificate
    //   key: './ssl/k.key' // Path to custom key
    // },
    logLevel: 3, // 5 = save everything to a file, 4 = like 3, but with timestamps and additionally log http requests to dev server, 3 = log info, warnings & errors, 2 = log warnings & errors, 1 = log errors, 0 = log nothing
    hmr: false, // Enable or disable HMR while watching
    hmrPort: 0, // The port the HMR socket runs on, defaults to a random free port (0 in node.js resolves to a random free port)
    sourceMaps: false, // Enable or disable sourcemaps, defaults to enabled (minified builds currently always create sourcemaps)
    hmrHostname: "", // A hostname for hot module reload, default to ''
    detailedReport: true, // Prints a detailed report of the bundles, assets, filesizes and times, defaults to false, reports are only printed if watch is disabled
    autoInstall: true, // Enable or disable auto install of missing dependencies found during bundling
  };

  let server = false;
  try {
    let port = await getPort({ port: 3333 });
    // Initializes a bundler using the entrypoint location and options provided
    const bundler = new Bundler(entryFiles, options);
    bundler.on("buildStart", (entry) => {
      // Do something...
      console.log("start-packing", entry);
    });

    bundler.on("buildEnd", () => {
      // Do something...
      console.log("done-packing");
      window.dispatchEvent(new CustomEvent("done-packing", { detail: {} }));
    });

    bundler.on("buildError", (error) => {
      console.log("error-packing", error);
    });

    bundler.on("bundled", (bundle) => {
      console.log("done-packing", bundle);
      window.dispatchEvent(new CustomEvent("done-packing", { detail: {} }));
      // bundler contains all assets and bundles, see documentation for details
    });

    // Run the bundler, this returns the main bundle
    // Use the events if you're using watch mode as this promise will only trigger once and not for every rebuild
    const bundle = await bundler.bundle();
    console.log(bundle);

    window.addEventListener("try-bundle", () => {
      bundler.bundle();
    });

    onReady({
      port,
      pack: async () => {
        await bundler.bundle();
      },
      onDonePack: (donePack) => {
        let donePackingHandler = async () => {
          await copyMETA();
          donePack({ port });
        };

        window.addEventListener("done-packing", donePackingHandler);
        return () => {
          window.removeEventListener("done-packing", donePackingHandler);
        };
      },
    });

    var express = window.require("express");
    var app = express();

    app.get("/", (req, res) => {
      res.send(makeHTMLCode({}));
    });

    app.use(express.static(path.join(projectRoot, "./prod/")));

    server = app.listen(port, () => {
      console.log("http://localhost:" + port + "/?r=" + Math.random());
    });
  } catch (e) {
    console.log(e);
  }

  return () => {
    if (server) {
      server.close();
    }
  };
}

export function watchFiles({ projectRoot, onTree = () => {} }) {
  // const fs = require('fs-extra')
  var watch = window.require("node-watch");
  // const dirTree = require("directory-tree");

  // fs.ensureDirSync(projectRoot + '/src/js/boxes')

  // const getTree = () => {
  //   fs.ensureDirSync(projectRoot + '/src/js/boxes')
  //   dirTree(projectRoot + '/src/js/boxes');
  // }

  let watcher = watch(projectRoot + "/src/js/boxes", { recursive: false });

  watcher.on("change", function (evt, name) {
    console.log(evt, name);
    onTree();
    // window.dispatchEvent(new CustomEvent('reload-tree', { detail: {} }))
    // onTree({ tree: getTree() })
  });

  watcher.on("error", function (err) {
    // handle error
    console.log(err);
    // window.location.assign("/");
  });

  watcher.on("ready", function () {
    // the watcher is ready to respond to changes
    console.log("ready");
    onTree();
    // window.dispatchEvent(new CustomEvent('reload-tree', { detail: {} }))
    // onTree({ tree: getTree() })
  });

  window.process.on("SIGINT", () => {
    if (!watcher.isClosed()) {
      watcher.close();
    }
  });

  return () => {
    if (!watcher.isClosed()) {
      watcher.close();
    }
  };
}
