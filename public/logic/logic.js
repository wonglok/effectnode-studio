const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require("path");
const isDev = require("electron-is-dev");
const { ipcMain } = require("electron");


ipcMain.handle('openWindow', async (event, args) => {
  let mainWindow = new BrowserWindow({
    width: isDev ? 1920 : 800,
    height: isDev ? 1080 * 2 : 600,
    webPreferences: {
      contextIsolation: false,
      webviewTag: true,
      nodeIntegration: true,
      enableRemoteModule: true,
      nodeIntegrationInWorker: false,
    },
  });

  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  mainWindow.maximize()

  return 'ans'
})

ipcMain.handle('checkEmptyFolder', async (event, args) => {
  const lstatSync = require("fs").lstatSync;
  const existsSync = require("fs").existsSync;
  const fs = require("fs");
  const path = require("path");
  const { dialog } = require("electron")
  var promise = await dialog.showOpenDialog({
    properties: ["openDirectory", "createDirectory"],
    createDirectory: true,
  });

  let files = [
    {
      path: promise.filePaths[0],
      isDirectory: false,
    },
  ];

  files.forEach((file) => {
    let url = file.path + "";
    let isDirectory = existsSync(url) && lstatSync(url).isDirectory();
    file.isDirectory = isDirectory;
  });

  let firstFolder = files.filter((e) => e.isDirectory)[0];
  if (firstFolder) {
    const dir = fs.opendirSync(firstFolder.path);
    const infos = [];
    for await (const dirEntry of dir) {
      // console.log(dirEntry.name);
      infos.push({
        name: dirEntry.name,
        isDirectory: dirEntry.isDirectory(),
        isFile: dirEntry.isFile(),
        path: path.join(firstFolder.path, dirEntry.name),
      });
    }

    const vizfiles = infos.filter((info) => {
      return info.name.indexOf(".") !== 0;
    });

    if (vizfiles.length === 0) {
      return {
        ok: true,
        folder: firstFolder.path
      }
    } else {
      return { ok: false, folder: false }
    }
  }

  return { ok: false, folder: false, cancel: true }
})


ipcMain.handle('createProjectFiles', async (event, folderPath) => {
  return require('./template.js').createProjectFiles({ folderPath })
})

let selectFolder = async  () => {
  const { dialog } = require("electron")
  var promise = await dialog.showOpenDialog({
    properties: ["openDirectory", "createDirectory"],
    createDirectory: true,
  });
  const folderPath = promise.filePaths[0]

  return folderPath
}

let checkFolderPath = (folderPath) => {
  const fs = require("fs-extra");
  const path = require("path");

  let check = [
    fs.existsSync(path.join(folderPath, "/package.json")),
    fs.existsSync(path.join(folderPath, "/src/js/meta.json")),
    fs.existsSync(path.join(folderPath, "/src/js/entry.js"))
  ]
  if (check.filter(e => e === false).length === 0) {
    return { ok: true, folder: folderPath }
  } else {
    return { ok: false, folder: false }
  }
}

ipcMain.handle('selectCheckProjectFolder', async (event) => {
  const folderPath = await selectFolder()
  if (folderPath) {
    return checkFolderPath(folderPath)
  } else {
    return { ok: false, cancel: true }
  }
})

ipcMain.handle('onlyCheckProjectFolder', async (event, folderPath) => {
  return checkFolderPath(folderPath)
})

