const ipcRenderer = require('electron').ipcRenderer;

export default function sendMainCmd(...args) {
  ipcRenderer.send('mainCmd', ...args);
}
