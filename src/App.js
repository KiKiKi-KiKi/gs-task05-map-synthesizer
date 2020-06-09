import { getDefaultPosition } from './utils';
import React, { useState, useEffect, useReducer } from 'react';
import MapContext from './contexts/MapContext';
import SoundContext from './contexts/SoundContext';
import markersReducer from './reducers/markers';
import playerReducer, { INITIAL_STATE } from './reducers/player';
import { default as soundDispatch } from './dispatchers/sound';
import Controller from './components/Controller';
import Map from './components/Map';
import './styles/app.scss';

export default function App() {
  const [firstPos, setFirstPos] = useState(false);
  const [markers, markerDispatch] = useReducer(markersReducer, []);
  const [player, playerDispatch] = useReducer(playerReducer, INITIAL_STATE);

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
        <MapContext.Provider value={{ markers, dispatch: markerDispatch }}>
          <SoundContext.Provider value={{ player, playerDispatch, soundDispatch }}>
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
