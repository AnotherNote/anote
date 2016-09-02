const ipcRenderer = require('electron').ipcRenderer;

export function sendWorkerCmd(...args) {
  ipcRenderer.send('workerCmd', ...args);
}
