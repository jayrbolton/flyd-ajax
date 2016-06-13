import flyd from 'flyd'
import R from 'ramda'

const request = os => {
  let streams = { load: flyd.stream() , progress: flyd.stream()  , error: flyd.stream() , abort: flyd.stream() }
  let req = new XMLHttpRequest() 
  req.addEventListener('load', ev => {
    let result
    let content = req.getResponseHeader('Content-Type')
    if(content && content.match('json')) {
      try      { result = JSON.parse(req.response) } 
      catch(e) { result = req.response }
    } else {
      result = req.response
    }
    streams.load(result)
  })
  req.addEventListener('progress', streams.progress)
  req.addEventListener('error', ev => streams.error(req.response))
  req.addEventListener('abort', ev => streams.abort(req.response))
  if(os.query) {
    os.path += "?" + R.join('&', R.map(R.apply((key, val) => `${key}=${String(val)}`), R.toPairs(os.query)))
  }
  req.open(os.method, (os.url || '') + os.path, true)
  if(os.send && (os.send.constructor === Object || os.send.constructor === Array)) os.send = JSON.stringify(os.send)
  if(os.headers) {
    for(var key in os.headers) {
      req.setRequestHeader(key, os.headers[key])
    }
  }
  req.send(os.send)
  return streams
}

// Merge in configuration options with regular request options to make pre-configured requests
request.config = conf => options => request(
  R.merge(
    options
  , R.assoc('headers', R.merge(conf.headers, options.headers), conf)
  )
)


request.toFormData = obj => {
  let fd = new FormData()
  for(var key in obj) fd.append(key, obj[key])
  return fd
}

module.exports = request
