import React, { useContext, useCallback, useEffect } from 'react';
import MapContext from '../contexts/MapContext';
import { ADD_MARKER, UPDATE_POSITION } from '../actions/marker';
import GoogleMapReact from 'google-map-react';
import { MAP_API_KEY, DEFAULT_ZOOOM, MAP_STYLE } from '../config';

import { convertToneToLatLng, synthInit, testTone } from '../synth';
import getCurrentWeather from '../weather';

const getWeather = (marker) => async ({lat, lng}) => {
  const weatherData = await getCurrentWeather({ lat, lng });
  console.log(weatherData);
  marker._weather = weatherData;
  return weatherData;
};


const addMarkerSound = ({lat, lng}) => {
  const tones = convertToneToLatLng(lat, lng);
  testTone(tones);
}

const addMarkerToMap = ({ map, maps, position, onChange }) => {
  const marker = new maps.Marker({
    position: position,
    map,
    draggable: true,
  });

  marker._getWeather = getWeather(marker);

  let timer = null;

  // drag event
  marker.addListener('drag', (e) => {
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      console.log('on Drag', lat, lng);
      const tones = convertToneToLatLng(lat, lng);
      console.log(tones);
      testTone(tones);
    }, 10);
  });

  marker.addListener('dragend', (e) => {
    console.log('dragend', e);
    onChange({ marker: marker, position: e.latLng });
    marker._getWeather({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  });

  const getWindowContent = (marker) => {
    return `<div>
      <p>lat: ${marker.position.lat()}</p>
      <p>lng: ${marker.position.lng()}</p>
    </div>`;
  };

  let infoWindow;

  marker.addListener('click', (e) => {
    console.log(marker, e);
    if (!marker.openWindow) {
      marker.openWindow = true;
      infoWindow = new maps.InfoWindow({
        content: getWindowContent(marker),
      });
      infoWindow.open(map, marker);
    } else {
      marker.openWindow = false;
      infoWindow.close();
      infoWindow = null;
    }
  });

  const [lat, lng] = [marker.position.lat(), marker.position.lng()];
  addMarkerSound({ lat, lng });
  marker._getWeather({ lat, lng });

  return marker;
};

export default function Map({ initialPosition }) {
  const { markers, dispatch } = useContext(MapContext);

  const onChangePosition = useCallback(
    ({ marker, position }) => {
      dispatch({ type: UPDATE_POSITION, marker, position });
    },
    [dispatch],
  );

  const addMarker = useCallback(
    ({ map, maps }) => (e) => {
      console.log(`Add Marker`, e);
      const marker = addMarkerToMap({
        map,
        maps,
        position: e.latLng,
        onChange: onChangePosition,
      });
      dispatch({ type: ADD_MARKER, marker });
    },
    [dispatch, onChangePosition],
  );

  // on Load Map
  const onLoaded = useCallback(
    ({ map, maps }) => {
      // initial Marker
      const marker = addMarkerToMap({
        map,
        maps,
        position: initialPosition,
        onChange: onChangePosition,
      });
      dispatch({ type: ADD_MARKER, marker });

      // when click, add new marker to map
      const onAddMarker = addMarker({ map, maps });
      map.addListener('click', onAddMarker);
    },
    [initialPosition, addMarker, onChangePosition, dispatch],
  );

  useEffect(() => {
    synthInit();
  }, []);

  console.log(markers);

  return (
    <GoogleMapReact
      bootstrapURLKeys={{
        key: MAP_API_KEY,
      }}
      defaultCenter={initialPosition}
      defaultZoom={DEFAULT_ZOOOM}
      options={{
        gestureHandling: 'cooperative',
        styles: MAP_STYLE,
      }}
      onGoogleApiLoaded={onLoaded}
    ></GoogleMapReact>
  );
}
