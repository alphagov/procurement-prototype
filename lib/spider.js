// core dependencies
const { spawn } = require('child_process')

// npm dependencies
const puppeteer = require('puppeteer')

// Local dependencies

const config = require('../app/config.js')

const port = Number(process.env.PORT || config.port)

const spider = async () => {
  console.log('starting spider')
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setViewport({
    width: 1200,
    height: 1200
  })
  await page.goto('http://localhost:3000')
  await page.screenshot({path: 'example.png'})

  await browser.close()

  process.kill(-prototypeKit.pid)
  process.exit()
}

const prototypeKit = spawn('npm', ['start'], {detached: true})

prototypeKit.stdout.on('data', (data) => {
  console.log(''+data)
  if (data.indexOf('Listening') != -1){
    spider()
  }
})

prototypeKit.stderr.on('data', (data) => {
  console.error(''+data)
});
