Promise = require('bluebird');
window.$ = window.jQuery = window.jquery = require('jquery');
require('babel-polyfill');

const fs = require('fs'),
    path = require('path');

import React from 'react';
import { render } from 'react-dom';
import App from './views/app';
import { files, books, tags, infos } from '../main/set_db';
import { Provider } from 'react-redux';
import store from './store';
import constants from '../constants';
window.constants = constants;
let { FILES_PATH } = constants;

// material-ui use the plugin
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

// material-ui theme provider
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

const muiTheme = getMuiTheme({
  fontFamily: '"YaHei Consolas Hybrid", Consolas, 微软雅黑, "Meiryo UI", "Malgun Gothic", "Segoe UI", "Trebuchet MS", Helvetica, Monaco, courier, monospace !important',
  palette: {
    primary1Color: '#e78170'
  }
});

const ipcRenderer = require('electron').ipcRenderer;


// subscribe redux to control new note menu item
function controlNewNoteMenu() {
  var globalBook = null;
  store.subscribe(() => {
    if((!!store.getState().globalBook._id) != globalBook){
      globalBook = (!!store.getState().globalBook._id);
      if(store.getState().globalBook._id){
        ipcRenderer.send('enableItem', 'New Note');
      }else{
        ipcRenderer.send('disableItem', 'New Note');
      }
    }
  });
}

controlNewNoteMenu();

document.addEventListener('DOMContentLoaded', function() {
  render(
    <Provider store={store}>
      <MuiThemeProvider muiTheme={muiTheme}>
        <App/>
      </MuiThemeProvider>
    </Provider>,
    document.getElementById('root')
  );
}, false);

window.FILES_PATH = FILES_PATH;

// prevent external link open from browser
$('body').on('click', 'a.external', function(event) {
  event.preventDefault();
  event.stopPropagation();
  let href = $(this).attr('href');
  var pp = /[http|https]/;
  if(pp.test(href)){
    ipcRenderer.send('openExternal', href);
  }
});
