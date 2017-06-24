const uptimeS = require('./src/index.js')
const menubar = require('menubar')

const mb = menubar()

mb.on('ready', function ready () {
  mb.showWindow()
})

mb.on('after-create-window', function () {
  uptimeS().onValue(time => {
    mb.window.webContents.send('time', time)
  })
})
