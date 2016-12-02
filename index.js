'use strict';

var _flyd = require('flyd');

var _flyd2 = _interopRequireDefault(_flyd);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var request = function request(os) {
  var streams = { load: _flyd2.default.stream(), progress: _flyd2.default.stream(), error: _flyd2.default.stream(), abort: _flyd2.default.stream() };
  var req = new XMLHttpRequest();
  req.addEventListener('load', function (ev) {
    var content = req.getResponseHeader('Content-Type');
    // Try to parse body if it is JSON -- but don't throw exceptions here
    if (content && content.match('json')) {
      try {
        req.body = JSON.parse(req.response);
      } catch (e) {}
    }
    streams.load(req);
  });
  req.addEventListener('progress', streams.progress);
  req.addEventListener('error', streams.error);
  req.addEventListener('abort', streams.abort);
  // Parse and append the query parameters, if provided as an object
  if (os.query) {
    var keyVals = _ramda2.default.toPairs(os.query);
    var joinedWithEquals = _ramda2.default.map(_ramda2.default.apply(function (key, val) {
      return key + '=' + String(val);
    }), keyVals);
    os.path += "?" + _ramda2.default.join('&', joinedWithEquals);
  }
  req.open(os.method, (os.url || '') + os.path, true);
  if (os.send && (os.send.constructor === Object || os.send.constructor === Array)) {
    os.send = JSON.stringify(os.send);
  }
  if (os.headers) {
    for (var key in os.headers) {
      req.setRequestHeader(key, os.headers[key]);
    }
  }
  req.withCredentials = os.withCredentials;
  req.send(os.send);
  return streams;
};

request.toFormData = function (obj) {
  var fd = new FormData();
  for (var key in obj) {
    fd.append(key, obj[key]);
  }return fd;
};

module.exports = request;

