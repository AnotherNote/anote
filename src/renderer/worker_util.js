import { ipcRenderer } from 'electron';

export function sendWorkerCmd(...args) {
  ipcRenderer.send('workerCmd', ...args);
}
