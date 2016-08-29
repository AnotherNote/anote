const electron = require('electron');
const app = electron.app;
import windows from './windows';
import { log } from './log';
const {Menu, MenuItem} = electron;
const BrowserWindow = electron.BrowserWindow;

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
}

exports.mainMsgQueue = mainMsgQueue;
exports.init = init;
