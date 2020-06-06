import React, { useContext, useMemo } from 'react';
import MapContext from '../contexts/MapContext';

const convertLng = (lng) => {
  if (lng > 0) {
    return lng;
  }
  return (180 * 2) - lng;
};

export default function SoundMap() {
  const { markers } = useContext(MapContext);

  // marker を lng 順に並べる
  const sorted = useMemo(() => {
    const list = [...markers];
    return list.sort((a, b) => {
      // longitude is [-180 ... 180] shift [0 ... 360]
      const posA = convertLng(a.position.lng);
      const posB = convertLng(b.position.lng);
      return posA - posB;
    });
  }, [markers]);

  console.log('sorted', sorted);

  return (
    <>
    </>
  );
}
