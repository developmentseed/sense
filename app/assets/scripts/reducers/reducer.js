import _ from 'lodash';
import { combineReducers } from 'redux';
import { routeReducer } from 'react-router-redux';
import * as actions from '../actions/action-types';

const sensorReducerFactory = function (sensor) {
  return function (state = {fetching: false, fetched: false, data: null}, action) {
    let s = sensor.toUpperCase();
    switch (action.type) {
      case actions[`REQUEST_SENSOR_DATA_${s}`]:
        console.log(`REQUEST_SENSOR_DATA_${s}`);
        state = _.cloneDeep(state);
        state.fetching = true;
        break;
      case actions[`RECEIVE_SENSOR_DATA_${s}`]:
        console.log(`RECEIVE_SENSOR_DATA_${s}`);
        state = _.cloneDeep(state);
        state.data = action.data;
        state.fetching = false;
        state.fetched = true;
        break;
    }
    return state;
  };
};

const sensorUv = sensorReducerFactory('uv');
const sensorLuminosity = sensorReducerFactory('luminosity');
const sensorPressure = sensorReducerFactory('pressure');
const sensorHumidity = sensorReducerFactory('humidity');
const sensorTemperature = sensorReducerFactory('temperature');

export default combineReducers({
  routing: routeReducer,
  sensorUv,
  sensorLuminosity,
  sensorPressure,
  sensorHumidity,
  sensorTemperature
});
