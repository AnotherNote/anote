import electron from 'electron';
import path from 'path';

import { mainMsgQueue } from '../ipc';
import menu from '../menu';

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const main = {};

function show() {
  if (!main.win) {
    return;
  }
  main.win.show();
}

function hide() {
  if (!main.win) {
    return;
  }
  main.win.hide();
}

function send(...args) {
  if (!main.win || !app.mainRenderReady) {
    mainMsgQueue.push(args);
  } else {
    main.win.send(...args);
  }
}

// dispath a event to render process
// 处于给render process 发送事件dispatch，并且处理.
function dispatch(...args) {
  send('dispatch', ...args);
}

function init() {
  if (main.win) {
    return main.win.show();
  }

  let win = main.win = new BrowserWindow({
    width: 1000,
    height: 800,
    darkTheme: true,
    name: 'ANOTE',
    backgroundColor: '#eee',
    show: false,
      // titleBarStyle: 'hidden-inset'
  });

  win.once('ready-to-show', () => {
    show();
    menu.enableItem('New Notebook');
  });

  // and load the index.html of the app.
  win.loadURL(`file://${path.resolve(__dirname, '../../../static/main.html')}`);

  // Open the DevTools.
  // win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    win = main.win = null;
    mainMsgQueue.length = 0;
    app.mainRenderReady = false;
    menu.onNoMainWin();
  });

  return null;
}

main.init = init;
main.show = show;
main.hide = hide;
main.send = send;
main.dispatch = dispatch;

module.exports = main;
