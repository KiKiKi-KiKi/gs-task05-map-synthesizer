import React, { useContext, useCallback, useEffect, useRef } from 'react';
import {
  ADD_MARKER,
  UPDATE_POSITION,
  UPDATE_WEATHER,
  REMOVE_MARKER,
} from '../actions/marker';
import { SOUND } from '../actions/sound';
import MapContext from '../contexts/MapContext';
import SoundContext from '../contexts/SoundContext';
import GoogleMapReact from 'google-map-react';
import { MAP_API_KEY, DEFAULT_ZOOOM, MAP_STYLE } from '../config';
import Marker, { addMarkerEvents } from './Marker';
import { synthInit } from '../synth';

export default function Map({ initialPosition }) {
  const { markers, dispatch } = useContext(MapContext);
  const { soundDispatch } = useContext(SoundContext);

  // React 外の marker に渡している state が更新されないので ref object に格納して useEffect 内で更新する
  const markersRef = useRef(markers);

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

  const onSound = useCallback(
    (markerID) => {
      if (markerID === undefined || markerID === null) {
        return;
      }
      const marker = markersRef.current.find(
        (marker) => marker.id === markerID,
      );
      soundDispatch({ type: SOUND, code: marker.code });
    },
    [soundDispatch],
  );

  const onDeleteMarker = useCallback(
    (id) => {
      dispatch({ type: REMOVE_MARKER, id });
    },
    [dispatch],
  );

  const getMarkerID = useCallback(() => {
    const markers = markersRef.current;
    const len = markers.length;
    return len ? markers[len - 1].id + 1 : 0;
  }, [markersRef]);

  const addMarker = useCallback(
    ({ map, maps }) => (e) => {
      console.log(`Add Marker`, e);
      const markerID = getMarkerID();
      const marker = Marker({
        id: markerID,
        map,
        maps,
        position: e.latLng,
        onSound,
        onDelete: onDeleteMarker,
      });
      dispatch({ type: ADD_MARKER, marker, id: markerID });
      addMarkerEvents({ marker, onChangePosition, onChangeWeather });
    },
    [
      dispatch,
      getMarkerID,
      onChangePosition,
      onChangeWeather,
      onSound,
      onDeleteMarker,
    ],
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

  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);

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
