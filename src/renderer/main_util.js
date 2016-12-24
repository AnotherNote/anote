import { ipcRenderer } from 'electron';

export default function sendMainCmd(...args) {
  ipcRenderer.send('mainCmd', ...args);
}
