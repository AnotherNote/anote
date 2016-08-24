'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _app = require('./views/app');

var _app2 = _interopRequireDefault(_app);

var _set_db = require('../main/set_db');

var _redux = require('redux');

var _reactRedux = require('react-redux');

var _reducers = require('./reducers');

var _reducers2 = _interopRequireDefault(_reducers);

var _reactTapEventPlugin = require('react-tap-event-plugin');

var _reactTapEventPlugin2 = _interopRequireDefault(_reactTapEventPlugin);

var _MuiThemeProvider = require('material-ui/styles/MuiThemeProvider');

var _MuiThemeProvider2 = _interopRequireDefault(_MuiThemeProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Promise = require('bluebird');
require('babel-polyfill');

var fs = require('fs'),
    path = require('path');

var store = (0, _redux.createStore)(_reducers2.default);

// material-ui use the plugin

(0, _reactTapEventPlugin2.default)();

// material-ui theme provider


document.addEventListener('DOMContentLoaded', function () {
  (0, _reactDom.render)(_react2.default.createElement(
    _reactRedux.Provider,
    { store: store },
    _react2.default.createElement(
      _MuiThemeProvider2.default,
      null,
      _react2.default.createElement(_app2.default, null)
    )
  ), document.getElementById('root'));
}, false);

window.files = _set_db.files;