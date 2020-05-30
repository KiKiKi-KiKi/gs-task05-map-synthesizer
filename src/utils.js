import { DEFAULT_POSITION } from './config';

const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

export const getDefaultPosition = async () => {
  try {
    const position = await getCurrentPosition();
    console.log(`USE device location ${position}`);
    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
  } catch (err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
    return DEFAULT_POSITION;
  }
};
