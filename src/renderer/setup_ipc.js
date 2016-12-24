import { ipcRenderer } from 'electron';
import dispatchHandlers from './dispatch_handlers';

// dispatch main event to render handler
export function dispatch(action, ...args) {
  const handler = dispatchHandlers[action];
  if (handler) {
    handler(...args);
  }
}

// setup render ipc
export function setupIpc() {
  ipcRenderer.on('log', (e, ...args) => console.log(...args));
  ipcRenderer.on('error', (e, ...args) => console.log(...args));
  ipcRenderer.on('dispatch', (e, ...args) => dispatch(...args));
  // render main process render event listen is ready
  // because main process always before render process, so , we must ensure the render process is ready for event from main process.
  ipcRenderer.send('mainRenderReady');
}
