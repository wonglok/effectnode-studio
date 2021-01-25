const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require("path");
const isDev = require("electron-is-dev");
const { ipcMain } = require('electron')

let mainWindow;

// require("update-electron-app")({
//   repo: "alagrede/react-electron-example",
//   updateInterval: "1 hour"
// });

function createNewWindow () {
  let projectWindow = new BrowserWindow({
    x: 0,
    left: 0,
    width: isDev ? 1920 : 800,
    height: isDev ? 1080 * 2 : 600,
    webPreferences: {
      contextIsolation: false,
      webviewTag: true,
      nodeIntegration: true,
      enableRemoteModule: true,
      nodeIntegrationInWorker: false
    }
  });

  projectWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  projectWindow.maximize()
}

ipcMain.on('open-window', () => {
  createNewWindow()
})

function createWindow () {
  mainWindow = new BrowserWindow({
    width: isDev ? 1920 : 800,
    height: isDev ? 1080 * 2 : 600,
    webPreferences: {
      contextIsolation: false,
      webviewTag: true,
      nodeIntegration: true,
      enableRemoteModule: true,
      nodeIntegrationInWorker: false
    }
  });

  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  // mainWindow.maximize();

  mainWindow.on("closed", () => {
    app.exit(0);
  });

  mainWindow.webContents.openDevTools()
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg) // prints "ping"
  event.reply('asynchronous-reply', 'pong')
})

ipcMain.on('open', (event, filePath) => {
  var openInEditor = require('open-in-editor');
  var editor = openInEditor.configure({
    // options
    editor: 'code',
    pattern: '-r -g {filename}:{line}:{column}'
  }, function(err) {
    console.error('Something went wrong: ' + err);
  });

  // // editor.open(__dirname'path/to/file.js:3:10')
  editor.open(`${filePath}:1:1`)
    .then(function() {
      event.reply('asynchronous-reply', 'pong')
      console.log('Success!');
    }, function(err) {
      console.error('Something went wrong: ' + err);
    });
})
