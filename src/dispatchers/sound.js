import { SOUND } from '../actions/sound';
import { PLAY, STOP, PAUSE, SET_CANVAS } from '../actions/player';
import { synthInit } from '../synth';
import Player from '../player';

const player = new Player();

const soundDispatcher = (action) => {
  const synth = synthInit();

  switch (action.type) {
    case SOUND: {
      return synth.triggerAttackRelease(action.code, '8n');
    }
    case PLAY: {
      console.log('PLAY', action.melody);
      player.play(action.melody);
      return;
    }
    case STOP: {
      player.stop();
      return;
    }
    case PAUSE: {
      player.pause();
      return;
    }
    // TODO: 暫定対応
    case SET_CANVAS: {
      player.setCtx(action.canvas);
      return;
    }
    default: {
      return;
    }
  }
};
export default soundDispatcher;
