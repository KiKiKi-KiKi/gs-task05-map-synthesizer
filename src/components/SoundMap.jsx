import React, { useContext, useMemo } from 'react';
import MapContext from '../contexts/MapContext';

const convertLng = (lng) => {
  if (lng > 0) {
    return lng;
  }
  return 180 * 2 + lng;
};

const convertLant = (lat) => {
  if (lat > 0) {
    return lat;
  }
  return 90 * 2 + lat;
};

const POINT = 1000;

// return [x, y];
const convertPosition = ({ lat, lng }) => {
  const x = Math.round(convertLng(lng) * POINT) / POINT;
  const y = Math.round(convertLant(lat) * POINT) / POINT;
  return [x, y];
}

// 座標から２点間の距離を計算する
const getPositionDistance = (pos1, pos2) => {
  return Math.round(
    Math.sqrt(
      (pos2.lat - pos1.lat) ** 2 +
      (convertLng(pos2.lng) - convertLng(pos1.lng)) ** 2,
    ),
  );
};

const getMaxDistance = (markers) => {
  const len = markers.length;
  if (len < 2) {
    return null;
  }
  const firstPos = markers[0].position;
  const endPos = markers[len - 1].position;
  console.log(markers[0].id, markers[len - 1].id);
  return getPositionDistance(firstPos, endPos);
};

const getVolumeByWind = (weather) => {
  if (!weather || !weather.wind) {
    return 1;
  }

  const windSpeed = weather.wind.speed;

  if (windSpeed > 5) {
    return 1;
  }

  return Math.floor(windSpeed / 5 * 100) / 100;
};

export default function SoundMap() {
  const { markers } = useContext(MapContext);

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
      prevMarker.distancePar = Math.round(distance * 100 / maxDistance);

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
        }
      };

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

  return (
    <>
    </>
  );
}
