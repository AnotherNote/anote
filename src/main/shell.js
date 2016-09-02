module.exports = {
  openExternal
}

const shell = require('electron').shell;

function openExternal(event, url) {
  shell.openExternal(url);
}
