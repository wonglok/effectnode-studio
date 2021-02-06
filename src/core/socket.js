export async function runSocket({
  slug,
  projectRoot,
  lowdb,
  onReady = () => {},
}) {
  // const getPort = window.require("get-port");
  // const path = window.require("path");

  // const fs = window.require("fs-extra");
  // const ensureMetaFolderPath = path.join(projectRoot, "./prod/dist/js/");
  // const metaFileSRC = path.join(projectRoot, "./src/js/meta.json");
  // const metaFileProd = path.join(projectRoot, "./prod/dist/js/meta.json");

  // let copyMETA = async () => {
  //   try {
  //     await fs.ensureDir(ensureMetaFolderPath);
  //     await fs.copy(metaFileSRC, metaFileProd);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  let server = false;
  try {
    const path = window.require("path");
    const Bundler = window.require("parcel-bundler");
    const entryFiles = path.join(projectRoot, "./src/index.html");
    const options = {
      outDir: path.join(projectRoot, "./dist/"), // The out directory to put the build files in, defaults to dist
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
      autoInstall: false, // Enable or disable auto install of missing dependencies found during bundling
    };

    const bundler = new Bundler(entryFiles, options);
    bundler.on("buildStart", (entry) => {
      console.log("start-packing", entry);
      window.dispatchEvent(
        new CustomEvent("log", {
          detail: { type: "info", msg: "start bundling project javascript" },
        })
      );
    });

    bundler.on("buildEnd", () => {
      console.log("done-packing");
      window.dispatchEvent(
        new CustomEvent("log", {
          detail: { type: "info", msg: "done bundling" },
        })
      );
      window.dispatchEvent(new CustomEvent("reload-page", { detail: {} }));
    });

    bundler.on("buildError", (error) => {
      console.log("error-packing", error);
      window.dispatchEvent(
        new CustomEvent("log", { detail: { type: "error", msg: error } })
      );
      window.location.reload();
    });

    bundler.on("bundled", (bundle) => {
      console.log("done-packing", bundle);
      window.dispatchEvent(
        new CustomEvent("log", {
          detail: { type: "info", msg: "finished bundling scritps and assets" },
        })
      );
    });

    bundler.bundle();

    // window.addEventListener("try-bundle", () => {
    //   bundler.bundle();
    // });

    var express = window.require("express");
    var app = express();
    var http = window.require("http").Server(app);
    server = http;

    var io = window.require("socket.io")(http, {});

    // app.get("/", (req, res) => {
    //   res.sendFile(path.join(projectRoot, "./src/index.html"));
    // });

    app.get("/js/meta.json", (req, res) => {
      res.sendFile(path.join(projectRoot, "./src/js/meta.json"));
    });

    app.use(bundler.middleware());

    io.on("connection", (socket) => {
      console.log("a user connected", socket.id);
      socket.join(slug);

      socket.on("request-input-stream", onStreamState);
    });

    let onStreamState = () => {
      io.to(slug).emit("stream-state", { state: lowdb.getState() });
    };
    let onReloadPage = () => {
      io.to(slug).emit("reload-page", {});
    };

    window.addEventListener("reload-page", onReloadPage);
    window.addEventListener("stream-state-to-webview", onStreamState);

    onReady({
      port: 1234,
    });

    http.listen(1234, () => {
      console.log("listening on *:1234");
    });
  } catch (e) {
    console.log(e);
  }

  return () => {
    if (server && server.close) {
      server.close();
    } else {
      console.log("cant close socket server");
    }
  };
}
