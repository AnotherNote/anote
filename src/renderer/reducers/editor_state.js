import constants from '../../constants';
let { SET_EDITOR_STATE } = constants;

export default function (state=0, action) {
  switch (action.type) {
    case SET_EDITOR_STATE:
      return action.state;
      break;
    default:
      return state;
  }
}
