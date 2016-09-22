const {remote} = require('electron')
const {Menu, MenuItem} = remote

var handlers = {};

handlers.openAvailableFileItemContextMenu = function (canNew, chooseFile, callbacks) {
  const menu = new Menu();
  if(!canNew && !chooseFile)
    return;
  if(canNew) {
    menu.append(new MenuItem({label: 'New Note', click() { callbacks.newFile(); }}));
    // todo, not now
    // menu.append(new MenuItem({label: 'Import...', click() { callbacks.importFile(); }}));
  }
  if(chooseFile) {
    menu.append(new MenuItem({type: 'separator'}));
    menu.append(new MenuItem({label: 'Move To Notebook...', click() { callbacks.moveToNotebook(); }}));
    menu.append(new MenuItem({label: 'Copy To Notebook...', click() { callbacks.copyToNotebook(); }}));
    menu.append(new MenuItem({type: 'separator'}));
    menu.append(new MenuItem({label: 'Export...', click() { callbacks.normalExport(); }}));
    menu.append(new MenuItem({label: 'Export As Pdf...', click() { callbacks.exportAsPdf(); }}));
    menu.append(new MenuItem({type: 'separator'}));
    menu.append(new MenuItem({label: 'Move To Trash...', click() { callbacks.deleteFile(); }}));
  }
  menu.popup(remote.getCurrentWindow());
}

handlers.openUnavailableFileItemContextMenu = function (canNew, chooseFile, callbacks) {
  const menu = new Menu();
  if(chooseFile) {
    menu.append(new MenuItem({label: 'Delete Forever...', click() { callbacks.clearFile(); }}));
    menu.append(new MenuItem({label: 'Restore...', click() { callbacks.restoreFile(); }}));
    menu.append(new MenuItem({type: 'separator'}));
    menu.append(new MenuItem({label: 'Empty Trash...', click() { callbacks.clearTrash(); }}));
  }else{
    menu.append(new MenuItem({label: 'Empty Trash...', click() { callbacks.clearTrash(); }}));
  }
  menu.popup(remote.getCurrentWindow());
}

// canNew checkIf can new a file
// chooseFile checkIf choose a file
export function openFileItemContextMenu (available, canNew, chooseFile, callbacks) {
  let availableDic = {
    'false': 'openUnavailableFileItemContextMenu',
    'true': 'openAvailableFileItemContextMenu'
  };
  handlers[availableDic[available]](canNew, chooseFile, callbacks);
}
