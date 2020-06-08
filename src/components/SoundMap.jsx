import React, {
  useContext,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { getColorByLat, LAT_MAX, LNG_MAX } from '../config';
import { zeroPadding } from '../utils';
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

const SECTIONS = 8; // 8 章節
const BEAT = 64; // 64 分音符換算
const SECTION_PAR_POS = (LNG_MAX * 2) / SECTIONS; // 1 楽章辺りの長さ

const getSectionBeetByLng = (x) => {
  const section = Math.floor(x / SECTION_PAR_POS);
  const beatPost = Math.round(
    ((x - section * SECTION_PAR_POS) * BEAT) / SECTION_PAR_POS,
  );
  return [section, beatPost];
};

const canvasInit = (ctx) => {
  ctx.canvas.width = CANVAS_WIDTH * SCALE;
  ctx.canvas.height = CANVAS_HEIGHT * SCALE;
  return ctx;
};

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
    const maxDistance = getMaxDistance(sorted);
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

    const soundMap = distanceList.map((marker) => {
      const code = marker.code;
      const position = convertPosition(marker.position);
      const volume = getVolumeByWind(marker.weather);

      const time = getSectionBeetByLng(position[0]);
      // TODO: generate duration by distance
      const duration = !marker.distance ? '8n' : '32n';

      return {
        id: marker.id,
        melody: {
          time: time,
          note: code,
          duration: duration,
          velocity: volume,
        },
        position,
        distance: marker.distance || 0,
      };
    });

    return soundMap;
  }, [markers]);

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

  console.log('sorted', soundMap, melodyLine);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctxRef.current = canvasInit(ctx);
  }, []);

  useEffect(() => {
    // mapping marker to canvas
    mappingMarkers(getCanvas())(soundMap);

    dispatch({ type: SET_MELODY, melody: melodyLine });
  }, [soundMap, melodyLine, getCanvas, dispatch]);

  return (
    <>
      <div className="sound-map">
        <canvas className="sound-map-canvas" ref={canvasRef}></canvas>
      </div>
    </>
  );
}
