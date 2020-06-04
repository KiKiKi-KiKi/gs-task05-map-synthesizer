import axios from 'axios';
import { WEATHER_API_KEY } from './config';
const CURRNET_WEATHER_DATA = `http://api.openweathermap.org/data/2.5/weather?appid=${WEATHER_API_KEY}`;

const getCurrentWeather = async ({lat, lng}) => {
  try {
    const api = `${CURRNET_WEATHER_DATA}&lat=${lat}&lon=${lng}`;
    const res = await axios.get(api);
    const weatherData = res.data;
    return weatherData;
  } catch(err) {
    console.warn(`getCurrentWeather ERROR(${err.code}): ${err.message}`);
    return null;
  }
};

export default getCurrentWeather;
