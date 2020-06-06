import React from 'react';
import { ReactComponent as Icon } from '../images/spinner-solid.svg';

export default function LoadingIcon() {
  return (
    <i className="fa fa-spin fa-loading">
      <Icon />
    </i>
  );
}
