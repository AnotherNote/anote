import Promise from 'bluebird';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import co from 'co';
import constants from './constants';

const {
    FILES_PATH,
    TMP_FILES_PATH,
} = constants;
const http = require('http');
const https = require('https');

const writeFileAsyn = Promise.promisify(fs.writeFile);

const unlinkAsync = Promise.promisify(fs.unlink);

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return `${s4() + s4()}-${s4()}-${s4()}-${
    s4()}-${s4()}${s4()}${s4()}`;
}

function downloadAsyn(url, dest) {
  const file = fs.createWriteStream(dest);
  return new Promise((resolve, reject) => {
    let responseSent = false;
    let pModule = null;
    if (url.indexOf('https') > -1) {
      pModule = https;
    } else {
      pModule = http;
    }
    pModule.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          if (responseSent) return;
          responseSent = true;
          resolve();
        });
      });
    }).on('error', (err) => {
      console.log('error');
      if (responseSent) return;
      responseSent = true;
      reject(err);
    });
  });
};

// const downloadAsyn = Promise.promisify(download);

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (directoryExists(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function directoryExists(path) {
  try {
    return fs.statSync(path).isDirectory();
  } catch (err) {
    return false;
  }
}

function copyFile(source, target) {
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

function buffer2File(buffer) {
  const tmpPath = path.resolve(TMP_FILES_PATH, `${Date.now()}`);
  ensureDirectoryExistence(tmpPath);
  return co(function* () {
    yield writeFileAsyn(tmpPath, buffer);
    const hashKey = yield getFileHash(tmpPath);
    const key = hash2Key(hashKey);
    yield copyFile(tmpPath, `${FILES_PATH}/${key}`);
    yield unlinkAsync(tmpPath);
    return `${key}`;
  });
};

function downloadImageAsyn(url) {
  const tmpPath = path.resolve(TMP_FILES_PATH, `${guid()}`);
  ensureDirectoryExistence(tmpPath);
  return co(function* () {
    try {
      yield downloadAsyn(url, tmpPath);
    // 出问题了返回原来的url
    } catch (error) {
      console.log('出问题了返回原来的url');
      return url;
    }
    const hashKey = yield getFileHash(tmpPath);
    const key = hash2Key(hashKey);
    yield copyFile(tmpPath, `${FILES_PATH}/${key}`);
    yield unlinkAsync(tmpPath);
    return `${key}`;
  });
};

const getFileHash = filePath => new Promise((resolve, reject) => {
  const rs = fs.createReadStream(filePath);
  const hash = crypto.createHash('sha1');
  hash.setEncoding('hex');
  rs.pipe(hash);
  rs.on('end', () => {
    hash.end();
    resolve(hash.read());
  });
});

const hash2Key = hash => `${hash.slice(0, 5)}/${hash}`;

const key2path = key => `${FILES_PATH}/${key}`;

function debounce(func, wait, immediate) {
  let timeout = null,
    debounced = function () {
      let context = this,
        args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  debounced.cancel = function () {
    clearTimeout(timeout);
  };
  return debounced;
};

const throttle = function (func, wait, options) {
  let timeout,
    context,
    args,
    result;
  let previous = 0;
  if (!options) options = {};
  const getNow = function () {
    return new Date().getTime();
  };
  const later = function () {
        // 如果options.leading === false在这里重新设置 previous
    previous = options.leading === false ? 0 : getNow();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };

  const throttled = function () {
    const now = getNow();
    if (!previous && options.leading === false) previous = now;
    const remaining = wait - (now - previous);
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

  throttled.cancel = function () {
    clearTimeout(timeout);
    previous = 0;
    timeout = context = args = null;
  };

  return throttled;
};

const findIndexById = (list, item) => list.findIndex(currentItem => currentItem._id == item._id);

const pick = (o, ...props) => Object.assign({}, ...props.map(prop => ({ [prop]: o[prop] })));

function chineseDate(date) {
  const tmpDate = new Date(date);
  tmpDate.setHours(date.getHours() + 8);
  return tmpDate;
};

const ppDate = date => `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString()}`;

// sequial process
// function placeImageToLocalAsyn(content) {
//   content = content || '';
//   let pp = /!\[(.*?)\]\((.*?)\)/i;
//   let ppp = /[http|https]/;
//   let result = content;
//   let m;
//   return co (function * () {
//     do {
//         m = pp.exec(content);
//         if (m) {
//           let matchTxt = m[0];
//           let text = m[1];
//           let href = m[2];
//           if(ppp.test(href)){
//             let key = yield downloadImageAsyn(href);
//             result = result.split(href).join(key);
//             content = content.split(matchTxt).join('');
//           }
//         }
//     } while (m);
//     return result;
//   });
// }

// parallel process
function placeImageToLocalAsyn(content) {
  content = content || '';
  const pp = /!\[(.*?)\]\((.*?)\)/i;
  const ppp = /[http|https]/;
  let result = content;
  let m;
  const promisesHash = {};
  return co(function* () {
    do {
      m = pp.exec(content);
      if (m) {
        const matchTxt = m[0];
        const text = m[1];
        const href = m[2];
        if (ppp.test(href)) {
          promisesHash[href] = downloadImageAsyn(href);
          content = content.split(matchTxt).join('');
        }
      }
    } while (m);
    const res = yield promisesHash;
    Object.keys(res).forEach((href) => {
      result = result.split(href).join(res[href]);
    });
    return result;
  });
};

module.exports = {
  copyFile,
  getFileHash,
  hash2Key,
  key2path,
  debounce,
  throttle,
  findIndexById,
  pick,
  chineseDate,
  ppDate,
  buffer2File,
  downloadImageAsyn,
  placeImageToLocalAsyn,
  downloadAsyn,
};
