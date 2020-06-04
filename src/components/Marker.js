import { convertToneByLatLng, testSounde } from '../synth';
import getCurrentWeather, { WEATHER_ICON_PATH } from '../weather';

const getWeather = (marker) => async ({ lat, lng }) => {
  const weatherData = await getCurrentWeather({ lat, lng });
  console.log(weatherData);
  marker._weather = weatherData;
  return weatherData;
};

const markerPositionSound = ({ lat, lng }) => {
  const tones = convertToneByLatLng({ lat, lng });
  console.log(tones);
  testSounde(tones);
};

export const addMarkerEvents = ({ marker, onChange }) => {
  marker._getWeather = getWeather(marker);

  // drag Events
  marker.addListener('dragend', (e) => {
    console.log('dragend', e);
    onChange({ marker: marker, position: e.latLng });
    marker._getWeather({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  });

  // debounce timer
  let timer = null;
  marker.addListener('drag', (e) => {
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      console.log('on Drag', lat, lng);
      markerPositionSound({ lat, lng });
    }, 10);
  });

  const [lat, lng] = [marker.position.lat(), marker.position.lng()];
  marker._getWeather({lat, lng});
};

const Marker = ({ map, maps, position }) => {
  const marker = new maps.Marker({
    position: position,
    map,
    draggable: true,
  });

  let indoWindow = null;
  let openWindow = false;
  const getWindowContent = (marker) => {
    if (!marker._weather) {
      return `<div>Loading...</div>`;
    }
    const weather = marker._weather.weather[0];
    const wind = marker._weather.wind;
    return `<div class="marker-info">
      <div>
        <figure class="weather-icon"><img src=${WEATHER_ICON_PATH}${weather.icon}.png /></figure>
        <span>${weather.main} (${weather.description})</span>
      </div>
      <div>
        <div>Wind<div>
        <span>${wind.deg} deg</span>
        <span>Speed: ${wind.speed}</span>
      </div>
    </div>`;
  };

  // show info window
  marker.addListener('click', (e) => {
    console.log(marker, e);
    if (!openWindow) {
      openWindow = true;
      indoWindow = new maps.InfoWindow({
        content: getWindowContent(marker),
      });
      indoWindow.open(map, marker);
    } else {
      indoWindow.close();
      indoWindow = null;
      openWindow = false;
    }
  });

  marker.addListener('dragstart', () => {
    if (!openWindow) {
      return false;
    }
    indoWindow.close();
    indoWindow = null;
    openWindow = false;
  });

  const [lat, lng] = [marker.position.lat(), marker.position.lng()];
  markerPositionSound({ lat, lng });
  return marker;
};

export default Marker;
