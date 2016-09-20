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
  SET_GLOBAL_BOOK: null,
  SET_EDITOR_STATE: null
});

constants.HOME_PATH = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
constants.FILES_PATH = `${path.resolve(constants.HOME_PATH, './anote/files')}`;
constants.DB_PATH = `${path.resolve(constants.HOME_PATH, './anote/dbs')}`;
constants.TMP_FILES_PATH = `${path.resolve(constants.HOME_PATH, './anote/tmp_files')}`;
constants.TMP_IMAGE_PATH = `${path.resolve(__dirname, '../tmp/tmp.jpeg')}`;

export default constants;
