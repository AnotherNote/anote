const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')

const windows = require('./windows');

const ipc = require('./ipc');

const menu = require('./menu');

const tray = require('./tray')

import config from '../config'

var menubar = tray({
  height: 450,
  showDockIcon: true,
  index: `file://${path.resolve(__dirname, '../../static/tray.html')}`,
  icon: path.resolve(__dirname, '../../static/images/IconTemplate.png')
});

menubar.on('ready', function(){
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

function init () {
  app.on('ready', function() {
    // react dev plugin
    // if(config.dev)
    //   BrowserWindow.addDevToolsExtension('/Users/wpzero/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/0.15.4_0');
    windows.main.init();
    windows.worker.init();
    menu.init();
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
