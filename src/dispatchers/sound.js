import { SOUND } from '../actions/sound';
import { synthInit } from '../synth';

const soundDispatcher = (action) => {
  const synth = synthInit();

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
