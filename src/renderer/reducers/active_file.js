import constants from '../../constants';

const {
    ACTIVE_FILE,
} = constants;

export default function (state = {}, action) {
  switch (action.type) {
    case ACTIVE_FILE:
      return action.file;
    default:
      return state;
  }
}
