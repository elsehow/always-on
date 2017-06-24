const kefir = require('kefir')
const sum = (a, b) => a+b
const moment = require('moment')
const pretty = require('pretty-ms')
const interval = 1000
const truthy = x => !!x


function elapsedS () {
  return kefir
    .interval(interval, interval)
    .scan(sum)
    .map(pretty)
}


// Moment -> KefirStream
function resetS (time) {
  return kefir.fromPoll(1000, function  () {
    if (moment() > time)
      return 1
    return
  }).filter(truthy)
}


function uptimeS (resetMoment, modulo) {
  if (!resetMoment) {
    let resetMoment = moment().endOf('day')
  }
  if (!modulo) {
    let modulo = { days: 1 }
  }
  let rS = resetS(resetMoment)
  let newUptimeS = rS.flatMap(_ => {
    let newResetMoment = resetMoment.add(modulo)
    return uptimeS(newResetMoment)
  })
  let upS = elapsedS().takeUntilBy(newUptimeS)
  return kefir.merge([
    upS,
    newUptimeS,
  ])
}

module.exports = uptimeS
