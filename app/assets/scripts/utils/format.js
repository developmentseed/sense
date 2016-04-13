'use strict';
module.exports.numDisplay = function (n, dec = 2, suffix = '', nan = '--') {
  if (isNaN(n)) {
    return nan;
  }
  let s = n.toString();
  s = (s.indexOf('.') === -1) ? s : s.substr(0, s.indexOf('.') + dec + 1);
  return s + suffix;
};

module.exports.formatDate = function (date) {
  let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let hour = date.getHours();
  hour = hour < 10 ? `0${hour}` : hour;
  let minute = date.getMinutes();
  minute = minute < 10 ? `0${minute}` : minute;
  return `${months[date.getMonth()]} ${date.getDate()}, ${hour}:${minute}`;
};

module.exports.round = function (n, dec = 2) {
  return +module.exports.numDisplay(n, dec);
};
