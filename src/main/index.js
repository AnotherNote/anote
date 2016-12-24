import electron from 'electron';
import path from 'path';
import windows from './windows';
import ipc from './ipc';
import menu from './menu';
import tray from './tray';

// Module to control application life.
const app = electron.app;
// Module to create native browser window.


const menubar = tray({
  height: 450,
  showDockIcon: true,
  index: `file://${path.resolve(__dirname, '../../static/tray.html')}`,
  icon: path.resolve(__dirname, '../../static/images/IconTemplate.png'),
});

menubar.on('ready', () => {
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

function init() {
  app.on('ready', () => {
    // react dev plugin
    // if(config.dev)
    // BrowserWindow.addDevToolsExtension('/Users/wpzero/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/0.15.4_0');
    windows.main.init();
    windows.worker.init();
    menu.init();
  });
}

function onAppOpen() {
  if (app.ipcReady) {
    windows.main.show();
  }
}

let shouldQuit = false;

if (!shouldQuit) {
  shouldQuit = app.makeSingleInstance(onAppOpen);
  if (shouldQuit) {
    app.quite();
  }
}

if (!shouldQuit) {
  init();
}

ipc.init();

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (windows.main.win === null) {
    windows.main.init();
  }
});
