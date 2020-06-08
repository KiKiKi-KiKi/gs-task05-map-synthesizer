import { synthInit } from './synth';

let requestID;
let time;
const fps = 60;
const frameLength = 10;

function getTime() {
  time = (performance && performance.now()) || (new Date().getTime());
}

function animation(now = 0) {
  const elapsed = now - time;
  const frame = Math.floor((now - time) / (1000 / fps) % frameLength);
  console.log(elapsed, frame);
  if (elapsed > 200) {
    time = now;
  }
  requestID = requestAnimationFrame(animation);
};

export default function play() {
  time = getTime();
  requestID = requestAnimationFrame(animation);
}
