import constants from '../../constants';
import {
    findIndexById,
} from '../../util';

const {
  LIST_FILES,
  ADD_FILE,
  DEL_FILE,
  EDIT_FILE, CONCAT_FILES,
} = constants;

export default function (state = [], action) {
  switch (action.type) {
    case LIST_FILES:
      return action.files;
    case ADD_FILE:
      return [
        action.file,
        ...state,
      ];
    case DEL_FILE:
      const tI = findIndexById(state, action.file);
      return [
        ...state.slice(0, tI),
        ...state.slice(tI + 1),
      ];
    case EDIT_FILE:
      const tIn = findIndexById(state, action.file);
      return [
        action.file,
        ...state.slice(0, tIn),
        ...state.slice(tIn + 1),
      ];
    case CONCAT_FILES:
      return [
        ...state,
        ...action.files,
      ];
    default:
      return state;
  }
}
