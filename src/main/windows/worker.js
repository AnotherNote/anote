var worker = module.exports = {
  win: null,
  init,
  send,
  dispatch
};
import { log } from '../log'

// 做后台工作的invisible window
const electron = require('electron')
const BrowserWindow = electron.BrowserWindow
const path = require('path')

function init(callback) {
  if(worker.win)
    return;
  worker.win = new BrowserWindow({
    width: 0,
    height: 0,
    show: false
  });

  worker.win.loadURL(`file://${path.resolve(__dirname, '../../../static/worker.html')}`);

  worker.win.on('closed', function () {
    worker.win = null;
  })

  // 确保worker是开着的, 因为main window的reload会使得worker经常死掉
  if(callback){
    worker.win.webContents.once('did-finish-load', () => {
      callback();
     })
  }
}

function send(...args) {
  if(worker.win)
    worker.win.send(...args);
}

function dispatch(...args) {
  send('dispatch', ...args);
}
