const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')

const windows = require('./windows');

const ipc = require('./ipc');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

function init () {
  app.on('ready', function() {
    BrowserWindow.addDevToolsExtension('/Users/wpzero/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/0.15.1_0');
    windows.main.init();
  });
}

var shouldQuit = false;

if(!shouldQuit){
  shouldQuit = app.makeSingleInstance(onAppOpen);
  if(shouldQuit){
    app.quite();
  }
}

if(!shouldQuit){
  init();
}

ipc.init();

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', function () {
  if (windows.main.win === null) {
    windows.main.init();
  }
})

function onAppOpen () {
  if(app.ipcReady){
      windows.main.show();
  }
}
