const express = require('express')
const router = express.Router()
const lunr = require('lunr')

const searchIndex = require('./data/search-index')
const taxonomy = require('./data/taxonomy')
const filters = require('./filters')()

// build search

let lunrIndex = lunr(function () {
  this.ref('id')
  this.field('title', { boost: 2 })
  this.field('body')
  this.metadataWhitelist = ['position']

  searchIndex.forEach(function (page) {
    this.add(page)
  }, this)
})

// make index hash - faster to find pages by url

let searchIndexHash = {}

for (let page of searchIndex){
  searchIndexHash[page.id] = page
}

// Add your routes here - above the module.exports line

router.use(function(request, response, next){
  response.locals.taxonomy = taxonomy
  next()
})

router.get("/browse/:category", function (request, response, next){

  function searchTree(element, slug){
     if (filters.toSlug(element.name) == slug){
       return element
     } else if (element.children != null){
          let i
          let result = null
          for(let i=0; result == null && i < element.children.length; i++){
               result = searchTree(element.children[i], slug);
          }
          return result
     }
     return null
  }

  response.locals.category = searchTree(taxonomy, request.params.category)

  response.render('browse')

})

router.get('/search', function(request, response, next){

  let searchTerm = request.query.q

  let lunrResults = lunrIndex.search(searchTerm)

  // Process Lunr results into something we can display

  let searchResults = []

  for (let lunrResult of lunrResults){
    let page = searchIndexHash[lunrResult.ref]
    let result = {
      title: page.title.replace(' - GOV.UK Public Procurement', ''),
      href: page.id
    }
    searchResults.push(result)
  }

  response.locals.searchTerm = searchTerm
  response.locals.searchResults = searchResults

  response.render('search')

})

module.exports = router
