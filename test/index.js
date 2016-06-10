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
      assert.deepEqual(r, "/get/x?q=1")
      done()
    }
  , resp$
  )
})

test('POST data', done => {
  const resp$ = request({
    method: "POST"
  , url: 'http://localhost:3333'
  , path: '/post/y'
  , send: {y: 1}
  }).load
  flyd.map(
    r => {
      assert.deepEqual(r, {y: 1})
      done()
    }
  , resp$
  )
})

