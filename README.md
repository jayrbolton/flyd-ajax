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
  load      // stream of a response object when the request is completed without errors
, error     // response object when the request gets an error
, progress  // stream of progress event objects
, abort     // stream with aborted response
}
```

You can map over any of these objects to work with the responses. Example usage:

```js
let getPosts = request({ method: 'GET' , path: '/posts' })
flyd.map(resp => console.log('Success!', resp.body), getPosts.load)
flyd.map(resp => console.log('Error!', resp.body), getPosts.error)
flyd.map(ev => console.log('Progress!', ev), getPosts.progress)
```

Responses are JSON.stringified if possible.

#### configuration

You can config a request function with request.config. This returns a new request function that has the given settings preset for all of its calls.

```js
const myCustomRequestFn = request.config({
  headers: {'X-CSRF-Token': csrf}
, url: 'http://url-to-prefix.com'
})
// all calls to myCustomRequestFn will have the above options preset

myCustomRequestFn({
  path: '/posts'
, send: 'x=y'
, headers: {'Content-Type': 'application/json'}
})
// This call will use the options from the original config, merged with the options we just provided (headers get merged with config headers as well)
```

#### toFormData

For convenience, you can convert plain JS objects to FormData objects using `request.toFormData(obj)`. This is useful for sending files.

## tests

Test server:

`node test/server.js`

Then in another term, run zuul server:

`npm run test`

