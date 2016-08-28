const {remote} = require('electron')
const {Menu, MenuItem} = remote

export function openBookItemContextMenu (callbacks) {
  const menu = new Menu();
  menu.append(new MenuItem({label: 'New Notebook...', click() { callbacks.newBook(); }}));
  menu.append(new MenuItem({label: 'Edit Notebook...', click() { callbacks.editBook(); }}));
  menu.append(new MenuItem({type: 'separator'}));
  menu.append(new MenuItem({label: 'Move To Trash...', click() { callbacks.deleteBook(); }}));
  menu.popup(remote.getCurrentWindow());
}

export function openNormalContextMenu (callbacks) {
  const menu = new Menu();
  menu.append(new MenuItem({label: 'New Notebook...', click() { callbacks.newBook(); }}));
  menu.popup(remote.getCurrentWindow());
}
