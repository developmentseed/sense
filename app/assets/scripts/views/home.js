'use strict';
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import SensorWidget from '../components/sensor-widget';
import { fetchSensorData } from '../actions/action-creators';
import { round } from '../utils/format';

const getTime = function (str) {
  let date = new Date(str);
  return Math.floor(date.getTime() / 1000);
};

const sensorProps = React.PropTypes.shape({
  fetched: React.PropTypes.bool,
  fetching: React.PropTypes.bool,
  data: React.PropTypes.array
});

var Home = React.createClass({
  displayName: 'Home',

  propTypes: {
    _requestSensorData: React.PropTypes.func,
    sensorUv: sensorProps,
    sensorLuminosity: sensorProps,
    sensorPressure: sensorProps,
    sensorHumidity: sensorProps,
    sensorTemperature: sensorProps
  },

  // Having measurements every minute is too much. Group them.
  // Max seconds between reading for them to be considered part
  // of the same group.
  _mTimeThreshold: 120,
  _mGroupSize: 6, // Equal to 10 measurements per hour.

  _fetchInterval: null,
  // In seconds.
  _fetchRate: 300, // 5 min

  prepareData: function (rawData) {
    var data = null;

    if (rawData) {
      data = [];
      rawData[0].value = +rawData[0].value;
      let bucket = [rawData[0]];
      for (var i = 1; i < rawData.length; i++) {
        rawData[i].value = +rawData[i].value;
        let prevTime = getTime(rawData[i - 1].createdAt);
        let currTime = getTime(rawData[i].createdAt);
        // Having measurements every minute is too much. Group them.
        // To make sure that the grouped measurements are all around the same
        // time there can't be more than X seconds difference between them.
        if (currTime - prevTime > this._mTimeThreshold || bucket.length === this._mGroupSize) {
          let f = {
            createdAt: _.last(bucket).createdAt,
            value: +round(_.meanBy(bucket, 'value'))
          };
          data.push(f);
          bucket = [];
        }
        bucket.push(rawData[i]);
      }
      // After the loop finished there may still be data to process.
      // if bucket.length < this._mGroupSize for example.
      let f = {
        createdAt: _.last(bucket).createdAt,
        value: +round(_.meanBy(bucket, 'value'))
      };
      data.push(f);
    }

    let startToday = new Date();
    startToday.setHours(0);
    startToday.setMinutes(0);
    startToday.setSeconds(0);

    startToday = Math.floor(startToday.getTime() / 1000);
    let startYesterday = startToday - (60 * 60 * 24);

    let dataAll = [];
    let dataToday = [];
    let dataYesterday = [];

    _.forEach(data, o => {
      let date = new Date(o.createdAt);
      let time = Math.floor(date.getTime() / 1000);
      dataAll.push({
        timestep: date,
        value: +o.value
      });
      if (time >= startToday) {
        dataToday.push({
          timestep: date,
          value: +o.value
        });
      }
      if (time < startToday && time >= startYesterday) {
        dataYesterday.push({
          timestep: date,
          value: +o.value
        });
      }
    });

    let avgs = {
      today: _.meanBy(dataToday, 'value'),
      yesterday: _.meanBy(dataYesterday, 'value')
    };

    let last = _.last(dataAll) || null;

    return {
      data: dataAll,
      last,
      avgs
    };
  },

  fetchData: function () {
    let daysAgo3 = (new Date()).getTime() - (60 * 60 * 24 * 3 * 1000);
    daysAgo3 = new Date(daysAgo3).toISOString();
    this.props._requestSensorData('temperature', daysAgo3);
    this.props._requestSensorData('humidity', daysAgo3);
    this.props._requestSensorData('uv', daysAgo3);
    this.props._requestSensorData('luminosity', daysAgo3);
    this.props._requestSensorData('pressure', daysAgo3);
  },

  componentDidMount: function () {
    this.fetchData();
    this._fetchInterval = setInterval(() => {
      this.fetchData();
    }, this._fetchRate * 1000);
  },

  componentWillUnmount: function () {
    if (this._fetchInterval) {
      clearInterval(this._fetchInterval);
    }
  },

  render: function () {
    let sensorTemperatureData = this.prepareData(this.props.sensorTemperature.data);
    let sensorHumidityData = this.prepareData(this.props.sensorHumidity.data);
    let sensorUvData = this.prepareData(this.props.sensorUv.data);
    let sensorLuminosityData = this.prepareData(this.props.sensorLuminosity.data);
    let sensorPressureData = this.prepareData(this.props.sensorPressure.data);

    return (
      <section className='page'>
        <header className='page__header'>
          <div className='inner'>
            <div className='page__headline'>
              <h1 className='page__title'>Sense Dashboard</h1>
            </div>
          </div>
        </header>
        <div className='page__body'>

          <section className='page__content'>
            <div className='inner'>

              <SensorWidget
                className='card--temp'
                fetching={this.props.sensorTemperature.fetching}
                fetched={this.props.sensorTemperature.fetched}
                title='Temperature'
                lastReading={sensorTemperatureData.last}
                avgs={sensorTemperatureData.avgs}
                plotData={sensorTemperatureData.data}
                axisLineMax={35}
                axisLineVal={20}
                axisLineMin={4}
                unit=' ºC'
              />

              <SensorWidget
                className='card--hum'
                fetching={this.props.sensorHumidity.fetching}
                fetched={this.props.sensorHumidity.fetched}
                title='Humidity'
                lastReading={sensorHumidityData.last}
                avgs={sensorHumidityData.avgs}
                plotData={sensorHumidityData.data}
                axisLineMax={100}
                axisLineVal={50}
                axisLineMin={10}
                unit=' %'
              />

              <SensorWidget
                className='card--uv'
                fetching={this.props.sensorUv.fetching}
                fetched={this.props.sensorUv.fetched}
                title='Uv light'
                lastReading={sensorUvData.last}
                avgs={sensorUvData.avgs}
                plotData={sensorUvData.data}
                axisLineMax={5000}
                axisLineVal={250}
                axisLineMin={0}
                unit=' μW/cm²'
              />

              <SensorWidget
                className='card--lux'
                fetching={this.props.sensorLuminosity.fetching}
                fetched={this.props.sensorLuminosity.fetched}
                title='Luminosity'
                lastReading={sensorLuminosityData.last}
                avgs={sensorLuminosityData.avgs}
                plotData={sensorLuminosityData.data}
                axisLineMax={135000}
                axisLineVal={50000}
                axisLineMin={0}
                unit=' lx'
              />

              <SensorWidget
                className='card--press'
                fetching={this.props.sensorPressure.fetching}
                fetched={this.props.sensorPressure.fetched}
                title='Air Pressure'
                lastReading={sensorPressureData.last}
                avgs={sensorPressureData.avgs}
                plotData={sensorPressureData.data}
                axisLineMax={1020}
                axisLineVal={1010}
                axisLineMin={1000}
                unit=' hPa'
              />

            </div>
          </section>
        </div>
      </section>
    );
  }
});

// /////////////////////////////////////////////////////////////////// //
// Connect functions

function selector (state) {
  return {
    sensorUv: state.sensorUv,
    sensorLuminosity: state.sensorLuminosity,
    sensorPressure: state.sensorPressure,
    sensorHumidity: state.sensorHumidity,
    sensorTemperature: state.sensorTemperature
  };
}

function dispatcher (dispatch) {
  return {
    _requestSensorData: (sensor, toDate) => dispatch(fetchSensorData(sensor, toDate))
  };
}

module.exports = connect(selector, dispatcher)(Home);
