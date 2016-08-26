import keyMirror from 'keymirror';
import path from 'path';

let constants = keyMirror({
  LIST_BOOKS: null,
  ADD_BOOK: null,
  DEL_BOOK: null,
  EDIT_BOOK: null,
  CONCAT_BOOKS: null,
  ACTIVE_BOOK: null,
  POP_HISTORY: null,
  PUSH_HISTORY: null,
  LIST_FILES: null,
  ADD_FILE: null,
  DEL_FILE: null,
  EDIT_FILE: null,
  CONCAT_FILES: null,
  ACTIVE_FILE: null,
  SET_GLOBAL_BOOK: null
});

constants.FILES_PATH = `${path.resolve(__dirname, '../files')}`;

export default constants;
