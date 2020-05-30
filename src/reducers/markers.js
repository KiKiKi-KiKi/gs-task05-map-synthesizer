import { ADD_MARKER, REMOVE_MARKER } from '../actions/marker';

const reducer = (state = [], action) => {
  switch (action.type) {
    case ADD_MARKER: {
      const marker = action.marker;
      console.log(state.length);
      const len = state.length;
      const id = len ? state[len - 1].id + 1 : 0;
      const position = {
        lat: marker.position.lat(),
        lng: marker.position.lng(),
      };
      return [...state, {
        id,
        marker,
        position,
      }];
    }
    case REMOVE_MARKER: {
      console.log(REMOVE_MARKER, action.id);
      const cloneState = [...state];
      const index = cloneState.findIndex((marker) => marker.id === action.id);
      const [removeMarker] = cloneState.splice(index, 1);
      console.log(removeMarker);
      removeMarker.marker.setMap(null);
      return cloneState;
    }
    default: {
      return state;
    }
  }
}

export default reducer;
