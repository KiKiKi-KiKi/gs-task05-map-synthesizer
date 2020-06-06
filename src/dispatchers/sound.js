import { SOUND } from '../actions/sound';
import { synthInit } from '../synth';

const synth = synthInit();

const soundDispatcher = (action) => {
  switch (action.type) {
    case SOUND: {
      return synth.triggerAttackRelease(action.code, '8n');
    }
    default: {
      return;
    }
  }
};
export default soundDispatcher;
