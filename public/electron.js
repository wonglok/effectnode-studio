const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require("path");
const isDev = require("electron-is-dev");

let mainWindow;

// require("update-electron-app")({
//   repo: "alagrede/react-electron-example",
//   updateInterval: "1 hour"
// });

function createWindow() {
  mainWindow = new BrowserWindow({ width: 900, height: 680, webPreferences: { nodeIntegration: true }});
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  mainWindow.on("closed", () => {
    app.exit(0);
  });
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

const { ipcMain } = require('electron')
ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg) // prints "ping"
  event.reply('asynchronous-reply', 'pong')
})

ipcMain.on('open', () => {
  // var openInEditor = require('open-in-editor');
  // var editor = openInEditor.configure({
  //   // options
  //   editor: 'code',
  //   pattern: '-r -g {filename}:{line}:{column}'
  // }, function(err) {
  //   console.error('Something went wrong: ' + err);
  // });

  // // editor.open(__dirname'path/to/file.js:3:10')
  // editor.open(`${__dirname}/electron.js:47:7`)
  // .then(function() {
  //   console.log('Success!');
  // }, function(err) {
  //   console.error('Something went wrong: ' + err);
  // });
})