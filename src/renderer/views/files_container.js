import React, {
    Component
} from 'react';
import {
    connect
} from 'react-redux';
import ReactDom from 'react-dom';
import {
    listFiles,
    addFile,
    delFile,
    concatFiles,
    editFile,
    activeFile,
    setGlobalBook,
    listBooks,
    setEditorState
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
import ListMenu from './list_menu';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
const ipcRenderer = require('electron').ipcRenderer;
import util from 'util';
import { setDispatchHandler } from '../dispatch_handlers';
import { sendWorkerCmd } from '../worker_util';
import singleEvent from '../single_event';
import Spinner from './spinner'

function mapStateToProps(state) {
  return {
    files: state.files,
    currentFile: state.activeFile,
    globalBook: state.globalBook,
    books: state.books,
    editorState: state.editorState
  }
}

function mapDispatchToProps(dispatch) {
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
    },
    listBooks: (books) => {
      dispatch(listBooks(books));
    },
    setEditorState: (state) => {
      dispatch(setEditorState(state));
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
      // for confirmation dialog
      confirmationOpen: false,
      confirmString: '',
      confirmationTmpData: {},
      // for copy and past menu
      listMenuOpen: false,
      currentBookId: null,
      listMenuTmpData: {}
    };
    setDispatchHandler('moveToNotebook', this.menuMoveToNotebook);
    setDispatchHandler('copyToNotebook', this.menuCopyToNotebook);
    setDispatchHandler('moveToTrash', this.menuMoveToTrash);
    setDispatchHandler('clearFile', this.menuClearFile);
    setDispatchHandler('restoreFile', this.menuRestoreFile);
  }


  menuMoveToNotebook() {
    this.moveToNotebook(this.props.currentFile, this.props.files.findIndex((file) => {
      return file._id == this.props.currentFile._id;
    }));
  }

  menuCopyToNotebook() {
    this.copyToNotebook(this.props.currentFile, this.props.files.findIndex((file) => {
      return file._id == this.props.currentFile._id;
    }));
  }

  menuMoveToTrash() {
    this.delFile(this.props.currentFile, this.props.files.findIndex((file) => {
      return file._id == this.props.currentFile._id;
    }));
  }

  menuClearFile() {
    this.clearFile(this.props.currentFile, this.props.files.findIndex((file) => {
      return file._id == this.props.currentFile._id;
    }));
  }

  menuRestoreFile() {
    this.restoreFile(this.props.currentFile, this.props.files.findIndex((file) => {
      return file._id == this.props.currentFile._id;
    }));
  }

  // this hook method is not always recalled when url changed
  // this decided by react diff and replace strategy
  componentDidMount() {
    this._checkNewNoteParam();
    this._fetchFiles();
    this._fetchBooks();
    ipcRenderer.send('onNoEditNotesList');
    singleEvent.on('addNoteFromTray', this._addNoteFromTray);
  }

  _addNoteFromTray(newFile) {
    if(!this.props.location.query.available)
      return;
    if(this.props.location.query.searchFileText && this.props.location.query.searchFileText != '')
      return;
    if(this.props.location.query.bookId && this.props.location.query.bookId != newFile.bookId)
      return;
    this.props.addFile(newFile);
  }

  // cause: use newProps, because this.props has not been updated !!!!
  componentWillReceiveProps(newProps) {
    // 用于新建note
    this._checkNewNoteParam(newProps);

    // 确保files最新
    if(this.props.location.query.bookId != newProps.location.query.bookId){
      this._fetchFiles(newProps);
      if(newProps.location.query.bookId){
        this.props.setGlobalBook({
          _id: newProps.location.query.bookId,
          name: newProps.location.query.bookName
        });
      }
    }

    // searchFileText change 重新 fetch 数据
    if(this.props.location.query.searchFileText != newProps.location.query.searchFileText
        || this.props.location.query.available != newProps.location.query.available){
      this._fetchFiles(newProps);
    }

    // 确保currentfile最新，由于我们用一个页面相同元素换属性来展示页面，所以不是替换元素，出发不了componentDidMount
    if(newProps.files != this.props.files || newProps.params.id != this.props.params.id){
      if(newProps.params.id && newProps.files.length > 0){
        this.getCurrentFile(newProps);
      }
    }

    // 确保有book可以新建文章
    if(newProps.books != this.props.books)
      this._ensureGlobalBook(newProps.books.filter((book) => {
        return book.available;
      })[0]);
  }

  componentWillUnmount() {
    this.debouncedSaveFileToDb.cancel();
    setDispatchHandler('moveToNotebook', null);
    setDispatchHandler('copyToNotebook', null);
    setDispatchHandler('moveToTrash', null);
    setDispatchHandler('clearFile', null);
    setDispatchHandler('restoreFile', null);
    singleEvent.removeAllListeners('addNoteFromTray');
  }

  _checkNewNoteParam(props) {
    props = props || this.props;
    if(props.location.query.newNote == 'true'){
      // 保证只开一次新建的dialog
      this._delNewNoteParam();
      this.newAndCreateFile();
      return true;
    }
    return false;
  }

  _delNewNoteParam() {
    hashHistory.replace({
      pathname: this.props.location.pathname,
      query: Object.assign({}, pick(this.props.location.query, 'searchFileText', 'bookId', 'bookName'), {available: true})
    });
  }

  _fetchFiles(newProps) {
    let that = this,
      searchConditions = null,
      sortConditions = { 'updatedAt': -1 },
      props = newProps || this.props;
    if(props.location.query.bookId) {
      searchConditions = { bookId: props.location.query.bookId, available: true };
    }else if(props.location.query.searchFileText) {
      searchConditions = { $or: [ { title: { $regex: new RegExp(props.location.query.searchFileText, 'i') } }, { content: { $regex: new RegExp(props.location.query.searchFileText, 'i') } } ], available: true };
    }else if(props.location.query.available == 'false') {
      searchConditions = { available: false };
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

  // 如果没有book数据，就需要fetch book的数据
  _fetchBooks() {
    var that = this;
    if(this.props.books.length == 0){
      books.find({}).sort({ 'updatedAt': -1 }).exec((err, bks) => {
        that.props.listBooks(bks);
      });
    }else{
      this._ensureGlobalBook();
    }
  }

  _ensureGlobalBook(book) {
    let firstBook = null;
    if(!this.bookId() && (firstBook = book || this._availableBooks()[0])){
      this.props.setGlobalBook({
        _id: firstBook._id,
        name: firstBook.name
      });
    }
  }

  _availableBooks() {
    return this.props.books.filter((book) => {
      return book.available;
    });
  }

  _unavailableBooks() {
    return this.props.books.filter((book) => {
      return !book.available;
    });
  }

  // decide where to go
  _processJump(fls) {
    if(this.props.params.id)
      return;
    if(fls.length > 0){
      hashHistory.push({ pathname: `/notes/${fls[0]._id}/edit`, query: this.props.location.query });
    }
  }

  getCurrentFile(newProps) {
    console.log('getCurrentFile');
    let currentFile = newProps.files.find((file) => {
      return file._id == newProps.params.id;
    }) || {};
    this.debouncedSaveFileToDb.cancel();
    this.props.activeFile(currentFile);
    if(currentFile._id && this.props.location.query.available == 'true'){
      ipcRenderer.send('onEditNote');
    }else if(currentFile._id && this.props.location.query.available == 'false'){
      ipcRenderer.send('onEditTrash');
    }
    console.log(currentFile);
    return currentFile;
  }

  newAndCreateFile(event) {
    if(event) {
      event.preventDefault();
      event.stopPropagation();
    }
    // only can create note when there is bookId
    if(!this.bookId()){
      return;
    }
    files.insert({bookId: this.bookId(), available: true}, (error, newFile) => {
      if(error) {
        throw error;
        return;
      }
      if(this.props.location.query.available == 'true') {
        this.props.addFile(newFile);
      }
      hashHistory.push({ pathname: `/notes/${newFile._id}/edit`, query: this.props.location.query});
    });
  }

  // 用于新建的bookId
  bookId() {
    let result = this.props.location.query.bookId || this.props.globalBook._id;
    return result;
  }

  isInBook() {
    return this.props.location.query.bookId;
  }

  onChangeContent(content, file) {
    this.debouncedSaveFileToDb(Object.assign({}, file, {content: content}));
  }

  onChangeTitle(value, file) {
    this.debouncedSaveFileToDb(Object.assign({}, file, {title: value}));
  }

  saveFileToDb(file) {
    var that = this;
    that.props.editFile(file);
    files.update({'_id': file._id}, {$set: that._fileAttributes(file)}, {upsert: false, multi: false}, (error) => {
      if(error){
        throw error;
        return;
      }
    });
  }

  _fileAttributes(file) {
    return pick(file, 'title', 'content');
  }

  delFile(file, index) {
    this.setState({
      confirmationOpen: true,
      confirmString: `Are you sure you want to delete the note '${file.title || "Untitled"}'`,
      confirmationTmpData: {fileId: file._id, index: index, callback: 'delFileOk'}
    });
  }

  delFileOk(tmpData) {
    let that = this;
    files.update({ _id: tmpData.fileId }, {$set: {available: false}}, {}, function(error) {
      if(error) {
        throw error;
        return;
      }
      that._processDelAndJump(tmpData.index, tmpData.fileId, () => {
        that.setState({
          confirmationOpen: false
        });
      });
    });
  }

  clearFile(file, index) {
    this.setState({
      confirmationOpen: true,
      confirmString: `Are you sure you want to delete forever the note '${file.title || "Untitled"}'`,
      confirmationTmpData: {fileId: file._id, index: index, callback: 'clearFileOk'}
    });
  }

  clearFileOk(tmpData) {
    let that = this;
    files.remove({ _id: tmpData.fileId }, {}, function(error) {
      if(error) {
        throw error;
        return;
      }
      that._processDelAndJump(tmpData.index, tmpData.fileId, () => {
        that.setState({
          confirmationOpen: false
        });
      });
    });
  }

  clearTrash(file, index) {
    this.setState({
      confirmationOpen: true,
      confirmString: 'Are you sure you want to clear trash',
      confirmationTmpData: {callback: 'clearTrashOk'}
    });
  }

  clearTrashOk() {
    let that = this;
    files.remove({available: false}, {multi: true}, (err) => {
      that.props.listFiles([]);
      hashHistory.push({pathname: '/notes', query: {available: false}});
      that.setState({
        confirmationOpen: false
      });
    })
  }

  findBook(bookId) {
    return this.props.books.filter((book) => {
      return book._id == bookId;
    })[0];
  }

  restoreFile(file, index) {
    let tmpBook = this.findBook(file.bookId);
    this.setState({
      confirmationOpen: true,
      confirmString: `Are you sure you want to restore the note '${file.title || "Untitled"}' to ${(tmpBook && tmpBook.name) || 'original book'}`,
      confirmationTmpData: {fileId: file._id, index: index, callback: 'restoreFileOk', file: file}
    });
  }

  restoreFileOk(tmpData) {
    let that = this;
    let tmpBook = this.findBook(tmpData.file.bookId);
    if(tmpBook && !tmpBook.available){
      books.update({ _id: tmpBook._id }, {$set: {available: true}}, {}, function(error) {
        if(error) {
          throw error;
          return;
        }
        files.update({ _id: tmpData.fileId }, {$set: {available: true}}, {}, function(error) {
          if(error) {
            throw error;
            return;
          }
          that._processDelAndJump(tmpData.index, tmpData.fileId, () => {
            that.setState({
              confirmationOpen: false
            });
          });
        });
      });
    }else{
      files.update({ _id: tmpData.fileId }, {$set: {available: true}}, {}, function(error) {
        if(error) {
          throw error;
          return;
        }
        that._processDelAndJump(tmpData.index, tmpData.fileId, () => {
          that.setState({
            confirmationOpen: false
          });
        });
      });
    }
  }

  onOkConfirmationDialog(event, tmpData) {
    this[tmpData.callback](tmpData);
  }

  // process delete action and jump
  _processDelAndJump( index, fileId, customerFunc ) {
    console.log('_processDelAndJump');
    console.log(index, fileId);
    let tmpFile = null,
      fileLength = this.props.files.length;
    if(fileLength > 1 && index == fileLength-1) {
      tmpFile = this.props.files[0];
    }else if(fileLength > 1){
      tmpFile = this.props.files[index+1];
    }
    this.props.delFile({_id: fileId});
    if(customerFunc)
      customerFunc();
    if(fileLength == 1)
      return hashHistory.push({ pathname: '/notes', query: this.props.location.query });
    hashHistory.push({ pathname: `/notes/${tmpFile._id}/edit`, query: this.props.location.query });
  }

  onCancelConfirmationDialog() {
    this.setState({
      confirmationOpen: false
    });
  }

  onContextMenu(file, index) {
    let chooseFile = file ? true : false;
    let canNew = this.bookId() ? true : false;
    openFileItemContextMenu(
      this.props.location.query.available,
      canNew,
      chooseFile,
      {
        importFile: () => {
          sendWorkerCmd('importFile');
        },
        newFile: () => {
          this.newAndCreateFile();
        },
        moveToNotebook: () => {
          this.moveToNotebook(file, index);
        },
        copyToNotebook: () => {
          this.copyToNotebook(file, index);
        },
        normalExport: () => {
          sendWorkerCmd('saveNoteAsMarkdown', file._id);
        },
        exportAsPdf: () => {
          sendWorkerCmd('saveNoteAsPdf', file._id);
        },
        deleteFile: () => {
          this.delFile(file, index);
        },
        clearFile: () => {
          this.clearFile(file, index);
        },
        restoreFile: () => {
          console.log('restore');
          this.restoreFile(file, index);
        },
        clearTrash: () => {
          this.clearTrash();
        }
      }
    );
  }

  moveToNotebook(file, index) {
    let tmpIdx = this._availableBooks().findIndex((book) => {
      return book._id == file.bookId;
    });
    this.setState({
      currentBookId: this._availableBooks()[tmpIdx]._id,
      listMenuOpen: true,
      listMenuTmpData: {
        file: file,
        type: 'move',
        index: index
      }
    });
  }

  copyToNotebook(file, index) {
    let tmpIdx = this._availableBooks().findIndex((book) => {
      return book._id == file.bookId;
    });
    this.setState({
      currentBookId: this._availableBooks()[tmpIdx]._id,
      listMenuOpen: true,
      listMenuTmpData: {
        file: file,
        type: 'copy',
        index: index
      }
    });
  }

  menuListFilter(dataItem, currentDataItem) {
    return dataItem.id == currentDataItem;
  }

  listMenuCancel() {
    this.setState({
      listMenuOpen: false
    });
  }

  listMenuOk(event, checkedId, tmpData) {
    this[`_${tmpData.type}File`](tmpData, checkedId);
  }

  // move file to other notebook
  _moveFile({file, index}, bookId) {
    var that = this;
    files.update({ _id: file._id }, { $set: { bookId: bookId } }, {}, function(error) {
      if(error){
        throw error;
        return;
      }
      that._processDelAndJump( index, file._id, () => {
        that.setState({
          listMenuOpen: false
        });
      });
    })
  }

  // copy file to other notebook
  _copyFile({file, index}, bookId) {
    var that = this;
    files.insert(Object.assign(
      {
        available: true,
        bookId: bookId
      },
      that._fileAttributes(file)
    ), (error, newFile) => {
      that.setState({
        listMenuOpen: false
      });
    });
  }

  dropdownMenuChange(event, index, value) {
    if(value == this.dropdownMenuValue())
      return;
    if(value == 'trash') {
      return hashHistory.push({
        pathname: '/notes',
        query: {
          available: false
        }
      });
    }
    if(value == 'all') {
      return hashHistory.push({
        pathname: '/notes',
        query: {
          available: true
        }
      });
    }
    let tmpBook = this.findBook(value);
    if(tmpBook)
      return hashHistory.push({
        pathname: '/notes',
        query: {
          bookId: tmpBook._id,
          bookName: tmpBook.name,
          available: true
        }
      });
  }

  dropdownMenuValue() {
    if(this.props.location.query.available == 'false') {
      return 'trash';
    }
    if(this.props.location.query.bookId) {
      return this.props.location.query.bookId;
    }
    return 'all';
  }

  render() {
    return (
      <div className='work-wrapper'>
        <div
          className='sec-sidebar'
          onContextMenu={(event) => {this.onContextMenu();}}
        >
          <FlatButton
            label={this.bookId() ? `NEW NOTE IN ${this.props.globalBook.name}` : 'NEW A BOOK First!!'}
            onClick={this.newAndCreateFile}
            primary={true}
            backgroundColor={this.bookId() ? 'rgba(255, 255, 255, 1)' : '#ddd'}
            style={{
              width: '295px',
              lineHeight: '40px',
              height: '42px',
              color: '#3d3d3d',
              border: '1px solid #ddd',
              position: 'fixed',
              zIndex: 100
            }}
          />
          <DropDownMenu
            value={this.dropdownMenuValue()}
            onChange={this.dropdownMenuChange}
            style={{
              zIndex: 100,
              marginTop: '43px',
              width: '294px',
              position: 'fixed',
              color: '#3d3d3d',
              border: '1px solid #ddd',
              backgroundColor: 'white',
              fontSize: '16px',
              lineHeight: '16px',
              textAlign: 'center'
            }}
            maxHeight={300}
          >
            {
              this._availableBooks().map((book) => {
                return (
                  <MenuItem
                    key={book._id}
                    value={book._id}
                    primaryText={book.name}
                  />
                )
              })
            }
            <Divider/>
            <MenuItem
              value='all'
              primaryText='All'
            />
            <MenuItem
              value='trash'
              primaryText='Trash'
            />
          </DropDownMenu>
          <FilesList
            files={this.props.files}
            query={this.props.location.query}
            onContextMenu={this.onContextMenu}
          />
        </div>
        <div className='work-pane'>
          {
            this.props.children && React.cloneElement(this.props.children, {
              currentFile: this.props.currentFile,
              editorState: this.props.editorState,
              setEditorState: this.props.setEditorState,
              available: this.props.location.query.available,
              callbacks: {
                onChangeContent: this.onChangeContent,
                onChangeTitle: this.onChangeTitle
              }
            })
          }
        </div>
        <ConfirmDialog
          cancelString='Cancel'
          okString='Ok'
          onCancel={this.onCancelConfirmationDialog}
          onOk={this.onOkConfirmationDialog}
          title= ''
          open={this.state.confirmationOpen}
          confirmString={this.state.confirmString}
          tmpData={this.state.confirmationTmpData}
        />
        <ListMenu
          cancelString='Cancel'
          okString='Ok'
          onCancel={this.listMenuCancel}
          onOk={this.listMenuOk}
          title=''
          open={this.state.listMenuOpen}
          dataList={this._availableBooks().map((book) => { return {name: book.name, id: book._id} })}
          dataItem={this.state.currentBookId}
          filterFunc={this.menuListFilter}
          tmpData={this.state.listMenuTmpData}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FilesContainer);
