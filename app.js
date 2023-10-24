const express = require('express')
const { configureApp, appContext } = require('saxa')

const app = express()

configureApp(app, {
  views: 'templates',   // Set views directory
  static: 'public',     // Set static assets directory
})

app.use(appContext())

// import routes
const index = require('./routes/index')

// set routes
app.use('/', index)

module.exports = () => app
