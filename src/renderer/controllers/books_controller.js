const {remote} = require('electron')
const {Menu, MenuItem} = remote

export function openBookItemContextMenu (callbacks) {
  const menu = new Menu();
  menu.append(new MenuItem({label: 'New Book', click() { callbacks.newBook(); }}));
  menu.append(new MenuItem({label: 'Edit Book', click() { callbacks.editBook(); }}));
  menu.append(new MenuItem({type: 'separator'}));
  menu.append(new MenuItem({label: 'Delete Book', click() { callbacks.deleteBook(); }}));
  menu.popup(remote.getCurrentWindow());
}
