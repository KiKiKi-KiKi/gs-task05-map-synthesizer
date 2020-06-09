import React from 'react';
import LoadingIcon from './LoadingIcon';

export default function LoadingCover() {
  return (
    <div className="loading-cover">
      <div className="loader">
        <LoadingIcon />
        <p className="label">Loading</p>
      </div>
    </div>
  );
}
