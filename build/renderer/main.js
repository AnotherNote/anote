'use strict';

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var fs = require('fs'),
    path = require('path');

fs.readFile(path.resolve(__dirname, './README.md'), function (err, data) {
  if (err) throw err;
  console.log(data.toString());
});