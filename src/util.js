import Promise from 'bluebird';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import constants from './constants';
let { FILES_PATH } = constants;

function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (directoryExists(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function directoryExists(path) {
  try {
    return fs.statSync(path).isDirectory();
  }
  catch (err) {
    return false;
  }
}

const copyFile = (source, target) => {
  return new Promise((resolve, reject) => {
    ensureDirectoryExistence(target);
    let rs = fs.createReadStream(source),
      ws = fs.createWriteStream(target);
    rs.pipe(ws);
    ws.on('close', () => {
      resolve();
    });
    ws.on('error', () => {
      reject();
    });
  });
}

const getFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    let rs = fs.createReadStream(filePath);
    let hash = crypto.createHash('sha1');
    hash.setEncoding('hex');
    rs.pipe(hash);
    rs.on('end', () => {
      hash.end();
      resolve(hash.read());
    });
  });
}

const hash2Key = (hash) => {
  return `${hash.slice(0, 5)}/${hash}`;
}

const key2path = (key) => {
  return `${FILES_PATH}/${key}`;
}

const debounce = (func, wait, immediate) => {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

const findIndexById = (list, item) => {
  return list.findIndex((currentItem) => {
    return currentItem._id = item._id;
  })
}

module.exports = {
  copyFile,
  getFileHash,
  hash2Key,
  key2path,
  debounce,
  findIndexById
}
