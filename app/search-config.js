// Use this file to change search configuration.

module.exports = {
  // paths to include in search
  // the search spider will follow links from these pages
  include: [
    '/'
  ],

  // paths to exclude in search, supports 'glob' syntax
  // for example:
  // exclude : ['/admin*']
  exclude: [
    '/',
    '**/filter-suppliers',
    '/store/**'
  ]

}
