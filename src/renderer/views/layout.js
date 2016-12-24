import React, {
    Component
} from 'react';
import {
    Link,
    IndexLink
} from 'react-router';
import {
    List,
    ListItem
} from 'material-ui/List';
import TextField from 'material-ui/TextField';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import {
    hashHistory
} from 'react-router';
import ReactDom from 'react-dom';
import { setDispatchHandler } from '../dispatch_handlers'
import {
  files
} from '../../main/set_db';
import singleEvent from '../single_event';
import { setupIpc } from '../setup_ipc';

class Layout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchFileText: props.location.query.searchFileText || ''
    };
  }

  globalSearch(event) {
    event.preventDefault();
    event.stopPropagation();
    hashHistory.push({ pathname: '/notes', query: {searchFileText: this.state.searchFileText, available: true}});
  }

  changeSearchFileText(event) {
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

  componentDidMount() {
    setupIpc();
    // 配些全局的相应appmenu的event
    setDispatchHandler('newNoteBook', () => {
      hashHistory.replace({
        pathname: '/',
        query: {
          newNoteBook: true
        }
      });
    });
    setDispatchHandler('newNote', () => {
      let patt = new RegExp('notes');
      if(patt.test(this.props.location.pathname)){
        hashHistory.push({
          pathname: this.props.location.pathname,
          query: Object.assign({}, this.props.location.query, {available: true, newNote: true})
        });
      }else{
        hashHistory.push({
          pathname: '/notes',
          query: {available: true, newNote: true}
        });
      }
    });

    //new note From tray
    setDispatchHandler('newNoteFromTray', (fileParams) => {
      files.insert(fileParams, (error, newFile) => {
        singleEvent.emit('addNoteFromTray', newFile)
      });
    });

    // hack notes和trash的相应
    jQuery(ReactDom.findDOMNode(this.refs.notesLink)).click(function(event){
      if($(this).hasClass('active'))
        event.preventDefault();
    });
    jQuery(ReactDom.findDOMNode(this.refs.trashLink)).click(function(event){
      if($(this).hasClass('active'))
        event.preventDefault();
    });
  }

  render() {
    return (
      <div className='body'>
        <div className='header'>
          <form onSubmit={this.globalSearch}>
            <TextField
              hintText="Search notes"
              style={{ right: '0px', position: 'absolute', marginRight: '10px' }}
              inputStyle={{ color: 'white'}}
              hintStyle={{ color: 'white' }}
              defaultValue={this.state.searchFileText || ''}
              onChange={this.changeSearchFileText}
              ref='globalSearchInput'
            />
          </form>
        </div>
        <div className='sidebar'>
          <div className='banner'><p>Enjoy ANOTE</p></div>
          <ul className='s-menu main-menu'>
            <li><IndexLink to='/' activeClassName='active'>Notebooks</IndexLink></li>
            <li>
              <Link
                to={{pathname: '/notes', query: { available: true }}}
                activeClassName='active'
                ref='notesLink'
              >
                Notes
              </Link>
            </li>
            <li>
              <Link
                to={{pathname: '/notes', query: { available: false }}}
                activeClassName='active'
                ref='trashLink'
              >
                Trash
              </Link>
            </li>
            {/* <li><Link to='/test' activeClassName='active'>playstation</Link></li> */}
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
