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
    activeBook
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

const mapStateToProps = (state) => {
  return {
    books: state.books,
    currentBook: state.activeBook
  }
}

const mapDispatchToProps = (dispatch) => {
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
    }
  }
}

class BooksContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editBook: {},
      bookDialogOpen: false,
      booksSearchText: null
    }
    this.debouncedChangeBooksSearchText = debounce(this.changeBooksSearchText, 200);
  }
  // hook method for fetch books
  componentDidMount() {
    // can write some fetch infos code
    let that = this;
    books.find({ available: true }).sort({ 'updatedAt': -1 }).exec((err, bks) => {
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
      });
    });
  }

  componentWillUnmount() {
    this.debouncedChangeBooksSearchText.cancel();
  }

  _newBook = (event) => {
    this.props.activeBook({ imagePath: 'avatar.jpeg', available: true });
    this.setState({
      bookDialogOpen: true
    });
  }

  editBook = (book) => {
    this.props.activeBook(book);
    this.setState({
      bookDialogOpen: true
    });
  }

  delBook = (book) => {
    var that = this;
    books.remove({_id: book._id}, function(error) {
      if(error){
        throw error;
        return;
      }
      that.props.delBook(book);
    });
  }

  closeBookFormDialog = () => {
    this.setState({
      bookDialogOpen: false
    });
  }

  submitBookFormDialog = (book) => {
    var that = this;
    if(!book._id){
      books.insert(that._bookAttributes(book), (error, newBook) => {
        if(error){
          throw error;
          return;
        }
        that.props.addBook(newBook);
        that.setState({
          bookDialogOpen: false
        });
      });
    }else{
      books.update({'_id': book._id}, that._bookAttributes(), {}, (error) => {
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

  _bookAttributes = (book) => {
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

  jumpToNotes = (obj) => {
    hashHistory.push(obj);
  }

  render() {
    return (
      <div>
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
        <BooksList books={this.props.books.filter((book) =>  {
          if(!this.state.booksSearchText || this.state.booksSearchText == '')
            return true;
          let patt = new RegExp(this.state.booksSearchText, 'i');
          return patt.test(book.name);
        })} callbacks={{ editBook: this.editBook, delBook: this.delBook, jumpToNotes: this.jumpToNotes }} />
        <BookForm
          book={this.props.currentBook}
          open={this.state.bookDialogOpen}
          onCancel={this.closeBookFormDialog}
          onOk={this.submitBookFormDialog}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BooksContainer);
