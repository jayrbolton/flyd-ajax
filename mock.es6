import R from 'ramda'

// Mock ajax requests for flyd-ajax

let handlers = {}
let cachedXMLHttpRequest = null

// Catch a request to a url and mock the response
function handle(method, url, resp) {
  handlers[method.toLowerCase() + ' ' + url] = resp
}

// Overwrite XMLHttpRequest
function setup() {
  cachedXMLHttpRequest = window.XMLHttpRequest
  window.XMLHttpRequest = function() {
    this.headers = {}
    this.body = ''
    this.response = ''
    this.eventListeners = {}
    return this
  }

  window.XMLHttpRequest.prototype.addEventListener = function(name, fn) {
    this.eventListeners[name] = fn
    return this
  }

  window.XMLHttpRequest.prototype.getResponseHeader = function(name, fn) {
    return this.headers[name]
  }

  // No-op
  window.XMLHttpRequest.prototype.setRequestHeader = function(name, val) {
    return this
  }

  window.XMLHttpRequest.prototype.send = function(strData) {
    const handler = handlers[this.method + ' ' + this.url]
    if(!handler) return
    const result = handler
    this.body = result.body
    this.headers = R.merge(this.headers, result.headers || {})
    this.status = result.status
    this.eventListeners.load()
    return this
  }

  window.XMLHttpRequest.prototype.open = function(method, url, bool) {
    this.method = method.toLowerCase()
    this.url = url
    return this
  }
}

function teardown() {
  window.XMLHttpRequest = cachedXMLHttpRequest
}


module.exports = {handle, setup, teardown}

