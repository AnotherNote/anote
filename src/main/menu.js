module.exports = {
  init,
  onNotebookContainer,
  onEditNote,
  onEditTrash,
  onNoMainWin,
  onNoEditNotesList,
  enableItem,
  disableItem
}

var electron = require('electron')

var app = electron.app

var windows = require('./windows')

var log = require('./log').log;

import config from '../config'

const BrowserWindow = electron.BrowserWindow

var menu

function init () {
  menu = electron.Menu.buildFromTemplate(getMenuTemplate())
  electron.Menu.setApplicationMenu(menu)
}

// 在notebook列表中
function onNotebookContainer () {
  disableMenuItems('Move To Notebook...',
  'Copy To Notebook...',
  'Move To Trash',
  'Delete Forever',
  'Restore...',
  'Redo',
  'Undo');
}

// 在编辑一个note中
function onEditNote() {
  enableMenuItems('Move To Notebook...',
  'Copy To Notebook...',
  'Move To Trash',
  'Redo',
  'Undo');
  disableMenuItems('Delete Forever',
  'Restore...');
}

// 在编辑状态的trash
function onEditTrash() {
  enableMenuItems('Delete Forever',
  'Restore...');
  disableMenuItems('Move To Notebook...',
  'Copy To Notebook...',
  'Move To Trash',
  'Redo',
  'Undo');
}

// 在没有编辑状态的notelist
function onNoEditNotesList() {
  disableMenuItems('Move To Notebook...',
  'Copy To Notebook...',
  'Move To Trash',
  'Delete Forever',
  'Restore...',
  'Redo',
  'Undo');
}

function onNoMainWin() {
  disableMenuItems('Move To Notebook...',
  'Copy To Notebook...',
  'Move To Trash',
  'Delete Forever',
  'Restore...',
  'Redo',
  'Undo',
  'New Notebook',
  'New Note');
}

function enableItem(item) {
  let tmpItem = getMenuItem(item);
  tmpItem.enabled = true;
}

function disableItem(item) {
  let tmpItem = getMenuItem(item);
  tmpItem.enabled = false;
}

function getMenuTemplate () {
  var template = [
    {
      label: 'Notebook',
      submenu: [
        {
          label: 'New Notebook',
          accelerator: 'Shift+Cmd+N',
          click: () => {
            windows.main.dispatch('newNoteBook');
          }
        }
      ]
    },
    {
      label: 'Note',
      submenu: [
        {
          label: 'New Note',
          accelerator: 'Cmd+N',
          click: () => {
            log('new note');
            windows.main.dispatch('newNote');
          }
        },
        {
          label: 'Move To Notebook...',
          click: () => {
            log('move to notebook');
            windows.main.dispatch('moveToNotebook');
          }
        },
        {
          label: 'Copy To Notebook...',
          click: () => {
            log('copy to notebook')
            windows.main.dispatch('copyToNotebook');
          }
        },
        {
          label: 'Move To Trash',
          click: () => {
            log('move to trash');
            windows.main.dispatch('moveToTrash');
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Delete Forever',
          click: () => {
            log('delete forever')
            windows.main.dispatch('clearFile');
          }
        },
        {
          label: 'Restore...',
          click: () => {
            log('restore')
            windows.main.dispatch('restoreFile');
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Redo',
          accelerator: 'Cmd+Z',
          click: () => { log('redo') }
        },
        {
          label: 'Undo',
          accelerator: 'Shft+Cmd+Z',
          click: () => { log('Undo') }
        },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Full Screen',
          accelerator: (function () {
            if (process.platform === 'darwin') {
              return 'Ctrl+Command+F'
            } else {
              return 'F11'
            }
          })(),
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
            }
          }
        }
      ]
    }
  ];

  if(config.dev){
    let devSubmenu = [{
              label: 'Reload',
              accelerator: 'CmdOrCtrl+R',
              click: function (item, focusedWindow) {
                if (focusedWindow) {
                  // on reload, start fresh and close any old
                  // open secondary windows
                  if (focusedWindow.id === 1) {
                    BrowserWindow.getAllWindows().forEach(function (win) {
                      if (win.id > 1) {
                        win.close()
                      }
                    })
                  }
                  focusedWindow.reload()
                }
              }
            },
            {
              label: 'Toggle Developer Tools',
              accelerator: (function () {
                if (process.platform === 'darwin') {
                  return 'Alt+Command+I'
                } else {
                  return 'Ctrl+Shift+I'
                }
              })(),
              click: function (item, focusedWindow) {
                if (focusedWindow) {
                  focusedWindow.toggleDevTools()
                }
              }
            }];
    template[template.length-1]['submenu'] = [...template[template.length-1]['submenu'], ...devSubmenu]
  }

  if (process.platform === 'darwin') {
    const name = electron.app.getName()
    template.unshift({
      label: name,
      submenu: [{
        label: `About ${name}`,
        role: 'about'
      }, {
        type: 'separator'
      }, {
        label: 'Services',
        role: 'services',
        submenu: []
      }, {
        type: 'separator'
      }, {
        label: `Hide ${name}`,
        accelerator: 'Command+H',
        role: 'hide'
      }, {
        label: 'Hide Others',
        accelerator: 'Command+Alt+H',
        role: 'hideothers'
      }, {
        label: 'Show All',
        role: 'unhide'
      }, {
        type: 'separator'
      }, {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function () {
          app.quit()
        }
      }]
    })
  }

  return template;
}

function getMenuItem (label) {
  for (var i = 0; i < menu.items.length; i++) {
    var menuItem = menu.items[i].submenu.items.find(function (item) {
      return item.label === label
    })
    if (menuItem) return menuItem
  }
}

function enableMenuItems (...items) {
  items = items || [];
  for (var i = 0; i < menu.items.length; i++) {
    menu.items[i].submenu.items.forEach((item) => {
      if(items.includes(item.label))
        item.enabled = true;
    })
  }
}

function disableMenuItems (...items) {
  items = items || [];
  for (var i = 0; i < menu.items.length; i++) {
    menu.items[i].submenu.items.forEach((item) => {
      if(items.includes(item.label))
        item.enabled = false;
    })
  }
}
