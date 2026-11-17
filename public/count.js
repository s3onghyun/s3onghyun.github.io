// GoatCounter client, self-hosted to avoid third-party script blocking.
// Based on https://gc.zgo.at/count.js (ISC license).
;(function () {
  'use strict'

  var script = document.querySelector('script[data-goatcounter]')
  var endpoint = script && script.dataset.goatcounter
  if (!endpoint) return

  var empty = function (value) { return value === null || value === undefined || typeof value === 'function' }
  var path = function () {
    var canonical = document.querySelector('link[rel="canonical"][href]')
    var locationToUse = location
    if (canonical) {
      var link = document.createElement('a')
      link.href = canonical.href
      if (link.hostname.replace(/^www\./, '') === location.hostname.replace(/^www\./, '')) locationToUse = link
    }
    return (locationToUse.pathname + locationToUse.search) || '/'
  }
  var encode = function (data) {
    var params = []
    for (var key in data) {
      if (data[key] !== '' && data[key] !== null && data[key] !== undefined && data[key] !== false) {
        params.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
      }
    }
    return '?' + params.join('&')
  }
  var isBot = function () {
    if (navigator.webdriver) return 153
    return 0
  }
  var count = function (vars) {
    vars = vars || {}
    if (location.hash === '#toggle-goatcounter') {
      if (localStorage.getItem('skipgc') === 't') localStorage.removeItem('skipgc')
      else localStorage.setItem('skipgc', 't')
    }
    if (localStorage.getItem('skipgc') === 't') return
    if (location !== parent.location) return
    if (location.hostname.match(/(localhost$|^127\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\.|^192\.168\.|^0\.0\.0\.0$)/)) return

    var data = {
      p: empty(vars.path) ? path() : vars.path,
      r: empty(vars.referrer) ? document.referrer : vars.referrer,
      t: empty(vars.title) ? document.title : vars.title,
      s: window.screen.width,
      b: isBot(),
      q: location.search,
      e: !!vars.event,
      rnd: Math.random().toString(36).slice(2, 7),
    }
    var url = endpoint + encode(data)
    if (!navigator.sendBeacon || !navigator.sendBeacon(url)) {
      var image = document.createElement('img')
      image.src = url
      image.width = 1
      image.height = 1
      image.alt = ''
      image.setAttribute('aria-hidden', 'true')
      image.style.cssText = 'bottom:0;height:1px;position:absolute;width:1px'
      document.body.appendChild(image)
    }
  }

  window.goatcounter = window.goatcounter || {}
  window.goatcounter.count = count
  var onLoad = function () {
    if (!document.hidden) count()
    else document.addEventListener('visibilitychange', function visible () {
      if (document.hidden) return
      document.removeEventListener('visibilitychange', visible)
      count()
    })
  }
  if (document.body) onLoad()
  else document.addEventListener('DOMContentLoaded', onLoad)
})()
