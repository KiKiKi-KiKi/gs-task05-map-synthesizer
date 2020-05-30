import React, { useState, useReducer, useCallback } from 'react';
import GoogleMapReact from 'google-map-react';
import { MAP_API_KEY } from '../config';
import reducer, { ADD_MARKER } from '../reducers/markers';

const addMarkrtToMap = ({ map, maps, position }) => {
  const marker = new maps.Marker({
    position: position,
    map,
  });

  const infoWindow = new maps.InfoWindow({
    content: `<div>
      <p>lat: ${marker.position.lat()}</p>
      <p>lng: ${marker.position.lng()}</p>
    </div>`,
  });

  marker.addListener('click', (e) => {
    console.log(marker, e);
    if (!marker.openWindow) {
      marker.openWindow = true;
      infoWindow.open(map, marker);
    } else {
      marker.openWindow = false;
      infoWindow.close();
    }
  });

  return marker;
}

export default function Map({ initialPosition }) {
  const [pins, dispatch] = useReducer(reducer);

  const addMarker = useCallback(({ map, maps }) => (e) => {
    console.log(`Add Marker`, e);
    const marker = addMarkrtToMap({ map, maps, position: e.latLng });
    dispatch({ type: ADD_MARKER, marker });
  }, [dispatch])

  const onLoaded = useCallback(({ map, maps }) => {
    const marker = addMarkrtToMap({ map, maps, position: initialPosition });
    dispatch({ type: ADD_MARKER, marker });

    const onAddMarker = addMarker({ map, maps });
    map.addListener('click', onAddMarker);
  }, [initialPosition, dispatch]);

  console.log(pins);

  return (
    <GoogleMapReact
      bootstrapURLKeys={{
        key: MAP_API_KEY,
      }}
      defaultCenter={initialPosition}
      defaultZoom={11}
      onGoogleApiLoaded={onLoaded}
    >
    </GoogleMapReact>
  );
}

