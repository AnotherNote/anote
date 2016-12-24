const dialog = require('electron').dialog;

function openSaveDialog(event, title, extensionString, tmpData) {
  const extensions = extensionString.split(',');
  const options = {
    title,
    filters: [
      {
        name: 'SaveDialog',
        extensions: extensions.length > 0 ? extensions : null,
      },
    ],
  };

  dialog.showSaveDialog(options, (filename) => {
    event.sender.send('dispatch', 'fileSaved', filename, tmpData);
  });
}

function openFileDialog(event, tmpData) {
  dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory'],
    filters: [
      { name: 'Markdown', extensions: ['md'] },
      { name: 'Html', extensions: ['html'] },
    ],
  }, (files) => {
    if (files) event.sender.send('dispatch', 'selectedFile', files, tmpData);
  });
}

module.exports = {
  openSaveDialog,
  openFileDialog,
};
