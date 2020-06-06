import React, { useState, useCallback, useReducer } from 'react';
import MelodyContext from '../contexts/MelodyContext';
import reducer from '../reducers/melody';
import MarkerList from './MarkerList';
import SoundMap from './SoundMap';

const TAB_CLASSES = ['tab-btn active', 'tab-btn'];

function TabContent({ selected }) {
  if (!selected) {
    return <MarkerList />;
  }
  return <SoundMap />;
}

export default function Controller() {
  const [melody, dispatch] = useReducer(reducer);
  const [selected, setSelected] = useState(false);
  const onChange = useCallback(() => setSelected((select) => !select), []);

  const cx = [...TAB_CLASSES];
  const [tab1Class, tab2Class] = selected ? cx.reverse() : cx;

  return (
    <div className="conttoller">
      <div className="tab-controller">
        <button className={tab1Class} onClick={onChange}>
          List
        </button>
        <button className={tab2Class} onClick={onChange}>
          Sound Map
        </button>
      </div>
      <div className="control-body">
        <MelodyContext.Provider value={{ dispatch }}>
          <TabContent selected={selected} />
        </MelodyContext.Provider>
      </div>
    </div>
  );
}
