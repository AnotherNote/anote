import constants from '../../constants';
let {
    ACTIVE_FILE
} = constants;

export default function(state = {}, action) {
    switch (action.type) {
        case ACTIVE_FILE:
            return action.file;
            break;
        default:
            return state;
    }
}
