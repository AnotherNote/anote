Promise = require('bluebird');
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

// material-ui use the plugin
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

// material-ui theme provider
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';


document.addEventListener('DOMContentLoaded', function() {
  render(
    <Provider store={store}>
      <MuiThemeProvider>
        <App/>
      </MuiThemeProvider>
    </Provider>,
    document.getElementById('root')
  );
}, false);

window.files = files;
