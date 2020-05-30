export const ADD_MARKER = 'ADD_MARKER';

const reducer = (state = [], action) => {
  switch (action.type) {
    case ADD_MARKER: {
      const marker = action.marker;
      console.log(state.length);
      const len = state.length;
      const id = len ? state[len - 1].id + 1 : 0;
      return [...state, {
        id,
        marker,
      }];
    }
    default: {
      return state;
    }
  }
}

export default reducer;
