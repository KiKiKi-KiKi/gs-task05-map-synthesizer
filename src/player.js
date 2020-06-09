import { LNG_MAX, LAT_MAX, CANVAS_SCALE } from './config';
import { synthInit } from './synth';

export const SECTIONS = 4; // 4 章節 で演奏
export const MIN_BEAT = 64; // 64 分音符換算
const BASE_BEAT = 4; // BPMは4分音符換算なので
const MINUTES = 60 * 1000; // 1000
const CANVAS_WIDTH = LNG_MAX * 2 * CANVAS_SCALE;
const CANVAS_HEIGHT = LAT_MAX * CANVAS_SCALE;

function getTime() {
  return (performance && performance.now()) || new Date().getTime();
}

class Player {
  constructor(bpm = 180) {
    this.requestID = null;
    this.section = 0;
    this.que = 0;
    this._bpm = bpm;
    this.ctx = null;
  }

  set bpm(bpm) {
    this._bpm = bpm;
  }

  setCtx(ctx) {
    this.ctx = ctx;
  }

  drawPlayerLine({ section, beat }) {
    if (!this.ctx) {
      return;
    }
    const posBeat = section * MIN_BEAT + beat;
    const x = (posBeat * CANVAS_WIDTH) / (SECTIONS * MIN_BEAT);
    const ctx = this.ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CANVAS_HEIGHT);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#f74929';
    ctx.stroke();
    ctx.closePath();
  }

  reset() {
    this.time = null;
    this.requestID = null;
    this.section = 0;
    this.que = 0;
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
  }

  play(melody) {
    console.log('BPM', this._bpm);
    const synth = synthInit();
    const beatPar = MINUTES / ((this._bpm * MIN_BEAT) / BASE_BEAT);
    // console.log(beatPar, MINUTES, this._bpm);
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

      // update canvas
      this.drawPlayerLine({ section: this.section, beat: beat });

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

  pause() {
    const requestID = this.requestID;
    // already stop
    if (!requestID) {
      return;
    }
    cancelAnimationFrame(requestID);
    this.requestID = null;
  }

  stop() {
    this.pause();
    this.reset();
  }
}

export default Player;
