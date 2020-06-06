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

function PlayBtn({ onClick }) {
  return (
    <button className="btn play-btn" onClick={onClick}>
      PLAY
    </button>
  );
}

function StopBtn({ onClick }) {
  return (
    <button className="btn stop-btn" onClick={onClick}>
      STOP
    </button>
  );
}

function Player({ melody }) {
  const [isPlay, setPlay] = useState(false);

  console.log('melody', melody);

  const onClickHandler = useCallback(() => {
    setPlay((isPlay) => {
      if (isPlay) {
        console.info('STOP MUSIC');
      } else {
        console.info('START MUSIC');
      }
      return !isPlay;
    });
  }, []);

  return isPlay ? (
    <StopBtn onClick={onClickHandler} />
  ) : (
    <PlayBtn onClick={onClickHandler} />
  );
}

export default function Controller() {
  const [melody, dispatch] = useReducer(reducer);
  const [selected, setSelected] = useState(false);
  const onChange = useCallback(
    (isActive) => () => {
      if (isActive) {
        return false;
      }
      // TODO: stop music
      setSelected((select) => !select);
    },
    [],
  );

  const cx = [...TAB_CLASSES];
  const [tab1Class, tab2Class] = selected ? cx.reverse() : cx;

  return (
    <div className="conttoller">
      <div className="tab-controller">
        <button className={tab1Class} onClick={onChange(!selected)}>
          List
        </button>
        <button className={tab2Class} onClick={onChange(selected)}>
          Sound Map
        </button>
        {selected && <Player melody={melody} />}
      </div>
      <div className="control-body">
        <MelodyContext.Provider value={{ dispatch }}>
          <TabContent selected={selected} />
        </MelodyContext.Provider>
      </div>
    </div>
  );
}
