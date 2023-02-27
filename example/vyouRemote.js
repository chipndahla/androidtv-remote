import { AndroidRemote, RemoteKeyCode, RemoteDirection } from 'androidtv-remote'

import fs from 'fs'

import Readline from 'readline'

let line = Readline.createInterface({
  input: process.stdin,
  output: process.stdout
})
const certFileName = 'cert.bin'
let host = '192.168.0.231'
let options = {
  pairing_port: 6467,
  remote_port: 6466,
  name: 'vyou-androidtv',
  cert: fs.existsSync(certFileName) ? JSON.parse(fs.readFileSync(certFileName)) : undefined
}

let androidRemote = new AndroidRemote(host, options)

androidRemote.on('secret', () => {
  line.question('Code : ', async code => {
    androidRemote.sendCode(code)
  })
})

androidRemote.on('powered', powered => {
  console.debug('Powered : ' + powered)
})

androidRemote.on('volume', volume => {
  console.debug(
    'Volume : ' +
      volume.level +
      '/' +
      volume.maximum +
      ' | Muted : ' +
      volume.muted
  )
})

androidRemote.on('current_app', current_app => {
  console.debug('Foreground App : ' + current_app)
})

androidRemote.on('error', error => {
  console.error('Error : ' + error)
})

androidRemote.on('unpaired', () => {
  console.error('Unpaired')
})

androidRemote.on('ready', async () => {
  await new Promise(resolve => setTimeout(resolve, 2000))

  let cert = androidRemote.getCertificate()
  fs.writeFileSync(certFileName, JSON.stringify(cert))
  /*
    androidRemote.sendKey(RemoteKeyCode.KEYCODE_0, RemoteDirection.START_LONG)
    await new Promise(resolve => setTimeout(resolve, 100));
    androidRemote.sendKey(RemoteKeyCode.KEYCODE_0, RemoteDirection.END_LONG)

  
    */

  await new Promise(resolve => setTimeout(resolve, 1000))
  const appLink = 'https://play.google.com/store/apps/details?id=com.spotify.tv.android'
  console.log('Starting app',appLink)
  androidRemote.sendAppLink(appLink)
  await new Promise(resolve => setTimeout(resolve, 2000))
  androidRemote.sendKey(RemoteKeyCode.HOME, RemoteDirection.SHORT)
})

let started = await androidRemote.start()
