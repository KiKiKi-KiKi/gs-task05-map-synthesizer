import { Transport, FMSynth, PolySynth } from "tone";

const TONES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const getIntegerDecimal = (num) => {
  const strNum = num.toString().split('.');
  const int = strNum[0] - 0;
  const decimal = ('0.' + strNum[1]) - 0;
  if (num < 0) {
    return [-int, -decimal];
  }
  return [int, decimal];
};

const getToneToDecimal = (decimal) => {
  // decimal : x = 100 : 120
  const par = Math.abs(decimal) * 120;
  const pich = par === 0 ? 0 : Math.ceil(par / 10) - 1;
  return TONES[pich];
};

// Lng -180 < 0 < 180
const getToneToLng = (lngInit) => {
  // 180 * 2 / 12 => 30
  if (lngInit === 0) {
    return TONES[0];
  }

  const shiftLng = lngInit + 180; // [0..360];
  const par = Math.ceil(shiftLng / 30) - 1;
  return TONES[par];
}

export const convertToneToLatLng = (lat, lng) => {
  const [latInit, latDecimal] = getIntegerDecimal(lat);
  const [lngInit, lngDecimal] = getIntegerDecimal(lng);

  const basePich = Math.round(Math.abs(latInit / 90) * 10);
  const latTone = getToneToDecimal(latDecimal);
  const lngTone = getToneToDecimal(lngDecimal);
  const lngTone2 = getToneToLng(lngInit);

  return [latTone + basePich, lngTone + basePich, lngTone2 + basePich];
};

let synth;

const setSynth = () => {
  if (synth) {
    return synth;
  }
  const fmSynth = new FMSynth().master;
  synth = new PolySynth(4, fmSynth, {
    oscillator: {
      type: "square"
    }
  }).toMaster();

  return synth;
}

export const testTone = (tones) => {
  const synth = setSynth();
  Transport.stop();
  synth.triggerAttackRelease(tones, '8n');
}

export const synthInit = () => setSynth();
