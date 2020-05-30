import { ADD_MARKER, UPDATE_POSITION, REMOVE_MARKER } from '../actions/marker';

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
      marker._id = id;
      return [
        ...state,
        {
          id,
          marker,
          position,
        },
      ];
    }
    case UPDATE_POSITION: {
      console.log(UPDATE_POSITION, action.marker._id);
      const cloneState = [...state];
      const id = action.marker._id;
      const index = state.findIndex((marker) => marker.id === id);
      cloneState[index] = {
        ...cloneState[index],
        position: {
          lat: action.position.lat(),
          lng: action.position.lng(),
        },
      };
      return cloneState;
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
};

export default reducer;
