import React, { Component } from 'react';
import { Link, IndexLink } from 'react-router';
import {List, ListItem} from 'material-ui/List';
import TextField from 'material-ui/TextField';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import { hashHistory } from 'react-router';
import ReactDom from 'react-dom';

class Layout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchFileText: props.location.query.searchFileText || ''
    };
  }

  globalSearch = (event) => {
    event.preventDefault();
    event.stopPropagation();
    hashHistory.push({ pathname: '/notes', query: {searchFileText: this.state.searchFileText}});
  }

  changeSearchFileText = (event) => {
    this.setState({
      searchFileText: event.target.value
    });
  }

  // maybe not a legant way, the method break the react lifecycle!!!
  componentWillReceiveProps(newProps) {
    if(newProps.location.query.searchFileText != this.state.searchFileText){
      this.setState({searchFileText: newProps.location.query.searchFileText || ''});
      jQuery(ReactDom.findDOMNode(this.refs.globalSearchInput)).find('input').val(newProps.location.query.searchFileText || '');
    }
  }

  render() {
    return (
      <div className='body'>
        <div className='header'>
          <form onSubmit={this.globalSearch}>
            <TextField
              hintText="Search a note"
              style={{ right: '0px', position: 'absolute', marginRight: '10px' }}
              inputStyle={{ color: 'white'}}
              hintStyle={{ color: 'white' }}
              defaultValue={this.state.searchFileText}
              onChange={this.changeSearchFileText}
              ref='globalSearchInput'
            />
          </form>
        </div>
        <div className='sidebar'>
          <div className='banner'><p>Enjoy ANOTE coding now...</p></div>
          <ul className='s-menu main-menu'>
            <li><IndexLink to='/' activeClassName='active'>notebooks</IndexLink></li>
            <li><Link to='/notes' activeClassName='active'>notes</Link></li>
          </ul>
        </div>
        <div className='content'>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default Layout;
