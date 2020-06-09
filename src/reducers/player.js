import { PLAY, STOP, PAUSE } from '../actions/player';
import { default as soundDispatch } from '../dispatchers/sound';

export const INITIAL_STATE = {
  isPlay: false,
};

const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case PLAY: {
      soundDispatch({ type: PLAY, melody: action.melody });
      return {
        ...state,
        isPlay: true,
      };
    }
    case STOP: {
      soundDispatch({ type: STOP });
      return {
        ...state,
        isPlay: false,
      };
    }
    case PAUSE: {
      soundDispatch({ type: PAUSE });
      return {
        ...state,
        isPlay: false,
      };
    }
    default: {
      return state;
    }
  }
};

export default reducer;
