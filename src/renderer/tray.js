require('babel-polyfill');

window.$ = window.jQuery = window.jquery = require('jquery');
import React from 'react';
import { render } from 'react-dom';

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

import TrayApp from './views/tray_app'

document.addEventListener('DOMContentLoaded', function(){
  render(
    <MuiThemeProvider muiTheme={muiTheme}>
      <TrayApp/>
    </MuiThemeProvider>
  , document.getElementById('root'));
}, false);
