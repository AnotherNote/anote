import React, {
    Component
} from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import {
    connect
} from 'react-redux';
import {
    addBook,
    listBooks,
    delBook,
    editBook,
    concatBooks,
    activeBook,
    setGlobalBook
} from '../actions';
import {
    files,
    books,
    tags,
    infos
} from '../../main/set_db';
import BooksList from './books_list';
import BookForm from './book_form';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import DropZone from 'react-dropzone';
import TextField from 'material-ui/TextField';
import {
    debounce,
    pick
} from '../../util';
import {
    hashHistory
} from 'react-router';
import ConfirmDialog from './confirm_dialog';
import {
  openBookItemContextMenu,
  openNormalContextMenu
} from '../controllers/books_controller.js';
import {
  ipcRenderer
} from 'electron';

function mapStateToProps(state) {
  return {
    books: state.books,
    currentBook: state.activeBook,
    globalBook: state.globalBook
  }
}

function mapDispatchToProps(dispatch) {
  return {
    addBook: (book) => {
      dispatch(addBook(book));
    },
    listBooks: (books) => {
      dispatch(listBooks(books));
    },
    delBook: (book) => {
      dispatch(delBook(book));
    },
    editBook: (book) => {
      dispatch(editBook(book));
    },
    activeBook: (book) => {
      dispatch(activeBook(book));
    },
    setGlobalBook: (book) => {
      dispatch(setGlobalBook(book));
    }
  }
}

class BooksContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editBook: {},
      bookDialogOpen: false,
      booksSearchText: null,
      // for custom confirm dialog
      confirmationOpen: false,
      confirmString: '',
      confirmationTmpData: {}
    }
    this.debouncedChangeBooksSearchText = debounce(this.changeBooksSearchText, 200);
  }
  // hook method for fetch books
  componentDidMount() {
    // can write some fetch infos code
    let that = this;
    books.find({  }).sort({ 'updatedAt': -1 }).exec((err, bks) => {
      if(bks.length == 0)
        that.props.listBooks(bks);
      let tmpC = 0;
      bks.forEach((bk, index) => {
        files.count({bookId: bk._id, available: true}, (error, count) => {
          if(error){
            throw new Error('db error');
            return;
          }
          bk.filesCount = count;
          tmpC += 1;
          if(tmpC == bks.length)
            that.props.listBooks(bks);
        })
        let availableBooks = bks.filter((book) => {
          return book.available;
        });
        if(!that.props.globalBook._id && availableBooks.length > 0){
          that.props.setGlobalBook(
            {
              _id: availableBooks[0]._id,
              name: availableBooks[0].name
            }
          );
        }
      });
    });
    ipcRenderer.send('onNotebookContainer');
    this._checkNewNoteBookParam();
  }

  componentWillReceiveProps(newProps) {
    this._checkNewNoteBookParam(newProps);
  }

  _checkNewNoteBookParam(props) {
    props = props || this.props;
    if(props.location.query.newNoteBook == 'true'){
      // 保证只开一次新建的dialog
      this._delNewNoteBookParam();
      this._newBook();
    }
  }

  _delNewNoteBookParam() {
    hashHistory.replace({
      pathname: '/'
    });
  }

  componentWillUnmount() {
    this.debouncedChangeBooksSearchText.cancel();
  }

  _newBook(event) {
    this.props.activeBook({ imagePath: '', available: true });
    this.setState({
      bookDialogOpen: true
    });
  }

  editBook(book) {
    this.props.activeBook(book);
    this.setState({
      bookDialogOpen: true
    });
  }

  closeBookFormDialog() {
    this.setState({
      bookDialogOpen: false
    });
  }

  submitBookFormDialog(book) {
    var that = this;
    if(!book._id){
      books.insert(that._bookAttributes(book), (error, newBook) => {
        if(error){
          throw error;
          return;
        }
        that.props.addBook(Object.assign({}, newBook, {filesCount: 0}));
        that.setState({
          bookDialogOpen: false
        });
        if(!that.props.globalBook._id){
          that.props.setGlobalBook(
            {
              _id: newBook._id,
              name: newBook.name
            }
          );
        }
      });
    }else{
      books.update({'_id': book._id}, that._bookAttributes(book), {}, (error) => {
        if(error){
          throw error;
          return;
        }
        that.props.editBook(book);
        that.setState({
          bookDialogOpen: false
        });
      });
    }
  }

  _bookAttributes(book) {
    return pick(book, 'imagePath', 'available', 'name');
  }

  changeBooksSearchText = (event)=> {
    this.setState({
      booksSearchText: event.target.value
    });
  }

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  jumpToNotes(obj) {
    hashHistory.push(obj);
  }

  delBook(book) {
    this.setState({
      confirmationOpen: true,
      confirmString: `Are you sure you want to delete the notebook '${book.name}' all notes to trash`,
      confirmationTmpData: {bookId: book._id, book: book}
    });
  }

  onCancelConfirmationDialog() {
    this.setState({
      confirmationOpen: false
    });
  }

  onOkConfirmationDialog(event, tmpData) {
    let that = this;
    books.update({_id: tmpData.bookId}, {$set: {available: false}}, {}, function(error) {
      if(error){
        throw error;
        return;
      }
      that.props.editBook(Object.assign({}, tmpData.book, {available: false}));
      if(that.props.globalBook._id == tmpData.bookId) {
        that.props.setGlobalBook({});
      }
      files.update({ bookId: tmpData.bookId }, { $set: { available: false } }, { multi: true }, (error) => {
        if(error){
          throw error;
          return;
        }
        that.setState({
          confirmationOpen: false
        });
      });
    });
  }

  onContextMenu(event, book) {
    var that = this;
    openBookItemContextMenu({
      editBook: () => {
        that.editBook(book);
      },
      deleteBook: () => {
        that.delBook(book);
      },
      newBook: () => {
        that._newBook();
      }
    });
  }

  onNormalContextMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    var that = this;
    openNormalContextMenu({
      newBook: () => {
        that._newBook();
      }
    });
  }

  availableBooks() {
    return this.props.books.filter((book) => {
      return book.available;
    });
  }

  unavailableBooks() {
    return this.props.books.filter((book) => {
      return !book.available;
    });
  }

  render() {
    return (
      <div
        onContextMenu={this.onNormalContextMenu}
        style={{
          height: '100%',
          width: '100%'
        }}
      >
        <FloatingActionButton style={{ position: 'fixed', bottom: '10px', right: '10px', zIndex: 1000 }} onClick={this._newBook}>
          <ContentAdd />
        </FloatingActionButton>
        <div>
          <TextField
            hintText="Search a notebook"
            style={{ marginLeft: '10px' }}
            defaultValue={this.state.booksSearchText}
            onChange={(event) => {event.persist();this.debouncedChangeBooksSearchText(event)}}
            />
        </div>
        <BooksList
          books={this.availableBooks().filter((book) =>  {
            if(!this.state.booksSearchText || this.state.booksSearchText == '')
              return true;
              let patt = new RegExp(this.state.booksSearchText, 'i');
              return patt.test(book.name);
          })}
          callbacks={{
            editBook: this.editBook,
            delBook: this.delBook,
            jumpToNotes: this.jumpToNotes,
            onContextMenu: this.onContextMenu
          }}
        />
        <BookForm
          book={this.props.currentBook}
          open={this.state.bookDialogOpen}
          onCancel={this.closeBookFormDialog}
          onOk={this.submitBookFormDialog}
        />
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

export default connect(mapStateToProps, mapDispatchToProps)(BooksContainer);
