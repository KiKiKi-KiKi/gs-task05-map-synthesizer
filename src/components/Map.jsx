import React, { useContext, useCallback } from 'react';
import MapContext from '../contexts/MapContext';
import { ADD_MARKER } from '../actions/marker';

import GoogleMapReact from 'google-map-react';
import { MAP_API_KEY } from '../config';

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
  const { markers, dispatch } = useContext(MapContext);

  const addMarker = useCallback(({ map, maps }) => (e) => {
    console.log(`Add Marker`, e);
    const marker = addMarkrtToMap({ map, maps, position: e.latLng });
    dispatch({ type: ADD_MARKER, marker });
  }, [dispatch]);

  const onLoaded = useCallback(({ map, maps }) => {
    const marker = addMarkrtToMap({ map, maps, position: initialPosition });
    dispatch({ type: ADD_MARKER, marker });

    const onAddMarker = addMarker({ map, maps });
    map.addListener('click', onAddMarker);
  }, [initialPosition, addMarker, dispatch]);

  console.log(markers);

  return (
    <GoogleMapReact
      bootstrapURLKeys={{
        key: MAP_API_KEY,
      }}
      defaultCenter={initialPosition}
      defaultZoom={11}
      options={{
        gestureHandling: 'cooperative',
      }}
      onGoogleApiLoaded={onLoaded}
    >
    </GoogleMapReact>
  );
}

