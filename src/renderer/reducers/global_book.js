import constants from '../../constants';

const {
    SET_GLOBAL_BOOK,
} = constants;

export default function (state = {}, action) {
  switch (action.type) {
    case SET_GLOBAL_BOOK:
      return action.globalBook;
    default:
      return state;
  }
}
