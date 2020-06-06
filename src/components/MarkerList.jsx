import React, { useContext, useMemo, useCallback } from 'react';
import MapContext from '../contexts/MapContext';
import { REMOVE_MARKER } from '../actions/marker';
import { getWeatherIconPath } from '../weather';

const Weather = ({ weather, wind }) => {
  return (
    <>
      <img
        src={getWeatherIconPath(weather[0].icon)}
        alt={weather[0].description}
      />
      <span>{weather[0].main}</span>
      <div>
        Wind:
        <span>
          {wind.speed} / {wind.deg} (deg)
        </span>
      </div>
    </>
  );
};

const MarkerListItem = ({
  id,
  onRemove,
  position: { lat, lng },
  code,
  weather,
}) => {
  console.log(weather);
  const weatherDOM = weather && <Weather {...weather} />;

  return (
    <li className="marker-list-item">
      <div className="marker-data">
        <span className="id">{id}</span>
        <div className="weather">{weatherDOM}</div>
        <div className="position">
          <span>lat: {lat}</span>
          <span>lng: {lng}</span>
        </div>
        <div className="code">[{code.join(', ')}]</div>
      </div>
      <div className="actions">
        <button className="remove-btn" onClick={onRemove}>
          Remove
        </button>
      </div>
    </li>
  );
};

export default function MarkerList() {
  const { markers, dispatch } = useContext(MapContext);

  const onRemove = useCallback(
    (id) => (e) => {
      e.preventDefault();
      dispatch({ type: REMOVE_MARKER, id });
    },
    [dispatch],
  );

  const markerList = useMemo(() => {
    const reverse = [...markers].reverse();
    return reverse.map((marker) => (
      <MarkerListItem
        key={marker.id}
        onRemove={onRemove(marker.id)}
        {...marker}
      />
    ));
  }, [markers, onRemove]);

  return <ul className="marker-list">{markerList}</ul>;
}
