import { SOUND } from '../actions/sound';
import { PLAY, STOP } from '../actions/player';
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
    default: {
      return;
    }
  }
};
export default soundDispatcher;
