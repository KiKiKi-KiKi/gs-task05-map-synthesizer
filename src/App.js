import React, { useState, useEffect } from 'react';
import { getDefaultPosition } from './utils';
import Map from './components/Map';

export default function App() {
  const [firstPos, setFirstPos] = useState(false);

  useEffect(() => {
    (async () => {
      const position = await getDefaultPosition();
      console.log(position);
      setFirstPos(position);
    })();
  }, []);

  return (
    <>
      <div style={{ height: '100vh', width: '100%' }}>
        {firstPos ? <Map initialPosition={firstPos} /> : <p>Loading...</p>}
      </div>
    </>
  );
}
