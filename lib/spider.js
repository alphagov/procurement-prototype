// Core dependencies
const { spawn } = require('child_process')
const fs = require('fs')

// npm dependencies
const minimatch = require("minimatch")
const puppeteer = require('puppeteer')

// Local dependencies
const config = require('../app/config.js')
const searchConfig = require('../app/search-config.js')

const port = Number(process.env.PORT || config.port)

const dir = './screenshots'

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir)
}

const spider = async () => {

  console.log('starting spider')

  let urls = {
    todo: searchConfig.include,
    done: []
  }

  let searchIndex = []

  const browser = await puppeteer.launch()

  const page = await browser.newPage()

  await page.setViewport({
    width: 1200,
    height: 1200
  })

  const openPage = async () => {

    let url = urls.todo.pop()

    urls.done.push(url)

    console.log('openPage ' + url)

    const response = await page.goto('http://localhost:3000' + url)

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

      const pageData = await page.evaluate(() => {

        // get links for spidering
        let pageData = {
          'hrefs': []
        }
        let links = document.getElementsByTagName("a")
        for(let i=0, max=links.length; i<max; i++) {
            let href = links[i].href
            if (href.startsWith('http://localhost:3000') &&
                href.startsWith('http://localhost:3000/prototype-admin') === false){
              pageData.hrefs.push(href.replace('http://localhost:3000',''))
            }
        }

        // get title and text content for search indexing
        pageData.title = document.title
        pageData.textContent = document.getElementById("main-content").textContent.replace(/\s+/g,' ')

        return pageData
      })

      console.dir(pageData)

      // only add new urls if they're not already done, and not a hash link
      for (let href of pageData.hrefs){
        if (urls.done.includes(href) == false && href.includes('#') == false){
          urls.todo.push(href)
        }
      }

      // De-duplicate urls
      urls.todo = [...new Set(urls.todo)]

      // Remove any urls that are excluded in search-config
      urls.todo = urls.todo.filter(function(url){

        console.log('exclude: ' + searchConfig.exclude)
        for (let rule of searchConfig.exclude){
          console.log('rule: ' + rule)
          if (minimatch(url, rule)){
            return false
          }
        }
        return true
      })

      // Add text content to search index
      searchIndex.push({
        'id': url,
        'title': pageData.title,
        'body': pageData.textContent
      })

    }

    if (urls.todo.length == 0){
      done()
    } else {
      openPage(urls)
    }
  }

  const done = async () => {

    // remove any urls that are in the search config exclude list
    // for example, we want the spider to start at / but we don't want / in
    // the search results

    searchIndex = searchIndex.filter(function(item){
      for (let rule of searchConfig.exclude){
        if (minimatch(item.id, rule)){
          return false
        }
      }
      return true
    })

    fs.writeFileSync('app/data/search-index.json', JSON.stringify(searchIndex, null, '  '))

    await browser.close()

    process.kill(-prototypeKit.pid)
    process.exit()
  }

  openPage()
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
