import React, { useContext, useMemo, useCallback } from 'react';
import MapContext from '../contexts/MapContext';
import { REMOVE_MARKER } from '../actions/marker';

const MarkerListItem = ({ id, onRemove, position: { lat, lng } }) => {
  return (
    <li className="marker-list-item">
      <span>{id}</span>
      <div className="position">
        <span>lat: {lat}</span>
        <span>lng: {lng}</span>
      </div>
      <button className="remove-btn" onClick={onRemove}>Remove</button>
    </li>
  )
}

export default function MarkerList() {
  const { markers, dispatch } = useContext(MapContext);

  const onRemove = useCallback((id) => (e) => {
    e.preventDefault();
    dispatch({ type: REMOVE_MARKER, id });
  }, [dispatch]);

  const markerList = useMemo(() => {
    return markers.map((marker) => <MarkerListItem key={marker.id} onRemove={onRemove(marker.id)} {...marker} />)
  }, [markers, onRemove]);

  return (
    <ul className="marker-list">
      {markerList}
    </ul>
  )
}
