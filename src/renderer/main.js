Promise = require('bluebird');
window.$ = window.jQuery = window.jquery = require('jquery');
require('babel-polyfill');

const fs = require('fs'),
    path = require('path');

import React from 'react';
import { render } from 'react-dom';
import App from './views/app';
import { files, books, tags, infos } from '../main/set_db';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import reducers from './reducers';
let store = createStore(reducers);
import constants from '../constants';
let { FILES_PATH } = constants;
import { setupIpc } from './setup_ipc';

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

// setupIpc to main
setupIpc();
