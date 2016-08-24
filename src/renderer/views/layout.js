import React, { Component } from 'react';
import { Link, IndexLink } from 'react-router';
import {List, ListItem} from 'material-ui/List';
import TextField from 'material-ui/TextField';

class Layout extends Component {
  render() {
    return (
      <div className='body'>
        <div className='header'>
          <TextField
            hintText="Search a note"
            style={{ right: '0px', position: 'absolute', marginRight: '10px' }}
            inputStyle={{ color: 'white'}}
            hintStyle={{ color: 'white' }}
          />
        </div>
        <div className='sidebar'>
          <ul>
            <li><IndexLink to='/books' activeClassName='active'>notebooks</IndexLink></li>
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
