const {remote} = require('electron')
const {Menu, MenuItem} = remote

// canNew checkIf can new a file
// chooseFile checkIf choose a file
export function openFileItemContextMenu (canNew, chooseFile, callbacks) {
  const menu = new Menu();
  if(!canNew && !chooseFile)
    return;
  if(canNew) {
    menu.append(new MenuItem({label: 'New Note', click() { callbacks.newFile(); }}));
    menu.append(new MenuItem({label: 'Import...', click() { callbacks.deleteFile(); }}));
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
