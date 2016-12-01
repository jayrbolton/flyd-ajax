import flyd from 'flyd'
import R from 'ramda'

const request = os => {
  let streams = {load: flyd.stream(), progress: flyd.stream(), error: flyd.stream(), abort: flyd.stream()}
  let req = new XMLHttpRequest() 
  req.addEventListener('load', ev => {
    const content = req.getResponseHeader('Content-Type')
    // Try to parse body if it is JSON -- but don't throw exceptions here
    if(content && content.match('json')) {
      try      { req.body = JSON.parse(req.response) } 
      catch(e) { }
    } 
    streams.load(req)
  })
  req.addEventListener('progress', streams.progress)
  req.addEventListener('error', streams.error)
  req.addEventListener('abort', streams.abort)
  // Parse and append the query parameters, if provided as an object
  if(os.query) {
    const keyVals = R.toPairs(os.query)
    const joinedWithEquals = R.map(R.apply((key, val) => `${key}=${String(val)}`), keyVals)
    os.path += "?" + R.join('&', joinedWithEquals)
  }
  req.open(os.method, (os.url || '') + os.path, true)
  if(os.send && (os.send.constructor === Object || os.send.constructor === Array)) {
    os.send = JSON.stringify(os.send)
  }
  if(os.headers) {
    for(var key in os.headers) {
      req.setRequestHeader(key, os.headers[key])
    }
  }
  req.withCredentials = os.withCredentials
  req.send(os.send)
  return streams
}

// Merge in configuration options with regular request options to make pre-configured requests
request.config = R.curryN(2, (conf, newOptions) => {
  return request(
    R.compose(
      R.merge(R.__, newOptions)
    , R.assoc('query', R.merge(conf.query, newOptions.query))
    , R.assoc('send', R.merge(conf.send, newOptions.send))
    , R.assoc('headers', R.merge(conf.headers, newOptions.headers))
    )(conf)
  )
})


request.toFormData = obj => {
  let fd = new FormData()
  for(var key in obj) fd.append(key, obj[key])
  return fd
}

module.exports = request
