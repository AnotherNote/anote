//tray menubar 速记功能
import React, {
    Component
} from 'react';
import ANoteEditor from './anote_editor';
import {
    files,
    books
} from '../../main/set_db';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import SelectField from 'material-ui/SelectField';
import sendMainCmd from '../main_util';

class TrayApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bookId: null,
      saveDialogOpen: false,
      alertDialogOpen: false,
      books: [],
      titleErrorText: null,
      bookIdErrorText: null,
      title: null
    }
  }

  getKeyMaps() {
    var that = this;
    return {
      'Cmd-S': function(cm){
        that.saveFile();
      }
    };
  }

  saveFile(event) {
    if(event){
      event.preventDefault();
      event.stopPropagation();
    }
    this._openDialog();
  }

  clear(event) {
    if(event){
      event.preventDefault();
      event.stopPropagation();
    }
    if(this.refs.fileContent)
      this.refs.fileContent.setValue('');
  }

  _openDialog() {
    var that = this;
    books.loadDatabase((error) => {
      if(error)
        return;
      books.find({available: true}).sort({ 'updatedAt': -1  }).exec((err, bks) => {
        if(bks.length == 0) {
          that.setState({
            books: []
          });
          return that._alertNoBooks();
        }
        that.setState({
          books: bks
        }, that._showSaveDialog);
      });
    });
  }

  _alertNoBooks() {
    this.setState({
      alertDialogOpen: true
    });
  }

  _closeAlertNoBooksDialog() {
    this.setState({
      alertDialogOpen: false
    });
  }

  _showSaveDialog() {
    this.setState({
      saveDialogOpen: true
    }, () => {
      this.refs.titleInput.focus();
    });
  }

  _okSave(event) {
    event.preventDefault();
    event.stopPropagation();
    let canSave = true;

    // validates
    if(!this.state.bookId || this.state.bookId == ''){
      canSave = false;
      this.setState({
        bookIdErrorText: 'must choose a book!!!'
      });
    }
    if(!this.state.title || this.state.title == ''){
      canSave = false;
      this.setState({
        titleErrorText: 'must input a title'
      });
    }

    // persistence
    if(canSave){
      // cannot save like this, because some cache I think.
      // files.insert({
      //   bookId: this.state.bookId,
      //   available: true,
      //   content: this.refs.fileContent.getValue() || '',
      //   title: this.state.title
      // }, (error, newFile) => {
      //
      // });
      sendMainCmd('newNoteFromTray', {
        bookId: this.state.bookId,
        available: true,
        content: this.refs.fileContent.getValue() || '',
        title: this.state.title
      });

      this.setState({
        bookId: null,
        title: null,
        bookIdErrorText: null,
        titleErrorText: null,
        saveDialogOpen: false
      });
      this.refs.fileContent.setValue('');
      this.refs.fileContent.clearHistory();
    }
  }

  _cancelSave() {
    this.setState({
      titleErrorText: null,
      title: null,
      saveDialogOpen: false
    });
  }

  _changeTitle(event) {
    this.setState({
      title: event.target.value
    });
  }

  _changeBookId(event, index, value) {
    this.setState({
      bookId: value
    })
  }

  render () {
    var saveActions = [
      <FlatButton
        label='Cancel'
        secondary={true}
        onTouchTap={this._cancelSave}
      />,
      <FlatButton
        label='Ok'
        primary={true}
        keyboardFocused={true}
        onTouchTap={this._okSave}
      />
    ];

    return (
      <div
        className='tray-layout'
      >
        <div
          className='tray-header'
        >
          <ul className="menu left">
            <li>
              <IconMenu
                anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                targetOrigin={{horizontal: 'left', vertical: 'top'}}
                iconButtonElement={
                  <IconButton style={{width: '40px', height: '40px', padding: '3px'}}><MoreVertIcon/></IconButton>
                }
              >
                <MenuItem
                  primaryText="save..."
                  onClick={this.saveFile}
                />
                <MenuItem
                  primaryText="clear"
                  onClick={this.clear}
                />
              </IconMenu>
            </li>
          </ul>
        </div>
        <div
          className='tray-content'
        >
          <ANoteEditor
            defaultValue={this.state.content}
            ref='fileContent'
            editorState={0}
            toggleWatching={function(){}}
            togglePreview={function(){}}
            onChange={() => {
            }}
            keyMaps={this.getKeyMaps()}
            withoutToolbar={true}
          />
        </div>
        <Dialog
          title='Save File'
          actions={saveActions}
          open={this.state.saveDialogOpen}
          onRequestClose={this._cancelSave}
          autoScrollBodyContent={true}
        >
          <form onSubmit={this._okSave}>
          <TextField
            fullWidth={true}
            hintText="title of the note"
            errorText={this.state.titleErrorText}
            floatingLabelText="title"
            defaultValue={''}
            onChange={this._changeTitle}
            ref='titleInput'
          />
          <SelectField
            value={this.state.bookId}
            onChange={this._changeBookId}
            floatingLabelText="select a book"
            errorText={this.state.bookIdErrorText}
          >
            {
              this.state.books.map((book) => {
                return (
                  <MenuItem
                    key={book._id}
                    value={book._id}
                    primaryText={book.name}
                  />
                )
              })
            }
          </SelectField>
          </form>
        </Dialog>

        <Dialog
          title='Alert!!'
          actions={[
            <FlatButton
              label='Ok'
              primary={true}
              keyboardFocused={true}
              onTouchTap={this._closeAlertNoBooksDialog}
            />
          ]}
          open={this.state.alertDialogOpen}
          onRequestClose={this._closeAlertNoBooksDialog}
          autoScrollBodyContent={true}
        >
          <br/>
          <div>
            before u save a note, please create a notebook first
          </div>
        </Dialog>
      </div>
    );
  }
}

export default TrayApp;
