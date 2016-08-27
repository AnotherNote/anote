// use history array replace url history and url
import constants from '../../constants';
let {
    POP_HISTORY,
    PUSH_HISTORY
} = constants;

const defaultHome = {
  containerName: 'BooksContainer',
  props: {}
};

export default function(state = [defaultHome], action) {
  switch (action.type) {
    case PUSH_HISTORY:
      return [...state, action.history].slice(-10);
      break;
    case POP_HISTORY:
      return state.slice(0, state.length - 1);
      break;
    default:
      return state;
  }
}
