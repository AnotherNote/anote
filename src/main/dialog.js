const dialog = require('electron').dialog

function openSaveDialog(event, title, extensions, tmpData) {
  extensions = extensions.split(',');
  const options = {
    title: title,
    filters: [
      {
        name:'SaveDialog',
        extensions: extensions.length > 0 ? extensions : null
      }
    ]
  }

  dialog.showSaveDialog(options, function (filename) {
    event.sender.send('dispatch', 'fileSaved', filename, tmpData);
  });
}

function openFileDialog(event, tmpData){
  dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory'],
    filters: [
      {name: 'Markdown', extensions: ['md']},
      {name: 'Html', extensions: ['html']}
    ]
  }, function (files) {
    if (files) event.sender.send('dispatch', 'selectedFile', files, tmpData)
  })
}

module.exports = {
  openSaveDialog,
  openFileDialog
}
