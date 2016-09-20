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
import renderFactory from '../render_factory'
const marked = require('marked');
const {remote} = require('electron')
const BrowserWindow = remote.BrowserWindow;
const statAsync = Promise.promisify(fs.stat);
const writeFileAsync = Promise.promisify(fs.writeFile);


function _renderHtml(markdown) {
  let markedRenderer = renderFactory({});
  return marked(markdown, {
    renderer: markedRenderer
  });
}

function _renderPdf(html, filename) {
  var opts = {
    marginsType: 0,
    printBackground: true,
    printSelectionOnly: false,
    pageSize: 'A4',
    landscape: false
  }
  var win = new BrowserWindow({ width:0, height: 0, show: false })
  win.loadURL(`file://${path.resolve(__dirname, '../../static/html_to_pdf.html')}`, {});
  win.on('closed', function () { win = null });
  win.webContents.on('dom-ready', function() {
    win.webContents.executeJavaScript(`
      var $marked = $('#marked');
      $('#marked').html(\`${html}\`);
    `);
    setTimeout(function(){
      win.webContents.printToPDF(opts, function (err, data) {
        if (err) {
          return;
        }
        fs.writeFile(filename, data, function (err) {
          if (err) {
            return;
          }
          win.destroy();
        })
      })
    }, 200);
  })
}

var dispatchHandlers = {
  'testHandler': function(...args){
    console.log(...args);
  },
  // 把笔记到处存为markdown
  'saveNoteAsMarkdown': function(fileId){
    ipcRenderer.send('saveDialog', 'export a note', 'md', {fileId: fileId, type: 'saveNoteAsMarkdown'});
  },
  'saveNoteAsPdf': function(fileId){
    ipcRenderer.send('saveDialog', 'export a note', 'pdf', {fileId: fileId, type: 'saveNoteAsPdf'});
  },
  // main process save的callback
  'fileSaved': function(filename, tmpData) {
    var that = this;
    switch (tmpData.type) {
      case 'saveNoteAsMarkdown':
        files.find({_id: tmpData.fileId}, function(err, docs) {
          if(err || docs.length == 0)
            return;
          let content = docs[0].content;
          co(function * () {
            if(content.length > 0)
              content = yield mdLocalImageOut(filename, content);
            yield writeFileAsync(filename, content);
          });
        });
        break;
        return;
      case 'saveNoteAsPdf':
        files.find({_id: tmpData.fileId}, function(err, docs) {
          if(err || docs.length == 0)
            return;
          let content = docs[0].content;
          let html = _renderHtml(content);
          _renderPdf(html, filename);
        });
        break;
        return;
      default:
        return;
    }
  },
  // 导入markdown or html
  importFile: function() {
    ipcRenderer.send('openFile', {type: "importFile"});
  },
  // 选择文件的callback
  selectedFile: function(files, tmpData) {
    console.log(files);
    console.log(tmpData);
    let file = files[0];
    switch (tmpData.type) {
      case "importFile":
        console.log('xxxxx');
        return;
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
