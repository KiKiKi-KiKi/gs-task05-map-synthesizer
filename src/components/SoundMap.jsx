import React, {
  useContext,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { getColorByLat, LAT_MAX, LNG_MAX } from '../config';
import { SECTIONS, MIN_BEAT as BEAT } from '../player';
import {
  convertPosition,
  convertLng,
  getPositionDistance,
  getMaxDistance,
} from '../geoUtils';
import MelodyContext from '../contexts/MelodyContext';
import { SET_MELODY } from '../actions/melody';
import { getVolumeByWind } from '../synth';
import MapContext from '../contexts/MapContext';

const PI2 = Math.PI * 2;
const CANVAS_WIDTH = LNG_MAX * 2;
const CANVAS_HEIGHT = LAT_MAX;
const SCALE = 10;

/*
import { zeroPadding } from '../utils';
const MM = 60 * 60;
const MELODY_TIME = 8 * MM;

const zeroPaddingXX = zeroPadding(2);

const getTimeByLng = (x) => {
  const time = (x * MELODY_TIME) / CANVAS_WIDTH;
  const _m = time % MM;
  const m = Math.floor(time / MM);
  const ss = zeroPaddingXX(Math.round(_m % 60));
  const s = zeroPaddingXX(Math.floor(_m / 60));
  return `${m}:${s}:${ss}`;
};
*/

const SECTION_PAR_POS = CANVAS_WIDTH / SECTIONS; // 1 楽章辺りの長さ

const getSectionBeetByLng = (x) => {
  const section = Math.floor(x / SECTION_PAR_POS);
  const beatPost = Math.round(
    ((x - section * SECTION_PAR_POS) * BEAT) / SECTION_PAR_POS,
  );
  return [section, beatPost];
};

// x の位置を最大距離換算で変換する
const convertXtoMaxDistance = (maxDistance, firstPosition) => {
  const margin = maxDistance / SECTIONS / 8;
  const adjustMax = maxDistance + margin * 2;
  const lngMax = LNG_MAX * 2;
  const max = adjustMax > lngMax ? lngMax : adjustMax;
  const startX = adjustMax > lngMax ? 0 : firstPosition - margin;
  return (x) => {
    return ((x - startX) * lngMax) / max;
  };
};

// TODO: 後できれいな再帰計算にする・関数のあるべき場所はココではない
const convertBEARtoBEATString = (beats) => {
  let par = BEAT;
  // 全音符
  let note = Math.round((beats / par) * 10) / 10;
  if (note > 1) {
    if (note < 1.5) {
      return `${Math.floor(note)}m`;
    }
    return `${Math.floor(note)}m.`;
  }
  // 2分音符
  par = par / 2;
  note = Math.floor((beats / par) * 10) / 10;
  if (note > 1) {
    if (note < 1.5) {
      return '2n';
    }
    return '2n.';
  }
  // 4分音符
  par = par / 2;
  note = Math.floor((beats / par) * 10) / 10;
  if (note > 1) {
    if (note < 1.5) {
      return '4n';
    }
    return '4n.';
  }
  // 8分音符
  par = par / 2;
  note = Math.floor((beats / par) * 10) / 10;
  if (note > 1) {
    if (note < 1.5) {
      return '8n';
    }
    return '8n.';
  }
  // 16部音符
  par = par / 2;
  note = Math.floor((beats / par) * 10) / 10;
  if (note > 1) {
    if (note < 1.5) {
      return '16n';
    }
    return '16n.';
  }
  // 36部音符
  par = par / 2;
  note = Math.floor((beats / par) * 10) / 10;
  if (note > 1) {
    if (note < 1.5) {
      return '36n';
    }
    return '36n.';
  }
  // 64分音符
  par = par / 2;
  note = Math.floor((beats / par) * 10) / 10;
  if (note >= 1.5) {
    return '64n.';
  }
  return '64n';
};

// 距離を 音符の長さに変換する
const convertDisttoBeatLength = (maxDistance) => {
  const beatNum = SECTIONS * BEAT; // 楽章全体の拍数
  console.log('BEATNUM', maxDistance, beatNum);
  return (dist) => {
    // BEAT の 数
    const beatLength = dist * beatNum / maxDistance;
    // console.log(beatLength, convertBEARtoBEATString(beatLength));
    return convertBEARtoBEATString(beatLength);
  }
}

const canvasInit = (ctx) => {
  ctx.canvas.width = CANVAS_WIDTH * SCALE;
  ctx.canvas.height = CANVAS_HEIGHT * SCALE;
  return ctx;
};

// Draw point to canvas
const mappingMarkers = (ctx) => (markers) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  markers.forEach((marker) => {
    const [x, y] = marker.position;
    const r = marker.melody.velocity * 4;

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = getColorByLat(y);
    ctx.beginPath();
    ctx.arc(x * 10, y * 10, r * 20, 0, PI2);
    ctx.fill();
  });
};

