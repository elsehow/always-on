const moment = require('moment')
const uptimeS = require('../src/index.js')
const test = require('tape')

test('counts duration, resets', t => {
  const resetTime = moment().add(3, 'seconds')
  const modulo = { seconds: 3 }
  const s = uptimeS(resetTime, modulo)
  let resetCount = 0
  function check (str) {
    t.ok(str, str)
    if (str === '1s') {
      resetCount+=1
      if (resetCount == 3) {
        t.ok(str, 'resets multiple times')
        s.offValue(check)
        t.end()
      }
      else
        t.ok(str, 'resets')
    }
  }
  s.onValue(check)
})
