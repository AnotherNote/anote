import React, {
    Component
} from 'react';
import {
    connect
} from 'react-redux';
import {
    listFiles,
    addFile,
    delFile,
    concatFiles,
    editFile,
    activeFile,
    setGlobalBook
} from '../actions';
import {
    files,
    books,
    tags
} from '../../main/set_db';
import {
    hashHistory
} from 'react-router';
import FilesList from './files_list';
import FileForm from './file_form';
import FlatButton from 'material-ui/FlatButton';
import {
    debounce,
    pick
} from '../../util';
import {
  openFileItemContextMenu
} from '../controllers/files_controller.js';
import ConfirmDialog from './confirm_dialog';

const mapStateToProps = (state) => {
  return {
    files: state.files,
    currentFile: state.activeFile,
    globalBook: state.globalBook
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addFile: (file) => {
      dispatch(addFile(file));
    },
    listFiles: (files) => {
      dispatch(listFiles(files));
    },
    delFile: (file) => {
      dispatch(delFile(file));
    },
    concatFiles: (files) => {
      dispatch(concatFiles(files));
    },
    editFile: (file) => {
      dispatch(editFile(file));
    },
    activeFile: (file) => {
      dispatch(activeFile(file));
    },
    setGlobalBook: (book) => {
      dispatch(setGlobalBook(book));
    }
  }
}

class FilesContainer extends Component {
  constructor(props) {
    super(props);
    this.debouncedSaveFileToDb = debounce(this.saveFileToDb, 200);
    if(this.props.location.query.bookId){
      this.props.setGlobalBook({
        _id: this.props.location.query.bookId,
        name: this.props.location.query.bookName
      });
    }
    this.state = {
      confirmationOpen: false,
      confirmString: '',
      confirmationTmpData: {}
    };
  }

  // this hook method is not always recalled when url changed
  // this decided by react diff and replace strategy
  componentDidMount() {
    this._fetchFiles();
  }

  // cause: use newProps, because this.props has not been updated !!!!
  componentWillReceiveProps(newProps) {
    if(this.props.location.query.bookId != newProps.location.query.bookId){
      this._fetchFiles(newProps);
      this.props.setGlobalBook({
        _id: this.props.location.query.bookId,
        name: this.props.location.query.bookName
      });
      return;
    }
    if(this.props.location.query.searchFileText != newProps.location.query.searchFileText){
      this._fetchFiles(newProps);
      return;
    }
    if(newProps.files != this.props.files || newProps.params.id != this.props.params.id)
      this.getCurrentFile(newProps);
  }

  componentWillUnmount() {
    this.debouncedSaveFileToDb.cancel();
  }

  _fetchFiles = (newProps) => {
    let that = this,
      searchConditions = null,
      sortConditions = { 'updatedAt': -1 },
      props = newProps || this.props;

    if(props.location.query.bookId) {
      searchConditions = { bookId: props.location.query.bookId, available: true };
    }else if(props.location.query.searchFileText) {
      searchConditions = { $or: [ { title: { $regex: new RegExp(props.location.query.searchFileText, 'i') } }, { content: { $regex: new RegExp(props.location.query.searchFileText, 'i') } } ], available: true };
    }else {
      searchConditions = { available: true };
    }
    files.find(searchConditions).sort(sortConditions).exec( (err, fls) => {
      if(err)
        throw new Error('search file error');
      that.props.listFiles(fls);
      that._processJump(fls);
    });
  }

  // decide where to go
  _processJump = (fls) => {
    if(this.props.params.id)
      return;
    if(fls.length > 0){
      window.hashHistory = hashHistory;
      hashHistory.push({ pathname: `/notes/${fls[0]._id}/edit`, query: this.props.location.query });
    }
  }

  getCurrentFile = (newProps) => {
    let currentFile = newProps.files.find((file) => {
      return file._id == newProps.params.id;
    }) || {};
    this.debouncedSaveFileToDb.cancel();
    this.props.activeFile(currentFile);
    return currentFile;
  }

  newAndCreateFile = (event) => {
    if(event) {
      event.preventDefault();
      event.stopPropagation();
    }
    // only can create note when there is bookId
    if(!this.bookId()){
      console.log('unable to newAndCreateFile');
      return;
    }
    files.insert({bookId: this.bookId(), available: true}, (error, newFile) => {
      if(error) {
        throw error;
        return;
      }
      this.props.addFile(newFile);
      setTimeout(() => {
        hashHistory.push({ pathname: `/notes/${newFile._id}/edit`, query: this.props.location.query });
      }, 100);
    });
  }

