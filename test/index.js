import assert from 'assert'
import R from 'ramda'
import flyd from 'flyd'
import request from '../index.es6'
import mock from '../mock.es6'

test('GET request', done => {
  const resp$ = request({
    method: "GET"
  , url: 'http://localhost:3333'
  , path: '/get/x'
  , query: {q: 1}
  }).load
  flyd.map(
    r => {
      assert.deepEqual(r.response, "/get/x?q=1")
      done()
    }
  , resp$
  )
})

test('POST data (with config)', done => {
  const resp$ = request.config({
    send: {x: 1}
  , headers: {'Content-Type': 'application/json'}
  })({
    method: "POST"
  , url: 'http://localhost:3333'
  , path: '/post/y'
  , send: {y: 1}
  }).load
  flyd.map(
    r => {
      assert.deepEqual(r.body, {y: 1})
      done()
    }
  , resp$
  )
})

suite('.toFormData')

test("it converts a plain object into a FormData object", () => {
  const obj = {x: 1, y: 2}
  let fd = request.toFormData(obj)
  assert.equal(fd.get('x'), '1')
  assert.equal(fd.get('y'), '2')
})


suite('mock')
const url = 'http://localhost:420'
const method = 'get'

test('sets the body of the response', () => {
  mock.setup()
  const body = {x:1, y: 2}
  mock.handle('get', 'http://localhost:420/test', {body})
  const load$ = request({method, url, path: '/test'}).load
  assert.deepEqual(load$().body, body)
  mock.teardown()
})

test('sets the headers of the response', () => {
  mock.setup()
  const headers = {x:1, y: 2}
  mock.handle('get', 'http://localhost:420/test', {headers})
  const load$ = request({method, url, path: '/test'}).load
  assert.deepEqual(load$().getResponseHeader('x'), headers.x)
  mock.teardown()
})

test('sets the status of the response', () => {
  mock.setup()
  const status = 201
  mock.handle('get', 'http://localhost:420/test', {status})
  const load$ = request({method, url, path: '/test'}).load
  assert.deepEqual(load$().status, status)
  mock.teardown()
})

test('it does not catch calls it does not handle', () => {
  mock.setup()
  const status = 201
  mock.handle('get', 'http://localhost:420/test', {status})
  const load$ = request({method, url, path: '/nope', headers: {'Accept': 'application/json'}}).load
  assert.deepEqual(load$(), undefined)
  mock.teardown()
})

