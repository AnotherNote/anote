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

module.exports = {
  openSaveDialog
}
