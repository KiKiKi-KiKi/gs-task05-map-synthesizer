import { SOUND, PLAY, STOP } from '../actions/sound';
import { synthInit, onPlayMusic, onStopMusic } from '../synth';

const soundDispatcher = (action) => {
  const synth = synthInit();

  switch (action.type) {
    case SOUND: {
      return synth.triggerAttackRelease(action.code, '8n');
    }
    case PLAY: {
      console.log(action.melody);
      onPlayMusic(action.melody);
      return;
    }
    case STOP: {
      onStopMusic();
      return;
    }
    default: {
      return;
    }
  }
};
export default soundDispatcher;
