const express = require('express')
const router = express.Router()

const taxonomy = require('./data/taxonomy')

// Add your routes here - above the module.exports line

router.use(function(request, response, next){
  response.locals.taxonomy = taxonomy
  next()
})

module.exports = router
