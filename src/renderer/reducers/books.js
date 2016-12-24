import constants from '../../constants';
import {
    findIndexById,
} from '../../util';

const {
    LIST_BOOKS,
    ADD_BOOK,
    DEL_BOOK,
    EDIT_BOOK,
    CONCAT_BOOKS,
} = constants;

export default function (state = [], action) {
  switch (action.type) {
    case LIST_BOOKS:
      return action.books;
    case ADD_BOOK:
      return [action.book, ...state];
    case DEL_BOOK:
      const tI = findIndexById(state, action.book);
      return [
        ...state.slice(0, tI),
        ...state.slice(tI + 1),
      ];
    case EDIT_BOOK:
      const tIn = findIndexById(state, action.book);
      return [
        action.book,
        ...state.slice(0, tIn),
        ...state.slice(tIn + 1),
      ];
    case CONCAT_BOOKS:
      return [
        ...state,
        ...action.books,
      ];
    default:
      return state;
  }
}
