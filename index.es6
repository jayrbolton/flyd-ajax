// A simple 
// Every call to .perform() returns a flyd stream
import flyd from 'flyd'
import R from 'ramda'

const request = os => {
  let streams = { load: flyd.stream() , progress: flyd.stream()  , error: flyd.stream() , abort: flyd.stream() }
  let req = new XMLHttpRequest() 
  req.addEventListener('load', ev => streams.load(req.response))
  req.addEventListener('progress', streams.progress)
  req.addEventListener('error', ev => streams.error(req.response))
  req.addEventListener('abort', ev => streams.abort(req.response))
  req.open(os.method, (os.prefix || '') + os.url, true)
  if(os.send.constructor === Object) os.send = JSON.stringify(os.send)
  for(var key in os.headers) req.setRequestHeader(key, os.headers[key])
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