export default function SoundMap() {
  const { markers } = useContext(MapContext);
  const { dispatch } = useContext(MelodyContext);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const getCanvas = useCallback(() => ctxRef.current, []);

  // marker を lng 順に並べる
  const soundMap = useMemo(() => {
    if (!markers.length) {
      return [];
    }

    const list = [...markers];
    const sorted = list.sort((a, b) => {
      // longitude is [-180 ... 180] shift [0 ... 360]
      const posA = convertLng(a.position.lng);
      const posB = convertLng(b.position.lng);
      return posA - posB;
    });

    // 始点と終点の距離
    const maxDistance = getMaxDistance(sorted) || CANVAS_WIDTH;
    console.log('MacDistance', maxDistance);

    const distanceList = sorted.reduce((arr, marker) => {
      const _marker = { ...marker };
      if (!arr.length) {
        return [_marker];
      }

      const prevMarker = { ...arr.pop() };
      const prevPos = prevMarker.position;
      const thisPos = _marker.position;
      const distance = getPositionDistance(prevPos, thisPos);

      prevMarker.distance = distance;
      prevMarker.distancePar = Math.round((distance * 100) / maxDistance);

      return [...arr, prevMarker, _marker];
    }, []);

    // console.log(distanceList);

    const convertPosX = convertXtoMaxDistance(
      maxDistance,
      sorted[0].position.lng,
    );

    const getBeatLength = convertDisttoBeatLength(maxDistance);

    const soundMap = distanceList.map((marker) => {
      const code = marker.code;
      const [x, y] = convertPosition(marker.position);
      const adjustX = convertPosX(x);
      const volume = getVolumeByWind(marker.weather);

      const time = getSectionBeetByLng(adjustX);
      // TODO: generate duration by distance
      const duration = !marker.distance ? '8n' : getBeatLength(marker.distance);

      return {
        id: marker.id,
        melody: {
          time: time,
          code: code,
          duration: duration,
          velocity: volume,
        },
        _position: [x, y],
        position: [adjustX, y],
        distance: marker.distance || 0,
      };
    });

    return soundMap;
  }, [markers]);
  /*
  const melodyLine = useMemo(() => {
    return soundMap.reduce((arr, data) => {
      const note = { ...data.melody };
      const [section, beat] = note.time;

      if (!arr[section]) {
        arr[section] = [];
      }

      if (!arr[section][beat]) {
        arr[section][beat] = note;
      } else {
        let next = beat + 1;
        let nextSection = section;

        while (true) {
          if (section >= SECTIONS && next > BEAT) {
            console.warn('not in sections', section, next, note);
            break;
          }

          if (next > BEAT) {
            next = next - BEAT;
            nextSection += 1;
            if (!arr[nextSection]) {
              arr[nextSection] = [];
            }
          }

          if (!arr[nextSection][next]) {
            arr[nextSection][next] = note;
            break;
          }

          next += 1;
        }
      }

      return arr;
    }, []);
  }, [soundMap]);
  */
  console.log('sorted', soundMap);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctxRef.current = canvasInit(ctx);
  }, []);

  useEffect(() => {
    // mapping marker to canvas
    mappingMarkers(getCanvas())(soundMap);

    const melodyLine = soundMap.map((data) => data.melody);
    dispatch({ type: SET_MELODY, melody: melodyLine });
  }, [soundMap, getCanvas, dispatch]);

  return (
    <>
      <div className="sound-map">
        <canvas className="sound-map-canvas" ref={canvasRef}></canvas>
      </div>
    </>
  );
}
