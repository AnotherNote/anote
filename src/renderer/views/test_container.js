import React, {
    Component
} from 'react';
import ANoteEditor from './anote_editor';
import fs from 'fs';
const {remote} = require('electron')
const {Menu, MenuItem} = remote
const BrowserWindow = remote.BrowserWindow
const path = require('path')
const ipcRender = require('electron').ipcRenderer
const webContents = remote.webContents;

const menu = new Menu()
menu.append(new MenuItem({label: 'MenuItem1', click() { console.log('item 1 clicked') }}))
menu.append(new MenuItem({type: 'separator'}))
menu.append(new MenuItem({label: 'MenuItem2', type: 'checkbox', checked: true}))

export default class TestContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: 1,
      oldState: null
    }
  }

  // context menu handler
  contextMunuHandler() {
    menu.popup(remote.getCurrentWindow())
  }

  // open new window
  windowClick() {
    const modalPath = path.join('file://', __dirname, '../../../static/test.html')
    let win = new BrowserWindow({ width: 400, height: 320 })
    win.on('close', function () { win = null })
    win.loadURL(modalPath)
    win.show()
    var opts = {
      marginsType: 0,
      printBackground: true,
      printSelectionOnly: false,
      pageSize: 'A4',
      landscape: false
    }
    win.webContents.on('did-finish-load', function() {
      win.webContents.printToPDF(opts, function(err, data) {
        if(err)
          console.log(err);
        fs.writeFile(path.resolve(__dirname, '../../../testpdf.pdf'), data, function (err) {
          if (err) {
            console.error(err)
          }
          console.log('success!!!');
        })
      })
    });
  }

  testIpc() {
    // 函数是传不过去的
    ipcRender.send('ipcTestMain', {hh: 'hh'});
  }

  // electron printToPDF, so cool!!!!!!
  testPdf() {
    var opts = {
      marginsType: 0,
      printBackground: true,
      printSelectionOnly: false,
      pageSize: 'A4',
      landscape: false
    }
    webContents.getFocusedWebContents().printToPDF(opts, function(err, data) {
      if(err)
        console.log(err);
      fs.writeFile(path.resolve(__dirname, '../../../testpdf.pdf'), data, function (err) {
        if (err) {
          console.error(err)
        }
        console.log('success!!!');
      })
    })
  }

  toggleWatching() {
    this.setState({
      editorState: this.state.editorState == 1 ? 0 : 1,
      oldState: this.state.editorState == 1 ? 0 : 1
    });
  }

  togglePreview() {
    this.setState({
      editorState: this.state.editorState == 2 ? this.state.oldState || 0 : 2
    });
  }

  render() {
    return (
      <div>
        <div
          onContextMenu={this.contextMunuHandler}
          style={{
            height: '100px',
            backgroundColor: '#fae'
          }}
        >right menu</div>
        <div
          style={{
            height: '100px',
            backgroundColor: '#efa'
          }}
          onClick={this.windowClick}
        >open window</div>
        <div
          style={{
            height: '400px',
            backgroundColor: '#eef'
          }}
          onClick={this.testIpc}
        >test Ipc</div>
        <div
          style={{
            height: '500px'
          }}
        ><ANoteEditor
          defaultValue='### h'
          editorState={this.state.editorState}
          toggleWatching={this.toggleWatching}
          togglePreview={this.togglePreview}
        /></div>
        <div
          onClick={this.testPdf}
        >test5</div>
      </div>
    );
  }
}
