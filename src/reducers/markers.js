import {
  ADD_MARKER,
  UPDATE_POSITION,
  REMOVE_MARKER,
  UPDATE_WEATHER,
} from '../actions/marker';
import {
  getToneDataByLatLng,
  getCodeByToneKeys,
  convertWeatherToTone,
} from '../synth';
import { getWeatherTypeByIconCode } from '../weather';

const reducer = (state = [], action) => {
  switch (action.type) {
    case ADD_MARKER: {
      console.log(ADD_MARKER, state.length, action.id);
      const marker = action.marker;
      const id = action.id;
      const position = {
        lat: marker.position.lat(),
        lng: marker.position.lng(),
      };
      const codeData = getToneDataByLatLng(position);
      const code = getCodeByToneKeys(codeData);

      return [
        ...state,
        {
          id,
          marker,
          position,
          codeData,
          code,
          weather: null,
        },
      ];
    }
    case UPDATE_POSITION: {
      console.log(UPDATE_POSITION, action.marker._id);
      const cloneState = [...state];
      const marker = action.marker;
      const id = marker._id;
      const index = state.findIndex((marker) => marker.id === id);
      const data = cloneState[index];
      const position = {
        lat: marker.position.lat(),
        lng: marker.position.lng(),
      };
      const codeData = getToneDataByLatLng(position);
      const code = getCodeByToneKeys(codeData);

      cloneState[index] = {
        ...data,
        position,
        codeData,
        code,
      };

      return cloneState;
    }
    case REMOVE_MARKER: {
      console.log(REMOVE_MARKER, action.id);
      const cloneState = [...state];
      const index = cloneState.findIndex((marker) => marker.id === action.id);
      const [removeMarker] = cloneState.splice(index, 1);
      console.log(removeMarker);
      // remove from map
      removeMarker.marker.setMap(null);
      return cloneState;
    }
    case UPDATE_WEATHER: {
      console.log(UPDATE_WEATHER, action.marker._id, action.weather);
      const cloneState = [...state];
      const id = action.marker._id;
      const index = state.findIndex((marker) => marker.id === id);
      const data = cloneState[index];
      const code = data.code;
      const codeData = data.codeData;

      const weather = action.weather;
      const weatherType = getWeatherTypeByIconCode(weather.weather[0].icon);
      const wind = weather.wind;
      const weatherCode = convertWeatherToTone({
        weatherType,
        wind,
        ...codeData,
      });

      cloneState[index] = {
        ...data,
        codeData,
        code: [...new Set([...code, ...weatherCode])],
        weather,
      };

      return cloneState;
    }
    default: {
      return state;
    }
  }
};

export default reducer;
