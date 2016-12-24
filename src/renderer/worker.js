import Promise from 'bluebird';
import co from 'co';
import fs from 'fs';
import path from 'path';
import marked from 'marked';
import { remote, ipcRenderer } from 'electron';
import jQuery from 'jquery';
import constants from '../constants';
import {
  files,
} from '../main/set_db';
import { copyFile } from '../util';
import renderFactory from '../render_factory';

require('babel-polyfill');

window.$ = window.jQuery = window.jquery = jQuery;
const { FILES_PATH } = constants;
const BrowserWindow = remote.BrowserWindow;
const statAsync = Promise.promisify(fs.stat);
const writeFileAsync = Promise.promisify(fs.writeFile);

function _renderHtml(markdown) {
  const markedRenderer = renderFactory({});
  return marked(markdown, {
    renderer: markedRenderer,
  });
}

function _renderPdf(html, filename) {
  const opts = {
    marginsType: 0,
    printBackground: true,
    printSelectionOnly: false,
    pageSize: 'A4',
    landscape: false,
  };
  let win = new BrowserWindow({ width: 0, height: 0, show: false });
  win.loadURL(`file://${path.resolve(__dirname, '../../static/html_to_pdf.html')}`, {});
  win.on('closed', () => { win = null; });
  win.webContents.on('dom-ready', () => {
    win.webContents.executeJavaScript(`
      var $marked = $('#marked');
      $('#marked').html(\`${html}\`);
    `);
    setTimeout(() => {
      win.webContents.printToPDF(opts, (err, data) => {
        if (err) {
          return;
        }
        fs.writeFile(filename, data, (innerErr) => {
          if (innerErr) {
            return;
          }
          win.destroy();
        });
      });
    }, 200);
  });
}

// 调用方法前确定有content
function mdLocalImageOut(filename, content) {
  content = content || '';
  const basename = path.basename(filename).split('.')[0];
  const dirname = path.dirname(filename);
  let index = 0;
  const pp = /!\[(.*?)\]\((.*?)\)/i;
  const ppp = /[http|https]/;
  let m;
  let result = content;
  return co(function* () {
    do {
      m = pp.exec(content);
      if (m) {
        const matchTxt = m[0];
        const text = m[1];
        const href = m[2];
        if (!ppp.test(href)) {
          const originPath = path.resolve(FILES_PATH, href);
          const stats = yield statAsync(originPath);
          if (stats.isFile()) {
            yield copyFile(originPath, path.resolve(dirname, `./${basename}_images/${index}`));
            result = result.replace(matchTxt, `![${text}](./${basename}_images/${index})`);
            content = content.replace(matchTxt, '');
            index += 1;
          }
        }
      }
    } while (m);
    return result;
  });
}

const dispatchHandlers = {
  testHandler(...args) {
    console.log(...args);
  },
  // 把笔记到处存为markdown
  saveNoteAsMarkdown(fileId) {
    ipcRenderer.send('saveDialog', 'export a note', 'md', { fileId, type: 'saveNoteAsMarkdown' });
  },
  saveNoteAsPdf(fileId) {
    ipcRenderer.send('saveDialog', 'export a note', 'pdf', { fileId, type: 'saveNoteAsPdf' });
  },
  // main process save的callback
  fileSaved(filename, tmpData) {
    switch (tmpData.type) {
      case 'saveNoteAsMarkdown':
        files.find({ _id: tmpData.fileId }, (err, docs) => {
          if (err || docs.length === 0) { return; }
          let content = docs[0].content;
          co(function* () {
            if (content.length > 0) {
              content = yield mdLocalImageOut(filename, content);
            }
            yield writeFileAsync(filename, content);
          });
        });
        break;

      case 'saveNoteAsPdf':
        files.find({ _id: tmpData.fileId }, (err, docs) => {
          if (err || docs.length === 0) { return; }
          const content = docs[0].content;
          const html = _renderHtml(content);
          _renderPdf(html, filename);
        });
        break;

      default:

    }
  },
  // 导入markdown or html
  importFile() {
    ipcRenderer.send('openFile', { type: 'importFile' });
  },
  // 选择文件的callback
  selectedFile(innerfiles, tmpData) {
    console.log(innerfiles);
    console.log(tmpData);
    switch (tmpData.type) {
      case 'importFile':
        console.log('xxxxx');
        break;
      default:

    }
  },
};

const ipcRender = require('electron').ipcRenderer;

function dispatch(action, ...args) {
  if (dispatchHandlers[action]) {
    dispatchHandlers[action](...args);
  }
}

function init() {
  ipcRender.on('dispatch', (e, ...args) => {
    dispatch(...args);
  });
}

init();
