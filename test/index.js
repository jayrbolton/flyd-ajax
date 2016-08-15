var assert = require('assert')
var R = require("ramda")
var flyd = require("flyd")

var request = require('../')

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

