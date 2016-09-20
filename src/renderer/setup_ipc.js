const ipcRender = require('electron').ipcRenderer;
import dispatchHandlers from './dispatch_handlers';

// setup render ipc
export function setupIpc () {
  ipcRender.on('log', (e, ...args) => console.log(...args));
  ipcRender.on('error', (e, ...args) => console.log(...args));
  ipcRender.on('dispatch', (e, ...args) => dispatch(...args));
  // render main process render event listen is ready
  // because main process always before render process, so , we must ensure the render process is ready for event from main process.
  ipcRender.send('mainRenderReady');
}

// dispatch main event to render handler
export function dispatch (action, ...args) {
  let handler = dispatchHandlers[action];
  if(handler)
    handler(...args);
}
