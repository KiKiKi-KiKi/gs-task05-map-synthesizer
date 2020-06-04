import { convertToneByLatLng, testSounde } from '../synth';
import getCurrentWeather from '../weather';

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
  marker.addListener('dragstart', () => {
    if (!marker._openWindow) {
      return false;
    }
    marker._infoWindow.close();
    marker._infoWindow = null;
  });

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
};

const Marker = ({ map, maps, position }) => {
  const marker = new maps.Marker({
    position: position,
    map,
    draggable: true,
  });

  marker._indoWindow = null;
  marker._openWindow = false;
  const getWindowContent = (marker) => {
    return `<div>
      <p>lat: ${marker.position.lat()}</p>
      <p>lng: ${marker.position.lng()}</p>
    </div>`;
  };

  // show info window
  marker.addListener('click', (e) => {
    console.log(marker, e);
    if (!marker._openWindow) {
      marker._openWindow = true;
      marker._indoWindow = new maps.InfoWindow({
        content: getWindowContent(marker),
      });
      marker._indoWindow.open(map, marker);
    } else {
      marker._openWindow = false;
      marker._indoWindow.close();
      marker._indoWindow = null;
    }
  });

  const [lat, lng] = [marker.position.lat(), marker.position.lng()];
  markerPositionSound({ lat, lng });
  return marker;
};

export default Marker;
