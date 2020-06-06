import { getDefaultPosition } from './utils';
import React, { useState, useEffect, useReducer } from 'react';
import MapContext from './contexts/MapContext';
import SoundContext from './contexts/SoundContext';
import reducer from './reducers/markers';
import { default as soundDispatch } from './dispatchers/sound';
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
          <SoundContext.Provider value={{ soundDispatch }}>
            <div className="map-container">
              {firstPos ? (
                <Map initialPosition={firstPos} />
              ) : (
                <p>Loading...</p>
              )}
            </div>
            <div className="marker-list-container">
              <MarkerList />
            </div>
          </SoundContext.Provider>
        </MapContext.Provider>
      </div>
    </>
  );
}
