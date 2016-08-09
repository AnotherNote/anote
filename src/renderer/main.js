// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const fs = require('fs'),
    path = require('path');

fs.readFile(path.resolve(__dirname, './README.md'), (err, data) => {
  if (err) throw err;
  console.log(data.toString());
});
