import React, { useContext, useCallback } from 'react';
import MapContext from '../contexts/MapContext';
import { ADD_MARKER, UPDATE_POSITION } from '../actions/marker';
import GoogleMapReact from 'google-map-react';
import { MAP_API_KEY, DEFAULT_ZOOOM } from '../config';

const addMarkerToMap = ({ map, maps, position, onChange }) => {
  const marker = new maps.Marker({
    position: position,
    map,
    draggable: true,
  });

  marker.addListener('dragend', (e) => {
    console.log('dragend', e);
    onChange({ marker: marker, position: e.latLng });
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
      }}
      onGoogleApiLoaded={onLoaded}
    ></GoogleMapReact>
  );
}
