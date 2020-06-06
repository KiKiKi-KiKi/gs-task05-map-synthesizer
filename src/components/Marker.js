import { convertToneByLatLng, testSounde } from '../synth';
import getCurrentWeather, { getWeatherIconPath } from '../weather';

const getWeather = (marker, callback) => async ({ lat, lng }) => {
  const weatherData = await getCurrentWeather({ lat, lng });
  // console.log(weatherData);
  marker._weather = weatherData;
  callback(marker, weatherData);
  return weatherData;
};

const markerPositionSound = ({ lat, lng }) => {
  const tones = convertToneByLatLng({ lat, lng });
  console.log('marker position tone:', tones);
  testSounde(tones);
};

export const addMarkerEvents = ({
  marker,
  onChangePosition,
  onChangeWeather,
}) => {
  marker._getWeather = getWeather(marker, onChangeWeather);

  // drag Events
  marker.addListener('dragend', (e) => {
    // console.log('dragend', e);
    onChangePosition({ marker: marker, position: e.latLng });
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
      // console.log('on Drag', lat, lng);
      markerPositionSound({ lat, lng });
    }, 10);
  });

  const [lat, lng] = [marker.position.lat(), marker.position.lng()];
  marker._getWeather({ lat, lng });
};

const Marker = ({ id, map, maps, position, onSound, onDelete }) => {
  const marker = new maps.Marker({
    position: position,
    map,
    draggable: true,
    icon: {
      fillColor: '#21d4f6',
      fillOpacity: 0.8,
      path: maps.SymbolPath.CIRCLE,
      scale: 10,
      strokeColor: '#21d4f6',
      strokeWidth: 1.0,
    },
    label: {
      text: id.toString(),
      color: '#ffffff',
      fontSize: '16px',
    },
  });

  marker._id = id;

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
        <figure class="weather-icon">
          <img src=${getWeatherIconPath(weather.icon)} />
        </figure>
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
  marker.addListener('click', () => {
    // console.log(marker, e);
    if (!openWindow) {
      openWindow = true;
      indoWindow = new maps.InfoWindow({
        content: getWindowContent(marker),
      });
      indoWindow.open(map, marker);
      onSound(marker._id);
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

  marker.addListener('rightclick', () => {
    if (!window.confirm(`Delete Marker-${id}?`)) {
      return false;
    }
    onDelete(id);
  });

  const [lat, lng] = [marker.position.lat(), marker.position.lng()];
  markerPositionSound({ lat, lng });
  return marker;
};

export default Marker;
