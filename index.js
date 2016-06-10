'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _flyd = require('flyd');

var _flyd2 = _interopRequireDefault(_flyd);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var request = function request(os) {
  var streams = { load: _flyd2['default'].stream(), progress: _flyd2['default'].stream(), error: _flyd2['default'].stream(), abort: _flyd2['default'].stream() };
  var req = new XMLHttpRequest();
  req.addEventListener('load', function (ev) {
    var result = undefined;
    if (req.getResponseHeader('Content-Type') === 'application/json') {
      try {
        result = JSON.parse(req.response);
      } catch (e) {
        result = req.response;
      }
    } else {
      result = req.response;
    }
    streams.load(result);
  });
  req.addEventListener('progress', streams.progress);
  req.addEventListener('error', function (ev) {
    return streams.error(req.response);
  });
  req.addEventListener('abort', function (ev) {
    return streams.abort(req.response);
  });
  if (os.query) {
    os.path += "?" + _ramda2['default'].join('&', _ramda2['default'].map(_ramda2['default'].apply(function (key, val) {
      return key + '=' + String(val);
    }), _ramda2['default'].toPairs(os.query)));
  }
  req.open(os.method, (os.url || '') + os.path, true);
  if (os.send && (os.send.constructor === Object || os.send.constructor === Array)) os.send = JSON.stringify(os.send);
  if (os.headers) {
    for (var key in os.headers) {
      req.setRequestHeader(key, os.headers[key]);
    }
  }
  req.send(os.send);
  return streams;
};

// Merge in configuration options with regular request options to make pre-configured requests
request.config = function (conf) {
  return function (options) {
    return request(_ramda2['default'].merge(options, _ramda2['default'].assoc('headers', _ramda2['default'].merge(conf.headers, options.headers), conf)));
  };
};

request.toFormData = function (obj) {
  var fd = new FormData();
  for (var key in obj) fd.append(key, obj[key]);
  return fd;
};

module.exports = request;

