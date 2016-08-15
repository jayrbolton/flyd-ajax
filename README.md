A simple ajax library (a wrapper around XMLHttpRequest) that has an FRP API using [flyd](https://github.com/paldepind/flyd)

- Small size
- Allows preconfiguration of ajax options (including headers, url)
- Returns flyd streams of responses, including load/error/progress/abort

Many of the options, terminology, and response objects are directly from the normal XMLHttpRequest API. See the [MDN Articles](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Handling_responses) on that topic for details around how to work with response and progress objects.

```js
// options
request({
  method: 'GET'
, url: 'http://spacejam.com'
, path: '/'
, send: 'x=y' // data to send; must be text, FormData, or an object (objects get JSON.stringify-ed)
, headers: {'Content-Type': 'application/json'} // any number of header key/vals
})
```

## Returned streams

The request function immediately returns an object with a set of streams:

```js
// object that gets returned by the request function:
{
  load      // stream of a response object when the request is completed
, error     // response object when the request gets an error
, progress  // stream of progress event objects
, abort     // stream with aborted response
}
```

Each of the above streams will emit the exact corresponding event or request objects as described here: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest

**Bonus**: The `.load` stream will have a `.body` property, which will contain a parsed JS object of JSON data, if the response's header had 'json' in it.

You can map over any of these streams to work with the responses and events. Example usage:

```js
let getPosts = request({ method: 'GET' , path: '/posts' })
flyd.map(req => console.log('Completed request!', req.body), getPosts.load)
flyd.map(ev => console.log('Error event!', ev), getPosts.error)
flyd.map(ev => console.log('Progress event!', ev), getPosts.progress)
```

#### configuration

You can configure a request function with request.config. This returns a new request function that has the given settings preset for all of its calls. The presets will merge into any data passed in afterwards.

```js
const myCustomRequestFn = request.config({
  headers: {'X-CSRF-Token': csrf}
, send: {defaultSendData: 'xyz'}
, url: 'http://url-to-prefix.com'
})
// all calls to myCustomRequestFn will have the above options preset, and the above settings will get merged into any options with R.merge(config, newOptions)

myCustomRequestFn({
  path: '/posts'
, send: 'x=y'
, headers: {'Content-Type': 'application/json'}
})
// This call will use the options from the original config, merged with the options we just provided (headers get merged with config headers as well)
// The send property will get overridden
```

#### toFormData

For convenience, you can convert plain JS objects to FormData objects using `request.toFormData(obj)`. This is useful for sending files.

## tests

Test server:

`node test/server.js`

Then in another term, run zuul server:

`npm run test`

