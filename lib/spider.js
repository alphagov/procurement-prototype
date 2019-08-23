// core dependencies
const { spawn } = require('child_process')
const fs = require('fs')

// npm dependencies
const puppeteer = require('puppeteer')

// Local dependencies

const config = require('../app/config.js')

const port = Number(process.env.PORT || config.port)

const dir = './screenshots'

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir)
}

const spider = async () => {

  console.log('starting spider')

  let urls = {
    todo: [
      'http://localhost:3000'
    ],
    done: []
  }

  const browser = await puppeteer.launch()

  const page = await browser.newPage()

  await page.setViewport({
    width: 1200,
    height: 1200
  })

  const openPage = async (urls) => {

    let url = urls.todo.pop()

    urls.done.push(url)

    console.log('openPage ' + url)

    const response = await page.goto(url)

    if (response._status == '200'){

      let filename = url.replace('http://localhost:3000','')
                        .replace(/\/$/, '')
                        .replace(/^\//, '')
                        .replace(/\//g, '--')

      if (filename == ''){
        filename = 'index'
      }

      console.log('screenshots/' + filename + '.png')

      await page.screenshot({path: 'screenshots/' + filename + '.png'})

      const pageHrefs = await page.evaluate(() => {
        let hrefs = [];
        let links = document.getElementsByTagName("a");
        for(let i=0, max=links.length; i<max; i++) {
            let href = links[i].href
            if (href.startsWith('http://localhost:3000') &&
                href.startsWith('http://localhost:3000/prototype-admin') === false){
              hrefs.push(links[i].href)
            }
        }
        return hrefs
      })

      console.log(pageHrefs)

      // only add new urls if they're not already done, and not a hash link
      for (let href of pageHrefs){
        if (urls.done.includes(href) == false && href.includes('#') == false){
          urls.todo.push(href)
        }
      }

      // De-duplicate urls
      urls.todo = [...new Set(urls.todo)]

    }

    if (urls.todo.length == 0){
      done()
    } else {
      openPage(urls)
    }
  }

  const done = async () => {

    await browser.close()

    process.kill(-prototypeKit.pid)
    process.exit()
  }

  openPage(urls)
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
