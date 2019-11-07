// Use this file to change search configuration.

module.exports = {
  // paths to include in search
  // the search spider will follow links from these pages
  include: [
    '/',
    '/framework/management-consultancy-framework'
  ],

  // paths to exclude in search
  // supports 'glob' syntax, for example:
  // exclude : ['/admin*']
  exclude: [
    '**/filter-suppliers',
    '**/agreement',
    '**/suppliers',
    '/store/**'
  ],

  // paths to remove from the finished search index:
  // pages you want to spider, but not include in search results
  // supports 'glob' syntax, for example:
  // remove : ['/']
  remove: [
    '/'
  ]

}
