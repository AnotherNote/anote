import path from 'path';
import co from 'co';
import React, {
    Component,
    PropTypes
} from 'react';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import DropZone from 'react-dropzone';
import constants from '../../constants';
let {
    FILES_PATH
} = constants;
import {
    copyFile,
    getFileHash,
    hash2Key
} from '../../util'

// props {book, open, onCancel, onOk}
class BookForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      book: this.props.book,
      nameErrorText: null,
      processImage: false
    }
  }

  componentWillReceiveProps(newProps) {
    if(JSON.stringify(newProps.book) != JSON.stringify(this.state.book)) {
      this.setState({
        book: newProps.book,
        nameErrorText: null
      });
    }
  }

  _changeName(event) {
    this.setState({
      book: Object.assign({}, this.state.book, { name: event.target.value })
    });
  }

  _submit(event) {
    event.preventDefault();
    event.stopPropagation();
    if(this.state.book.name == '' || !this.state.book.name){
      this.setState({
        nameErrorText: 'need a name!!'
      });
      return;
    }
    this.props.onOk(this.state.book);
  }

  _dropImage(files) {
    let that = this;
    co(function * () {
      let path = files[0].path;
      let hashKey = yield getFileHash(path);
      let key = hash2Key(hashKey);
      yield copyFile(path, `${FILES_PATH}/${key}`);
      that.setState({
        book: Object.assign({}, that.state.book, { imagePath: key })
      });
    });
  }

  render() {
    const actions = [
      <FlatButton
        label='Cancel'
        secondary={true}
        onTouchTap={this.props.onCancel}
      />,
      <FlatButton
        label='Ok'
        primary={true}
        keyboardFocused={true}
        onTouchTap={this._submit}
      />
    ];

    return (
      <Dialog
        title={this.state.book._id ? 'Edit Book' : 'New Book'}
        actions={actions}
        open={this.props.open}
        onRequestClose={this.props.onCancel}
        autoScrollBodyContent={true}
      >
        <form onSubmit={this._submit}>
          <TextField
            fullWidth={true}
            hintText="name of the new book"
            errorText={this.state.nameErrorText}
            floatingLabelText="name"
            defaultValue={this.state.book.name}
            onChange={this._changeName}
          /><br/>
          <DropZone onDrop={this._dropImage} multiple={false} style={{width: '200px', height: '200px'}}>
            <img
              src={this.state.book.imagePath != '' ? `${FILES_PATH}/${this.state.book.imagePath}` : constants.TMP_IMAGE_PATH}
              style={{ height: '100%', width: '100%', objectFit: 'contain' }}
            />
          </DropZone>
        </form>
      </Dialog>
    );
  }
}

// strong params
BookForm.propTypes = {
    book: PropTypes.object,
    open: PropTypes.bool,
    onCancel: PropTypes.func,
    onOk: PropTypes.func
}

export default BookForm;
