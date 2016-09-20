import {
    combineReducers
} from 'redux';
import books from './books';
import activeBook from './active_book';
import histories from './histories';
import files from './files';
import activeFile from './active_file';
import globalBook from './global_book';
import editorState from './editor_state'

const reducers = combineReducers({
  books,
  activeBook,
  histories,
  files,
  activeFile,
  globalBook,
  editorState
});

export default reducers;
