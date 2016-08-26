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
	var timeout = null,
    debounced = function() {
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
  debounced.cancel = function(){
    clearTimeout(timeout);
  }
  return debounced;
};

const throttle = function(func, wait, options) {
  var timeout, context, args, result;
  var previous = 0;
  if (!options) options = {};
  var getNow = function() {
    return new Date().getTime();
  }
  var later = function() {
    // 如果options.leading === false在这里重新设置 previous
    previous = options.leading === false ? 0 : getNow();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };

  var throttled = function() {
    var now = getNow();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    // 但是args每次都是最新的
    args = arguments;
    // 距离上次的时间已经大约wait，直接运行
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;

    // 这个是options.leading === false的时候做第一次调用
    // 或者wait之内再调用的时候
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }

    return result;
  };

  throttled.cancel = function() {
    clearTimeout(timeout);
    previous = 0;
    timeout = context = args = null;
  };

  return throttled;
};

const findIndexById = (list, item) => {
  return list.findIndex((currentItem) => {
    return currentItem._id == item._id;
  })
}

module.exports = {
  copyFile,
  getFileHash,
  hash2Key,
  key2path,
  debounce,
  throttle,
  findIndexById
}
