import { synthInit } from './synth';

let requestID;
let time;
let section = 0;
const minBeat = 16; // 16分音符でカウント
const beatBase = 4; // 4分音符
const bpm = 120;
const m = 60 * 1000;

function getTime() {
  return (performance && performance.now()) || (new Date().getTime());
}

function animation(now = 0) {
  if (section >= 4) { return; }
  const elapsed = now - time;
  const beat = Math.floor(elapsed / (m / (bpm * minBeat / beatBase)));
  console.log(section, beat);
  if (beat >= minBeat) {
    time = now;
    section += 1;
  }
  requestID = requestAnimationFrame(animation);
}

export default function play() {
  section = 0;
  time = getTime();
  requestID = requestAnimationFrame(animation);
}
