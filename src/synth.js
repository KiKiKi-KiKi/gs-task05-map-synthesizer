import { Transport, FMSynth, PolySynth, Part } from 'tone';

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
  const basePitch = Math.round(Math.abs(latInt / 90) * 10);
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
    basePitch,
  };
};

export const getCodeByToneKeys = ({ toneKeys, basePitch }) => {
  return toneKeys.map((i) => TONES[i] + basePitch);
};

export const convertToneByLatLng = ({ lat, lng }) => {
  return getCodeByToneKeys(getToneDataByLatLng({ lat, lng }));
};

const getTonePitch = (tone, pitch) => {
  const toneLen = TONES.length;
  if (tone > toneLen - 1) {
    return [tone - toneLen, pitch + 1];
  }
  return [tone, pitch];
};

/*
  +4 ... 3音
  +7 ... 5音
  sunny   -> メジャー 長３
  cloudy  -> マイナー 短3
  rain    -> aug 5音半音上げ
  thunder -> dim ５音半音下げ
  snow    -> sus4 3音半音上げ
  mist    -> sus4
*/
const getToneByWeathrt = ({ weatherType, baseToneKey, basePitch }) => {
  let toneIndex;
  switch (weatherType) {
    case 'sunny': {
      console.log(weatherType, 'Major 3');
      toneIndex = baseToneKey + 4;
      break;
    }
    case 'cloudy': {
      console.log(weatherType, 'minor 3');
      toneIndex = baseToneKey + 3;
      break;
    }
    case 'rain': {
      console.log(weatherType, 'aug');
      toneIndex = baseToneKey + 8;
      break;
    }
    case 'thunder': {
      console.log(weatherType, 'dim');
      toneIndex = baseToneKey + 6;
      break;
    }
    case 'snow':
    case 'mist': {
      console.log(weatherType, 'sus4');
      toneIndex = baseToneKey + 5;
      break;
    }
    default: {
      return null;
    }
  }

  const [tone, pitch] = getTonePitch(toneIndex, basePitch);
  return `${TONES[tone]}${pitch}`;
};

/*
  deg 0-90    ... m7 短7
  deg 180-270 ... M7 長7
  deg 90-180  ... 6  長6
  deg 270-360 ... m6 短6
  */
const getToneByWind = ({ deg, speed, baseToneKey, basePitch }) => {
  if (speed < 1.5) {
    return null;
  }
  let toneIndex;
  if (deg < 90) {
    console.log(`wind ${deg}`, 'm7');
    toneIndex = baseToneKey + 11;
  } else if (deg < 180) {
    console.log(`wind ${deg}`, 'M6');
    toneIndex = baseToneKey + 9;
  } else if (deg < 270) {
    console.log(`wind ${deg}`, 'M7');
    toneIndex = baseToneKey + 10;
  } else {
    console.log(`wind ${deg}`, 'm6');
    toneIndex = baseToneKey + 8;
  }
  const [tone, pitch] = getTonePitch(toneIndex, basePitch);
  return `${TONES[tone]}${pitch}`;
};

export const convertWeatherToTone = ({
  weatherType,
  wind,
  baseToneKey,
  basePitch,
}) => {
  const weatherTone = getToneByWeathrt({ weatherType, baseToneKey, basePitch });
  const windTone = getToneByWind({ ...wind, baseToneKey, basePitch });
  console.log('weatherTones:', [weatherTone, windTone]);
  return [weatherTone, windTone].filter(Boolean);
};

// wind speed -> volume
const MAX_VOLUME_WIND_SPEED = 10;
export const getVolumeByWind = (weather) => {
  if (!weather || !weather.wind) {
    return 1;
  }

  const windSpeed = weather.wind.speed;

  if (windSpeed > MAX_VOLUME_WIND_SPEED) {
    return 1;
  }

  return Math.floor((windSpeed / MAX_VOLUME_WIND_SPEED) * 100) / 100;
};

let synth;

const setSynth = () => {
  if (synth) {
    return synth;
  }
  const fmSynth = new FMSynth().master;
  synth = new PolySynth(5, fmSynth, {
    oscillator: {
      type: 'square',
    },
  }).toMaster();

  return synth;
};

export const testSounde = (code) => {
  const synth = setSynth();
  Transport.stop();
  // code, time, velocity
  synth.triggerAttackRelease(code, '8n', undefined, 0.5);
};

export const synthInit = () => setSynth();

// Player
const DEFAULT_BPM = 1600;

export const onPlayMusic = (melody) => {
  console.log('onPlayMusic', melody);
  const synth = setSynth();

  function setPlay(time, note) {
    console.log(time, note);
    synth.triggerAttackRelease(note.note, note.duration, time, note.velocity);
  }

  const player = new Part(setPlay, melody);
  player.start(0);

  // infinity loop
  //player.loop = true;
  //player.loopStart = 0;
  //player.loopEnd = '8:00:00';

  Transport.bpm.value = DEFAULT_BPM;
  Transport.start();
};

export const onStopMusic = () => {
  Transport.stop();
  Transport.cancel();
};
