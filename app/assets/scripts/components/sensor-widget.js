'use strict';
import React from 'react';
import ChartLine from './charts/chart-line';
import { numDisplay, formatDate } from '../utils/format';

var SensorWidget = React.createClass({
  displayName: 'SensorWidget',

  propTypes: {
    fetching: React.PropTypes.bool,
    fetched: React.PropTypes.bool,
    className: React.PropTypes.string,
    title: React.PropTypes.string,
    lastReading: React.PropTypes.object,
    avgs: React.PropTypes.object,
    plotData: React.PropTypes.array,
    axisLineVal: React.PropTypes.number,
    axisLineMax: React.PropTypes.number,
    axisLineMin: React.PropTypes.number,
    unit: React.PropTypes.string
  },

  render: function () {
    let {
      className,
      fetching, fetched,
      title,
      lastReading, avgs,
      plotData,
      axisLineVal, axisLineMax, axisLineMin,
      unit } = this.props;

    if (!fetched && !fetching) {
      return null;
    }

    return (
      <article className={'card ' + className}>
        <header className='card__header'>
          <div className='card__headline'>
            <h1 className='card__title'>{title} {fetching ? '...' : null}</h1>
            <dl className='stats'>
              <dd className='stats__label'>Last update</dd>
              <dt className='stats__date'>{lastReading !== null ? formatDate(lastReading.timestep) : '--'}</dt>
              <dd className='stats__label'>Current temperature</dd>
              <dt className='stats__value'>{lastReading !== null ? numDisplay(lastReading.value, 1) : '--'}{unit}</dt>
            </dl>
          </div>
        </header>
        <div className='card__body'>
          <div className='infographic'>
            {plotData.length ? (
            <div className='line-chart-wrapper'>
              <ChartLine
                className='line-chart'
                axisLineVal={axisLineVal}
                axisLineMax={axisLineMax}
                axisLineMin={axisLineMin}
                dataUnitSuffix={unit}
                data={plotData} />
            </div>
            ) : null}
            {!plotData.length && fetching ? <p className='card__loading'>Loading Data...</p> : null}
          </div>
          <div className='metrics'>
            <ul className='metrics__list'>
              <li><strong>{avgs !== null ? numDisplay(avgs.today, 1, unit) : '--'}</strong> avg today</li>
              <li><strong>{avgs !== null ? numDisplay(avgs.yesterday, 1, unit) : '--'}</strong> avg yesterday</li>
            </ul>
          </div>
        </div>
      </article>
    );
  }
});

module.exports = SensorWidget;
