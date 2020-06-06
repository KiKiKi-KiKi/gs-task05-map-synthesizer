import React, {
  useContext,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { getColorByLat, LAT_MAX, LNG_MAX } from '../config';
import {
  convertPosition,
  convertLng,
  getPositionDistance,
  getMaxDistance,
} from '../geoUtils';
import { getVolumeByWind } from '../synth';
import MapContext from '../contexts/MapContext';

const MELODY_TIME = 8 * 60 * 60;
const PI2 = Math.PI * 2;
const CANVAS_WIDTH = LNG_MAX * 2;
const CANVAS_HEIGHT = LAT_MAX;
const SCALE = 10;

const canvasInit = (ctx) => {
  ctx.canvas.width = CANVAS_WIDTH * SCALE;
  ctx.canvas.height = CANVAS_HEIGHT * SCALE;
  return ctx;
};

const mappingMarkers = (ctx) => (markers) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  markers.forEach((marker) => {
    const [x, y] = marker.position;
    const r = marker.melody.velocity * 2;

    ctx.fillStyle = getColorByLat(y);
    ctx.beginPath();
    ctx.arc(x * 10, y * 10, r * 10, 0, PI2);
    ctx.fill();
  });
};

export default function SoundMap() {
  const { markers } = useContext(MapContext);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const getCanvas = useCallback(() => ctxRef.current, [canvasRef]);

  // marker を lng 順に並べる
  const soundMap = useMemo(() => {
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

    console.log(distanceList);

    return distanceList.map((marker) => {
      const code = marker.code;
      const position = convertPosition(marker.position);
      const volume = getVolumeByWind(marker.weather);

      // 単音
      if (!maxDistance) {
        return {
          id: marker.id,
          melody: {
            time: '1:0:0',
            note: code,
            duration: '8n',
            velocity: volume,
          },
          position,
          distance: 0,
        };
      }

      // TODO: generate time & duration by pos & distance

      return {
        id: marker.id,
        melody: {
          time: '1:0:0',
          note: code,
          duration: '8n',
          velocity: volume,
        },
        position,
        distance: 0,
      };
    });
  }, [markers]);

  console.log('sorted', soundMap);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctxRef.current = canvasInit(ctx);
  }, []);

  useEffect(() => {
    // mapping marker to canvas
    mappingMarkers(getCanvas())(soundMap);
  }, [soundMap, getCanvas]);

  return (
    <>
      <div className="sound-map">
        <canvas className="sound-map-canvas" ref={canvasRef}></canvas>
      </div>
    </>
  );
}
