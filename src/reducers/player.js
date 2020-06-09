import { PLAY, STOP, PAUSE, SET_CANVAS } from '../actions/player';
import { default as soundDispatch } from '../dispatchers/sound';

export const INITIAL_STATE = {
  isPlay: false,
  canvas: null,
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
    // TODO: 暫定対応
    case SET_CANVAS: {
      soundDispatch({ type: SET_CANVAS, canvas: action.canvas });
      return {
        ...state,
        canvas: action.canvas,
      };
    }
    default: {
      return state;
    }
  }
};

export default reducer;
