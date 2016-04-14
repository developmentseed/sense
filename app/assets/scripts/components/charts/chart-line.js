'use strict';
import React from 'react';
import d3 from 'd3';
import _ from 'lodash';
// import Popover from '../../utils/popover';

var LineChart = React.createClass({
  displayName: 'LineChart',

  propTypes: {
    className: React.PropTypes.string,
    data: React.PropTypes.array,
    axisLineVal: React.PropTypes.number,
    axisLineMax: React.PropTypes.number,
    axisLineMin: React.PropTypes.number,
    dataUnitSuffix: React.PropTypes.string
  },

  chart: null,

  onWindowResize: function () {
    this.chart.checkSize();
  },

  componentDidMount: function () {
    // console.log('LineChart componentDidMount');
    // Debounce event.
    this.onWindowResize = _.debounce(this.onWindowResize, 200);

    window.addEventListener('resize', this.onWindowResize);
    this.chart = Chart();
    d3.select(this.refs.container).call(this.chart
      .data(this.props.data)
      .axisLineVal(this.props.axisLineVal)
      .axisValueMax(this.props.axisLineMax)
      .axisValueMin(this.props.axisLineMin)
      .dataUnitSuffix(this.props.dataUnitSuffix));
  },

  componentWillUnmount: function () {
    // console.log('LineChart componentWillUnmount');
    window.removeEventListener('resize', this.onWindowResize);
    this.chart.destroy();
  },

  componentDidUpdate: function (prevProps/* prevState */) {
    console.log('LineChart componentDidUpdate');
    this.chart.pauseUpdate();
    if (prevProps.data !== this.props.data) {
      this.chart.data(this.props.data);
    }
    if (prevProps.axisLineVal !== this.props.axisLineVal) {
      this.chart.axisLineVal(this.props.axisLineVal);
    }
    if (prevProps.axisLineMax !== this.props.axisLineMax) {
      this.chart.axisValueMax(this.props.axisLineMax);
    }
    if (prevProps.axisLineMin !== this.props.axisLineMin) {
      this.chart.axisValueMin(this.props.axisLineMin);
    }
    if (prevProps.dataUnitSuffix !== this.props.dataUnitSuffix) {
      this.chart.dataUnitSuffix(this.props.dataUnitSuffix);
    }
    this.chart.continueUpdate();
  },

  render: function () {
    return (
      <div className={this.props.className} ref='container'></div>
    );
  }
});

module.exports = LineChart;

