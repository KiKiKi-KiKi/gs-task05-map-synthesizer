import { Transport, FMSynth, PolySynth } from 'tone';

const TONES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const getIntegerDecimal = (num) => {
  const strNum = num.toString().split('.');
  const int = strNum[0] - 0;
  const decimal = '0.' + strNum[1] - 0;
  if (num < 0) {
    return [-int, -decimal];
  }
  return [int, decimal];
};

const getToneIndexByDecimal = (decimal) => {
  // decimal : x = 100 : 120
  const par = Math.abs(decimal) * 120;
  const pich = par === 0 ? 0 : Math.ceil(par / 10) - 1;
  return pich;
};

const getToneByDecimal = (decimal) => {
  const pich = getToneIndexByDecimal(decimal);
  return TONES[pich];
};

// Lng -180 < 0 < 180
const getToneIndexByLng = (lngInt) => {
  // 180 * 2 / 12 => 30
  if (lngInt === 0) {
    return 0;
  }
  const shiftLng = lngInt + 180; // [0..360];
  const par = Math.ceil(shiftLng / 30) - 1;
  return par;
};

const getToneByLng = (lngInt) => {
  const pich = getToneIndexByLng(lngInt);
  return TONES[pich];
};

// Lat -90 < 0 < 90
const getToneIndexByLat = (latInt) => {
  // 90 * 2 / 12 => 15
  if (latInt === 0) {
    return 0;
  }
  const shiftLat = latInt + 90; // [0..180];
  const par = Math.ceil(shiftLat / 15) - 1;
  return par;
};

const getToneByLat = (latInt) => {
  const pich = getToneIndexByLng(latInt);
  return TONES[pich];
};

export const getToneDataByLatLng = ({ lat, lng }) => {
  const [latInt, latDecimal] = getIntegerDecimal(lat);
  const [lngInt, lngDecimal] = getIntegerDecimal(lng);

  // convert Pich by Lat
  const basePich = Math.round(Math.abs(latInt / 90) * 10);
  const toneIndexs = [
    getToneIndexByDecimal(latDecimal),
    getToneIndexByDecimal(lngDecimal),
    getToneIndexByLng(lngInt),
  ];
  // sort は文字列として比較してしまうので、関数で数値で降順にする
  const toneKeys = [...new Set(toneIndexs)].sort((a, b) => a - b);
  const baseToneKey = toneKeys[0];
  console.log('tone keys', toneKeys, 'base', TONES[baseToneKey]);

  return {
    baseToneKey,
    toneKeys,
    basePich,
  };
};

export const convertToneByLatLng = ({ lat, lng }) => {
  const { toneKeys, basePich } = getToneDataByLatLng({ lat, lng });
  const tones = toneKeys.map((i) => TONES[i] + basePich);
  return tones;
};

let synth;

const setSynth = () => {
  if (synth) {
    return synth;
  }
  const fmSynth = new FMSynth().master;
  synth = new PolySynth(4, fmSynth, {
    oscillator: {
      type: 'square',
    },
  }).toMaster();

  return synth;
};

export const testSounde = (tones) => {
  const synth = setSynth();
  Transport.stop();
  synth.triggerAttackRelease(tones, '8n');
};

export const synthInit = () => setSynth();
