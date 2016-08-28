const electron = require('electron');
const app = electron.app;
import windows from './windows';

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
}

exports.mainMsgQueue = mainMsgQueue;
exports.init = init;
