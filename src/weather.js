import axios from 'axios';
import { WEATHER_API_KEY } from './config';

export const WEATHER_ICON_PATH = 'http://openweathermap.org/img/w/';

export const getWeatherIconPath = (icon) => {
  return `${WEATHER_ICON_PATH}${icon}.png`;
}

const CURRNET_WEATHER_DATA = `http://api.openweathermap.org/data/2.5/weather?appid=${WEATHER_API_KEY}`;

const getCurrentWeather = async ({ lat, lng }) => {
  try {
    const api = `${CURRNET_WEATHER_DATA}&lat=${lat}&lon=${lng}`;
    const res = await axios.get(api);
    const weatherData = res.data;
    return weatherData;
  } catch (err) {
    console.warn(`getCurrentWeather ERROR(${err.code}): ${err.message}`);
    return null;
  }
};

export default getCurrentWeather;

/*
01d | 01n ... clear sky
02d | 02n ... few clouds
03d | 03n ... scattered clouds
04d | 04n ... broken clouds
09d | 09n ... shower rain
10d | 10n ... rain
11d | 11n ... thunderstorm
13d | 13n ... snow
50d | 50n ... mist
cf. https://openweathermap.org/weather-conditions
*/
export const getWeatherTypeByIconCode = (id) => {
  const key = id.slice(0, 2) - 0;
  switch (key) {
    case 1:
    case 2:
      return 'sunny';
    case 3:
    case 4:
      return 'cloudy';
    case 9:
    case 10:
      return 'rain';
    case 11:
      return 'thunder';
    case 13:
      return 'snow';
    case 50:
      return 'mist';
    default:
      return null;
  }
};
