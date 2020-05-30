import { getDefaultPosition } from './utils';
import React, { useState, useEffect, useReducer } from 'react';
import MapContext from './contexts/MapContext';
import reducer from './reducers/markers';
import Map from './components/Map';
import MarkerList from './components/MarkerList';
import './styles/app.scss';

export default function App() {
  const [firstPos, setFirstPos] = useState(false);
  const [markers, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    (async () => {
      const position = await getDefaultPosition();
      console.log(position);
      setFirstPos(position);
    })();
  }, []);

  return (
    <>
      <div className="container">
        <MapContext.Provider value={{ markers, dispatch }}>
          <div className="map-container">
            {firstPos ? <Map initialPosition={firstPos} /> : <p>Loading...</p>}
          </div>
          <div className="marker-list-container">
            <MarkerList />
          </div>
        </MapContext.Provider>
      </div>
    </>
  );
}
