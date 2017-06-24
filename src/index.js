const kefir = require('kefir')
const sum = (a, b) => a+b
const moment = require('moment')
const pretty = require('pretty-ms')
const interval = 1000


// -> KefirStream<Moment>
function momentS () {
  // Returns a stream of moment objecs
  return kefir.fromPoll(interval, moment)
}


// KefirStream<Moment> -> KefirStream<String>
function elapsedS (mS) {
  // takes a stream of moments,
  // returns a stream of strings describing durations
  return mS
    .map(m => interval)
    .scan(sum)
    .map(pretty)
}


// KefirStream<Moment> -> KefirStream<Number>
function resetS (mS, time) {
  // takes a stream of moments,
  // returns a stream of 1, when time should reset
  return mS
    .filter(m => m > time)
}


// [Moment, Object] -> KefirStream<String>
function uptimeS (resetMoment, modulo) {
  // Returns a stream of strings,
  // where each string is a duration of the form
  //
  //   12h 5d 1s
  //
  // etc.
  // These strings will reset (i.e. go back to 0s)
  // at `resetMoment`. After `resetMoment`, it will
  // count up again until `modulo` time after.
  //
  // Both arguments can be omitted.
  // By defualt, the stream will count up
  // until midnight (start of next day),
  // at which point it will reset until the following midnight.
  if (!resetMoment)
    resetMoment = moment().endOf('day')
  if (!modulo)
    modulo = { days: 1 }
  let mS = momentS()
  let rS = resetS(mS, resetMoment)
  let newUptimeS = rS.flatMap(_ => {
    let newResetMoment = resetMoment.add(modulo)
    return uptimeS(newResetMoment, modulo)
  })
  let upS = elapsedS(mS)
      .takeUntilBy(newUptimeS)
  return kefir.merge([
    upS,
    newUptimeS,
  ])
}

module.exports = uptimeS