var Chart = function (options) {
  // Data related variables for which we have getters and setters.
  var _data = null;
  var _axisLineVal, _axisValueMin, _axisValueMax, _dataUnitSuffix;

  // Pause
  var _pauseUpdate = false;

  // Containters
  var $el, $svg;
  // Var declaration.
  var margin = {top: 16, right: 32, bottom: 32, left: 24};
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // width and height refer to the data canvas. To know the svg size the margins
  // must be added.
  var _width, _height;
  // Draw functions.
  var line;

  // Update functions.
  var updateData, upateSize;

  // X scale. Range updated in function.
  var x = d3.time.scale();

  // Y scale. Range updated in function.
  var y = d3.scale.linear();

  // Used for the zoom translate bounds.
  var minX;

  // Zoom
  var zoom = d3.behavior
    .zoom()
    .scaleExtent([1, 1]);

  // Line function for the delimit the area.
  line = d3.svg.line()
    .x(d => x(d.timestep))
    .y(d => y(d.value));

  // Define xAxis function.
  var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')
    .tickSize(0)
    .tickFormat(d3.time.format('%H:%M'));
    // .ticks(3);

  function _calcSize () {
    _width = parseInt($el.style('width'), 10) - margin.left - margin.right;
    _height = parseInt($el.style('height'), 10) - margin.top - margin.bottom;
  }

  function chartFn (selection) {
    $el = selection;

    var layers = {
      line: function () {
        // lines.
        let the_line = $dataCanvas.selectAll('.data-line')
          .data([_data]);

        // Handle new.
        the_line.enter()
          .append('path')
          .attr('clip-path', 'url(#clip)');

        // Update current.
        the_line
            .attr('d', d => line(d))
            .attr('class', d => `data-line`);

        // Remove old.
        the_line.exit()
          .remove();
      },

      minMax: function () {
        let [sDate, eDate] = x.domain();

        let f = (o) => {
          let timestamp = o.timestep.getTime();
          return timestamp >= sDate.getTime() && timestamp <= eDate.getTime();
        };

        // Min Max.
        let sorted = _(_data).filter(f).sortBy('value').value();
        if (!sorted.length) {
          return;
        }

        let min = sorted[0];
        let max = _.last(sorted);

        let edgeG = $dataCanvas.selectAll('.edges')
          .data([0])
          .enter().append('g')
          .attr('class', 'edges');

        edgeG.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '-0.25em')
          .attr('class', 'edge edge-max');

        edgeG.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '1em')
            .attr('class', 'edge edge-min');

        $dataCanvas.select('.edge.edge-max')
          .datum(max)
          .attr('x', d => x(d.timestep))
          .attr('y', d => y(d.value))
          .text(d => d.value + _dataUnitSuffix);

        $dataCanvas.select('.edge.edge-min')
          .datum(min)
          .attr('x', d => x(d.timestep))
          .attr('y', d => y(d.value))
          .text(d => d.value + _dataUnitSuffix);
      },

      xAxis: function () {
        // Append Axis.
        // X axis.
        let xAx = $svg.selectAll('.x.axis')
          .data([0]);

        xAx.enter().append('g')
          .attr('class', 'x axis')
          .append('text')
          .attr('class', 'label')
          .attr('text-anchor', 'start');

        xAx
          .attr('transform', `translate(${margin.left},${_height + margin.top + 16})`)
          .call(xAxis);
      },

      yAxis: function () {
        // Append Axis.
        // Y axis
        let yAx = $svg.selectAll('.y.axis')
          .data([0]);

        let yAxEnter = yAx.enter().append('g')
          .attr('class', 'y axis');

        yAxEnter.append('text')
          .attr('class', 'label')
          .attr('text-anchor', 'end');

        yAxEnter.append('line')
          .attr('class', 'line');

        yAx.select('.label')
          .attr('y', y(_axisLineVal) + margin.top)
          .attr('x', _width + margin.left + margin.right)
          .attr('dy', '1em')
          .text(_axisLineVal + _dataUnitSuffix);

        yAx.select('.line')
          .attr('x1', 0)
          .attr('y1', y(_axisLineVal) + margin.top)
          .attr('x2', _width + margin.left + margin.right)
          .attr('y2', y(_axisLineVal) + margin.top);
      },

      days: function () {
        // Compute days for the days steps.
        let dateCopyDay = d => {
          let n = new Date(d.getTime());
          n.setHours(0);
          n.setMinutes(0);
          n.setSeconds(0);
          n.setMilliseconds(0);
          return n;
        };
        let eDay = dateCopyDay(_.last(_data).timestep);
        let dt = dateCopyDay(_data[0].timestep);
        let daySteps = [dt];
        while (true) {
          dt = d3.time.day.offset(dateCopyDay(dt), 1);
          daySteps.push(dt);
          if (dt.getTime() >= eDay.getTime()) {
            break;
          }
        }

        let selection = $dataCanvas.selectAll('.days')
          .data([0]);

        selection.enter().append('g')
          .attr('class', 'days');

        let $days = selection.selectAll('.day-tick')
          .data(daySteps);

        $days.enter()
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('class', 'day-tick');

        $days
          .attr('x', d => x(d))
          .attr('y', _height + margin.top)
          .text(d => `${d.getDate()} ${months[d.getMonth()]}`);
      }
    };

    upateSize = function () {
      $svg
        .attr('width', _width + margin.left + margin.right)
        .attr('height', _height + margin.top + margin.bottom);

      $dataCanvas
        .attr('width', _width)
        .attr('height', _height);

      $svg.select('#clip rect')
        // Since this is going to be applied inside the dataCanvas
        // we have to compensate for the translate.
        .attr('x', -margin.left)
        .attr('y', -margin.top)
        // Add some top and bottom space to avoid clipping the path.
        .attr('width', _width + margin.left)
        .attr('height', _height + margin.top + margin.bottom);

      // DEBUG:
      // To view the area taken by the #clip rect.
      // $dataCanvas.select('.data-canvas-shadow')
      //   .attr('x', -margin.left)
      //   .attr('y', -margin.top)
      //   .attr('width', _width + margin.left)
      //   .attr('height', _height + margin.top + margin.bottom);

      // Update scale ranges.
      x.range([0, _width]);
      y.range([_height, 0]);

      // Recalculate the minX and zoom since scale changed.
      minX = x(_data[0].timestep);
      zoom.x(x);

      // Redraw.
      layers.line();
      layers.minMax();
      layers.days();
      layers.xAxis();
      layers.yAxis();
    };

    updateData = function () {
      if (!_data || _pauseUpdate) {
        return;
      }

      // Update scale domains.
      let eDate = _.last(_data).timestep;
      let sDate = d3.time.day.offset(eDate, -1);
      x.domain([sDate, eDate]);

      // Since the data is stacked the last element will contain the
      // highest values)
      y.domain([_axisValueMin, _axisValueMax]);

      // Recalculate the minX and zoom since scale changed.
      minX = x(_data[0].timestep);
      zoom.x(x);

      // Redraw.
      layers.line();
      layers.minMax();
      layers.days();
      layers.xAxis();
      layers.yAxis();
    };

    // -----------------------------------------------------------------
    // INIT.
    $svg = $el.append('svg')
      .attr('class', 'chart')
      .style('display', 'block');

    // Datacanvas
    var $dataCanvas = $svg.append('g')
      .attr('class', 'data-canvas')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    $svg.append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect');

    // DEBUG:
    // To view the area taken by the #clip rect.
    // $dataCanvas.append('rect')
    //   .attr('class', 'data-canvas-shadow')
    //   .style('fill', '#000')
    //   .style('opacity', 0.16);

    $svg
      .attr('cursor', 'move')
      .call(zoom)
      .on('mousewheel.zoom', null)
      .on('DOMMouseScroll.zoom', null);

    zoom.on('zoom', function () {
      // Bound translate.
      let [tx, ty] = zoom.translate();
      tx = Math.max(tx, 0);
      tx = Math.min(tx, Math.abs(minX) - margin.right);
      tx = Math.round(tx);
      zoom.translate([tx, ty]);

      layers.line();
      layers.minMax();
      layers.days();
      layers.xAxis();
    });

    _calcSize();
    upateSize();
    updateData();
  }

  chartFn.checkSize = function () {
    _calcSize();
    upateSize();
    return chartFn;
  };

  chartFn.destroy = function () {
    // Cleanup.
  };

  // --------------------------------------------
  // Getters and setters.
  chartFn.data = function (d) {
    if (!arguments.length) return _data;
    _data = _.cloneDeep(d);
    if (typeof updateData === 'function') updateData();
    return chartFn;
  };

  chartFn.axisLineVal = function (d) {
    if (!arguments.length) return _axisLineVal;
    _axisLineVal = d;
    if (typeof updateData === 'function') updateData();
    return chartFn;
  };

  chartFn.axisValueMin = function (d) {
    if (!arguments.length) return _axisValueMin;
    _axisValueMin = d;
    if (typeof updateData === 'function') updateData();
    return chartFn;
  };

  chartFn.axisValueMax = function (d) {
    if (!arguments.length) return _axisValueMax;
    _axisValueMax = d;
    if (typeof updateData === 'function') updateData();
    return chartFn;
  };

  chartFn.dataUnitSuffix = function (d) {
    if (!arguments.length) return _dataUnitSuffix;
    _dataUnitSuffix = d;
    if (typeof updateData === 'function') updateData();
    return chartFn;
  };

  chartFn.pauseUpdate = function () {
    _pauseUpdate = true;
    return chartFn;
  };

  chartFn.continueUpdate = function () {
    _pauseUpdate = false;
    if (typeof updateData === 'function') updateData();
    return chartFn;
  };

  return chartFn;
};
