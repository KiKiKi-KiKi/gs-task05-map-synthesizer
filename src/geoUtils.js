export const convertLng = (lng) => {
  if (lng > 0) {
    return lng;
  }
  return 180 * 2 + lng;
};

export const convertLat = (lat) => {
  return 90 - Math.abs(lat);
};

const POINT = 1000;

// return [x, y];
export const convertPosition = ({ lat, lng }) => {
  const x = Math.round(convertLng(lng) * POINT) / POINT;
  const y = Math.round(convertLat(lat) * POINT) / POINT;
  return [x, y];
};

// 座標から２点間の距離を計算する
export const getPositionDistance = (pos1, pos2) => {
  return Math.round(
    Math.sqrt(
      (pos2.lat - pos1.lat) ** 2 +
        (convertLng(pos2.lng) - convertLng(pos1.lng)) ** 2,
    ),
  );
};

export const getMaxDistance = (markers) => {
  const len = markers.length;
  if (len < 2) {
    return 0;
  }
  const firstPos = markers[0].position;
  const endPos = markers[len - 1].position;
  return getPositionDistance(firstPos, endPos);
};