  bookId = () => {
    return this.props.location.query.bookId || this.props.globalBook._id;
  }

  isInBook = () => {
    return this.props.location.query.bookId;
  }

  onChangeContent = (content, file) => {
    this.debouncedSaveFileToDb(Object.assign({}, file, {content: content}));
  }

  onChangeTitle = (event, file) => {
    this.debouncedSaveFileToDb(Object.assign({}, file, {title: event.target.value}));
  }

  saveFileToDb = (file) => {
    var that = this;
    that.props.editFile(file);
    files.update({'_id': file._id}, {$set: that._fileAttributes(file)}, {upsert: false, multi: false}, (error) => {
      if(error){
        throw error;
        return;
      }
    });
  }

  _fileAttributes = (file) => {
    return pick(file, 'title', 'content');
  }

  delFile = (file, index) => {
    this.setState({
      confirmationOpen: true,
      confirmString: `Are you sure you want to delete the note '${file.title || "Untitled"}'`,
      confirmationTmpData: {fileId: file._id, index: index}
    });
  }

  onOkConfirmationDialog = (event, tmpData) => {
    console.log(tmpData);
    let that = this;
    files.update({ _id: tmpData.fileId }, {$set: {available: false}}, {}, function(error) {
      if(error) {
        throw error;
        return;
      }
      let tmpFile = null,
        fileLength = that.props.files.length;
      if(fileLength > 1 && tmpData.index == fileLength-1) {
        tmpFile = that.props.files[0];
      }else if(fileLength > 1){
        tmpFile = that.props.files[tmpData.index+1];
      }
      console.log(tmpFile);
      console.log(`/notes/${tmpFile._id}/edit`);
      that.props.delFile({_id: tmpData.fileId});
      that.setState({
        confirmationOpen: false
      });
      if(fileLength == 1)
        return;
      hashHistory.push({ pathname: `/notes/${tmpFile._id}/edit`, query: that.props.location.query });
    });
  }

  onCancelConfirmationDialog = () => {
    this.setState({
      confirmationOpen: false
    });
  }

  onContextMenu = (file, index) => {
    let chooseFile = file ? true : false;
    let canNew = this.bookId() ? true : false;
    openFileItemContextMenu(
      canNew,
      chooseFile,
      {
        newFile: () => {
          this.newAndCreateFile();
        },
        moveToNotebook: () => {

        },
        copyToNotebook: () => {

        },
        normalExport: () => {

        },
        exportAsPdf: () => {

        },
        deleteFile: () => {
          this.delFile(file, index);
        }
      }
    );
  }

  render() {
    return (
      <div className='work-wrapper'>
        <div
          className='sec-sidebar'
          onContextMenu={(event) => {this.onContextMenu();}}
        >
          <FlatButton
            label={this.bookId() ? `NEW NOTE IN ${this.props.globalBook.name}` : 'UNABLE NEW A NOTE!!'}
            onClick={this.newAndCreateFile}
            primary={true}
            backgroundColor={this.bookId() ? 'rgba(255, 255, 255, 1)' : '#ddd'}
            style={{
              width: '295px',
              lineHeight: '40px',
              height: '42px',
              color: '#3d3d3d',
              border: '1px solid',
              borderColor: '#ddd',
              position: 'fixed',
              zIndex: 100
            }}
          />
          <FilesList
            files={this.props.files}
            query={this.props.location.query}
            onContextMenu={this.onContextMenu}
          />
        </div>
        <div className='work-pane'>
          {this.props.children && React.cloneElement(this.props.children, {currentFile: this.props.currentFile, callbacks: {onChangeContent: this.onChangeContent, onChangeTitle: this.onChangeTitle}})}
        </div>
        <ConfirmDialog
          cancelString='Cancel'
          okString='Delete'
          onCancel={this.onCancelConfirmationDialog}
          onOk={this.onOkConfirmationDialog}
          title= ''
          open={this.state.confirmationOpen}
          confirmString={this.state.confirmString}
          tmpData={this.state.confirmationTmpData}
        />
      </div>
    );
  }
}

window.FilesContainer = FilesContainer;

export default connect(mapStateToProps, mapDispatchToProps)(FilesContainer);
