import { shell } from 'electron';

function openExternal(event, url) {
  shell.openExternal(url);
}

module.exports = {
  openExternal,
};
