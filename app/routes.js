const express = require('express')
const router = express.Router()

const taxonomy = require('./data/taxonomy')
const filters = require('./filters')()

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

module.exports = router
