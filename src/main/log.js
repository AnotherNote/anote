const electron = require('electron');

import windows from './windows';

export function log (...args) {
  windows.main.send('log', ...args);
}

export function error (...args) {
  windows.main.send('error', ...args);
}
