import { synthInit } from './synth';

export const SECTIONS = 4; // 4 章節 で演奏
export const MIN_BEAT = 64; // 64 分音符換算
const BASE_BEAT = 4; // BPMは4分音符換算なので
const MINUTES = 60 * 1000; // 1000

function getTime() {
  return (performance && performance.now()) || new Date().getTime();
}

class Player {
  constructor(bpm = 180) {
    this.requestID = null;
    this.section = 0;
    this.que = 0;
    this._bpm = bpm;
  }

  set bpm(bpm) {
    this._bpm = bpm;
  }

  reset() {
    this.time = null;
    this.requestID = null;
    this.section = 0;
    this.que = 0;
  }

  play(melody) {
    console.log('BPM', this._bpm);
    const synth = synthInit();
    const beatPar = MINUTES / ((this._bpm * MIN_BEAT) / BASE_BEAT);
    console.log(beatPar, MINUTES, this._bpm);
    this.time = getTime();

    const loop = (now = 0) => {
      if (this.section >= SECTIONS) {
        this.reset();
        console.log('LOOP END');
        this.time = getTime();
        this.requestID = requestAnimationFrame(loop);
        return;
      }
      const note = melody[this.que];
      const [triggerSection, triggerBeat] = note ? note.time : [null, null];
      const elapsed = now - this.time;
      const beat = Math.floor(elapsed / beatPar);
      // console.log(this.section, beat, note);

      if (triggerSection === this.section && triggerBeat <= beat) {
        // sound
        synth.triggerAttackRelease(
          note.code,
          note.duration,
          undefined,
          note.velocity,
        );
        this.que += 1;
      }

      if (beat >= MIN_BEAT) {
        this.time = now;
        this.section += 1;
      }
      this.requestID = requestAnimationFrame(loop);
    };

    this.requestID = requestAnimationFrame(loop);
  }

  stop() {
    const requestID = this.requestID;
    // already stop
    if (!requestID) {
      return;
    }

    cancelAnimationFrame(requestID);
    this.requestID = null;
  }
}

export default Player;
