import React, { useState, useCallback } from 'react';
import MarkerList from './MarkerList';

const TAB_CLASSES = ['tab-btn active', 'tab-btn'];

function TabContent({ selected }) {
  if (!selected) {
    return <MarkerList />;
  }
  return null;
}

export default function Controller() {
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
        <TabContent selected={selected} />
      </div>
    </div >
  );
}
