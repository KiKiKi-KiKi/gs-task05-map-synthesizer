import { getDefaultPosition } from './utils';
import React, { useState, useEffect, useReducer } from 'react';
import MapContext from './contexts/MapContext';
import SoundContext from './contexts/SoundContext';
import reducer from './reducers/markers';
import { default as soundDispatch } from './dispatchers/sound';
import Controller from './components/Controller';
import Map from './components/Map';
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
            <Controller />
          </SoundContext.Provider>
        </MapContext.Provider>
      </div>
    </>
  );
}
