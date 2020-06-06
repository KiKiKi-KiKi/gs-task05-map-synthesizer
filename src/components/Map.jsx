import React, { useContext, useCallback, useEffect } from 'react';
import MapContext from '../contexts/MapContext';
import { ADD_MARKER, UPDATE_POSITION, UPDATE_WEATHER } from '../actions/marker';
import GoogleMapReact from 'google-map-react';
import { MAP_API_KEY, DEFAULT_ZOOOM, MAP_STYLE } from '../config';
import Marker, { addMarkerEvents } from './Marker';
import { synthInit } from '../synth';

export default function Map({ initialPosition }) {
  const { markers, dispatch } = useContext(MapContext);

  const onChangePosition = useCallback(
    ({ marker, position }) => {
      dispatch({ type: UPDATE_POSITION, marker, position });
    },
    [dispatch],
  );

  const onChangeWeather = useCallback(
    (marker, weather) => {
      dispatch({ type: UPDATE_WEATHER, marker, weather });
    },
    [dispatch],
  );

  const addMarker = useCallback(
    ({ map, maps }) => (e) => {
      console.log(`Add Marker`, e);
      const marker = Marker({
        map,
        maps,
        position: e.latLng,
        // onChange: onChangePosition,
      });
      dispatch({ type: ADD_MARKER, marker });
      addMarkerEvents({ marker, onChangePosition, onChangeWeather });
    },
    [dispatch, onChangePosition, onChangeWeather],
  );

  // on Load Map
  const onLoaded = useCallback(
    ({ map, maps }) => {
      const onAddMarker = addMarker({ map, maps });

      // initial Marker
      onAddMarker({ latLng: initialPosition });

      // when click, add new marker to map
      map.addListener('click', onAddMarker);
    },
    [initialPosition, addMarker],
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
