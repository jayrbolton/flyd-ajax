# flyd-ajax

A simple ajax library (using XMLHttpRequest) that returns **[flyd streams](https://github.com/paldepind/flyd)**.

- Small size
- FRP with flyd
- Supports mock requests for unit tests
- Supports error/progress/abort

Many of the options, terminology, and response objects are directly from the normal XMLHttpRequest API. See the [MDN Articles](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Handling_responses) on that topic for details around how to work with response and progress objects.

Example _GET_ request

```js
// Calling request(...) immediately makes the request
const response = request({
  method: 'GET'
, url: 'http://spacejam.com'
, path: '/'
, query: 'x=y' // data to send; must be text, FormData, or an object (objects get JSON.stringify-ed)
, headers: {'Content-Type': 'application/json'} // any number of header key/vals
, withCredentials: true // whether to send cookies
})

// The response object has four keys: .load, .error, .progress, and .abort
// Each of these keys holds a stream of request objects for the corresponding event
// Most of the time you will just use .load stream

const resp$ = request.load // flyd stream of request objects when the response is loaded
flyd.map(r => console.log('Response!', r.body, r.status), resp$)
```

Example _POST_ request

```js
request({
  method: 'post'
, path: '/users'
, send: {name: 'Finn Mertens', email: 'finn@ooo.com'} // Can be an Object, String, or FormData
})

// If you leave out url, it will post to the path on the current domain

// If you pass in Object into the .send property, it will convert it to a JSON string by default
```

## Returned streams

The request function immediately returns an object with a set of streams:

```js
// object that gets returned by the request function:
{
  load      // stream of a request object when the request is completed
, error     // stream of event object when the request cannot be completed due to some error
, progress  // stream of event object on progress events in the request
, abort     // stream of event object on aborted request event
}
```

Most of the time you will only need the `.load` stream -- error and progress are useful for file transfers.

Each of the above streams will emit the exact corresponding event or request objects as described here: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest

The `.load` stream will have a `.body` property, which will contain a parsed JS object of JSON data, if the response's had 'json' in its content type. Otherwise it will be a String.

You can map over any of these streams to work with the responses and events. Example usage:

```js
let getPosts = request({ method: 'GET' , path: '/posts' })
flyd.map(req => console.log('Completed request!', req.body), getPosts.load)
flyd.map(ev => console.log('Error event!', ev), getPosts.error)
flyd.map(ev => console.log('Progress event!', ev), getPosts.progress)
```

#### Configuration

One easy way to pre-configure ajax requests is to simply define your own module that wraps the request function.

```js
import request from 'flyd-ajax'
import R from 'ramda'
import flyd from 'flyd'

const apiRequest = (method, path, data) =>
  request({
    method
  , path
  , url: api_url
  , send: data
  , headers: {'Content-Type': 'application/json', 'X-CSRF-Token': 'xyz'}
  }).load

// Stream of post responses, could be failure or success
const response$ = apiRequest('post', '/users' {name: 'Finn Mertens'})

// Stream of user data
const createdUser$ = R.compose(
  flyd.map(r => r.body)
, flyd.filter(R.propEq('status', 200))
)(response$) 

// Stream of error messages from creating a user
const errorMessage$  = R.compose(
  flyd.map(r => r.body.error)
, flyd.filter(r => r.status !== 200)
)(response$)
```

## Development

### Test

Tests use zuul and assert

`npm run test`

### Build

Develop the `.es6` files and transpile them to `.js` with:

`npm run build`

# Mocking requests for tests

flyd-ajax comes with a built-in utility for mocking ajax requests for frontend unit testing. The require path is `flyd-ajax/mock`

_Example_:

```js
import assert from 'assert'
import request from 'flyd-ajax'
import mockRequest from 'flyd-ajax/mock'

suite('test an ajax call')

test('it handles some ajax', () => {
  mockRequest.setup() // This overwrites XMLHttpRequest

  const status = 201
  body = 'hi'
  mockRequest.handle('get', 'http://localhost:420/test', {status, body}) // mock a response from the server for a specific endpoint

  // Make the request as you normally would
  const resp = request({method: 'get', url: 'http://localhost:420', path: '/test'})
 
  // The request will be made synchronously and the response is immediately available
  assert.deepEqual(resp.load().body, {status, body})

  // Restore XMLHttpRequest
  mock.teardown()
})
```

Mock API:

* `setup()` -- Overwrite `window.XMLHttpRequest`
* `teardown()` -- Restore `window.XMLHttpRequest`
* `handle(method, url, responseObject)` -- Catch and handle requests to this endpoint

The `responseObject` can have these properties:

* `body` -- mock response body
* `headers` -- mock response headers
* `status` -- mock response status code
