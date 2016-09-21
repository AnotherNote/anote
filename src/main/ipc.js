const electron = require('electron');
const app = electron.app;
import windows from './windows';
import { log } from './log';
const {Menu, MenuItem} = electron;
const BrowserWindow = electron.BrowserWindow;
const menu = require('./menu');
const shell = require('./shell');
import { openSaveDialog, openFileDialog } from './dialog';

var mainMsgQueue = [];

const init = () => {
  var ipc = electron.ipcMain;

  ipc.on('mainRenderReady', function(e) {
    app.mainRenderReady = true;

    // 暂存msg的queue
    mainMsgQueue.forEach(function (message) {
      if(windows.main)
        windows.main.send(...message);
    });

    mainMsgQueue.length = 0;
    console.log('mainRenderReady ............');
  });

  ipc.on('ipcTestMain', (event, arg) => {
    log('main prcess received the ipcTestMain');
    // const win = BrowserWindow.fromWebContents(event.sender)
    // const menu = new Menu()
    // menu.append(new MenuItem({label: 'MenuItem1', click() { log('item 1 clicked') }}))
    // menu.append(new MenuItem({type: 'separator'}))
    // menu.append(new MenuItem({label: 'MenuItem2', type: 'checkbox', checked: true}))
    // menu.popup(win);
  });

  ipc.on('onNotebookContainer', (event, arg) => {
    menu.onNotebookContainer();
  });

  ipc.on('onEditNote', (event, arg) => {
    menu.onEditNote();
  });

  ipc.on('onEditTrash', (event, arg) => {
    menu.onEditTrash();
  });

  ipc.on('onNoEditNotesList', (event, arg) => {
    menu.onNoEditNotesList();
  });

  ipc.on('enableItem', (event, item) => {
    menu.enableItem(item);
  });

  ipc.on('disableItem', (event, item) => {
    menu.disableItem(item);
  });

  ipc.on('openExternal', shell.openExternal);

  // a bridge between main render process to worker process
  ipc.on('workerCmd', (event, ...args) => {
    if(windows.worker.win)
      return windows.worker.dispatch(...args);
    windows.worker.init(() => {
      windows.worker.dispatch(...args);
    });
  });

  // a bridge between other window to main
  ipc.on('mainCmd', (event, ...args) => {
    if(windows.main.win)
      return windows.main.dispatch(...args);
    windows.main.init();
    windows.main.dispatch(...args);
  })

  // open save dialog
  ipc.on('saveDialog', (...args) => {
    openSaveDialog(...args);
  });

  ipc.on('openFile', (...args) => {
    openFileDialog(...args);
  });
}

exports.mainMsgQueue = mainMsgQueue;
exports.init = init;
