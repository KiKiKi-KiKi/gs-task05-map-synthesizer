import { SET_MELODY } from '../actions/melody';

const reducer = (state = [], action) => {
  switch (action.type) {
    case SET_MELODY: {
      return action.melody;
    }
    default: {
      return state;
    }
  }
};

export default reducer;
