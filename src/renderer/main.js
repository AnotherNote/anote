/* global $ */
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
// material-ui use the plugin
import injectTapEventPlugin from 'react-tap-event-plugin';
// material-ui theme provider
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { ipcRenderer } from 'electron';
import App from './views/app';
import store from './store';
import constants from '../constants';

window.$ = window.jQuery = window.jquery = require('jquery');
require('babel-polyfill');

window.constants = constants;
const { FILES_PATH } = constants;

injectTapEventPlugin();

const muiTheme = getMuiTheme({
  fontFamily: '"YaHei Consolas Hybrid", Consolas, 微软雅黑, "Meiryo UI", "Malgun Gothic", "Segoe UI", "Trebuchet MS", Helvetica, Monaco, courier, monospace !important',
  palette: {
    primary1Color: '#e78170',
  },
});

// subscribe redux to control new note menu item
function controlNewNoteMenu() {
  let globalBook = null;
  store.subscribe(() => {
    if ((!!store.getState().globalBook._id) !== globalBook) {
      globalBook = (!!store.getState().globalBook._id);
      if (store.getState().globalBook._id) {
        ipcRenderer.send('enableItem', 'New Note');
      } else {
        ipcRenderer.send('disableItem', 'New Note');
      }
    }
  });
}

controlNewNoteMenu();

document.addEventListener('DOMContentLoaded', () => {
  render(
    <Provider store={store}>
      <MuiThemeProvider muiTheme={muiTheme}>
        <App/>
      </MuiThemeProvider>
    </Provider>,
    document.getElementById('root'),
  );
}, false);

window.FILES_PATH = FILES_PATH;

// prevent external link open from browser
$('body').on('click', 'a.external', (event) => {
  event.preventDefault();
  event.stopPropagation();
  const href = $(this).attr('href');
  const pp = /[http|https]/;
  if (pp.test(href)) {
    ipcRenderer.send('openExternal', href);
  }
});
