import constants from '../../constants';
import {
    findIndexById
} from '../../util'
let {
    LIST_BOOKS,
    ADD_BOOK,
    DEL_BOOK,
    EDIT_BOOK,
    CONCAT_BOOKS
} = constants;

export default function (state=[], action) {
  switch (action.type) {
    case LIST_BOOKS:
      return action.books
      break;
    case ADD_BOOK:
      return [action.book, ...state];
      break;
    case DEL_BOOK:
      let tI = findIndexById(state, action.book);
      return [
        ...state.slice(0, tI),
        ...state.slice(tI+1)
      ];
      break;
    case EDIT_BOOK:
      let tIn = findIndexById(state, action.book);
      return [
        action.book,
        ...state.slice(0, tIn),
        ...state.slice(tIn+1)
      ]
      break;
    case CONCAT_BOOKS:
      return [
        ...state,
        ...action.books
      ];
      break;
    default:
      return state;
  }
}
