import React, { Component } from 'react';
import { connect } from 'react-redux';
import reducers from '../reducers';
import { Router, Route, hashHistory, IndexRoute } from 'react-router';

import { popHistory, pushHistory } from '../actions';
import Layout from './layout';
import BooksContainer from './books_container';
import FilesContainer from './files_container';

const mapStateToProps = (state) => {
  return {
    histories: state.histories
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    popHistory: () => {
      dispatch(popHistory());
    },
    pushHistory: (history) => {
      dispatch(pushHistory(history));
    }
  };
}

const App = class App extends Component {
    constructor(props) {
      super(props);
    }

    render() {
      return (
        <Router history={hashHistory}>
          <Route path="/" component={Layout}>
            <IndexRoute component={BooksContainer}></IndexRoute>
            <Route path='/books' component={BooksContainer}></Route>
            <Route path='/notes' component={FilesContainer}></Route>
          </Route>
        </Router>
      );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
