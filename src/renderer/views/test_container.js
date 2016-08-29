import React, {
    Component
} from 'react';

const {remote} = require('electron')
const {Menu, MenuItem} = remote
const BrowserWindow = remote.BrowserWindow
const path = require('path')
const ipcRender = require('electron').ipcRenderer


const menu = new Menu()
menu.append(new MenuItem({label: 'MenuItem1', click() { console.log('item 1 clicked') }}))
menu.append(new MenuItem({type: 'separator'}))
menu.append(new MenuItem({label: 'MenuItem2', type: 'checkbox', checked: true}))

export default class TestContainer extends Component {
  // context menu handler
  contextMunuHandler = () => {
    menu.popup(remote.getCurrentWindow())
  }

  // open new window
  windowClick = () => {
    const modalPath = path.join('file://', __dirname, '../../../static/test.html')
    let win = new BrowserWindow({ width: 400, height: 320 })
    win.on('close', function () { win = null })
    win.loadURL(modalPath)
    win.show()
  }

  testIpc = () => {
    // 函数是传不过去的
    ipcRender.send('ipcTestMain', {hh: hh});
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
            height: '100px',
            backgroundColor: '#eef'
          }}
          onClick={this.testIpc}
        >test Ipc</div>
        <div>test4</div>
        <div>test5</div>
      </div>
    );
  }
}
