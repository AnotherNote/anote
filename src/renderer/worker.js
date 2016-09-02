var Promise = require('bluebird');
window.$ = window.jQuery = window.jquery = require('jquery');
import co from 'co';
require('babel-polyfill');
import constants from '../constants';
let { FILES_PATH } = constants;
const ipcRenderer = require('electron').ipcRenderer;
import {
    files,
    books,
    tags,
    infos
} from '../main/set_db';
import fs from 'fs';
import path from 'path';
import { copyFile } from '../util'

const statAsync = Promise.promisify(fs.stat);
const writeFileAsync = Promise.promisify(fs.writeFile);

var dispatchHandlers = {
  'testHandler': function(...args){
    console.log(...args);
  },
  'saveNoteAsMarkdown': function(fileId){
    ipcRenderer.send('saveDialog', 'export a note', 'md', {fileId: fileId, type: 'saveNoteAsMarkdown'});
  },
  'fileSaved': function(filename, tmpData) {
    console.log(filename);
    switch (tmpData.type) {
      case 'saveNoteAsMarkdown':
        files.find({_id: tmpData.fileId}, function(err, docs) {
          if(err || docs.length == 0)
            return;
          let content = docs[0].content;
          co(function * () {
            if(content.length > 0)
              content = yield mdLocalImageOut(filename, content);
              console.log(content);
            yield writeFileAsync(filename, content);
          });
        });
        break;
      default:

    }
  }
};

const ipcRender = require('electron').ipcRenderer;

function dispatch(action, ...args) {
  if(dispatchHandlers[action])
    dispatchHandlers[action](...args);
}

function init() {
  ipcRender.on('dispatch', (e, ...args) => {
    dispatch(...args);
  });
}

// 调用方法前确定有content
function mdLocalImageOut (filename, content) {
  content = content || '';
  let basename = path.basename(filename).split('.')[0];
  let dirname = path.dirname(filename);
  let index = 0;
  let pp = /!\[(.*?)\]\((.*?)\)/i;
  let ppp = /[http|https]/;
  let m;
  let result = content;
  return  co(function * () {
            do {
                m = pp.exec(content);
                if (m) {
                  let matchTxt = m[0];
                  let text = m[1];
                  let href = m[2];
                  if(!ppp.test(href)){
                    let originPath = path.resolve(FILES_PATH, href);
                    let stats = yield statAsync(originPath);
                    if(stats.isFile()){
                      yield copyFile(originPath, path.resolve(dirname, `./${basename}_images/${index}`))
                      result = result.replace(matchTxt, `![${text}](./${basename}_images/${index})`);
                      content = content.replace(matchTxt, '');
                      index = index + 1;
                    }
                  }
                }
            } while (m);
            return result;
          });
}

init();
