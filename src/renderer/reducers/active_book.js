import constants from '../../constants';
let {
    ACTIVE_BOOK
} = constants;

export default function (state={}, action){
  switch (action.type) {
    case ACTIVE_BOOK:
      return action.book;
      break;
    default:
      return state;
  }
}
