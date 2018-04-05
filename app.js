const app = require('express')()
const mongoose = require('mongoose')

const { RouteGenerator } = require('dynamic-route-generator')

const routes = require('./routes')

const instantiateApplication = () => {
  mongoose.connect('mongodb://localhost/test')

  new RouteGenerator({
    routes,
    app,
    baseUri: '/'
  })

  app.listen(8080)
}

module.exports = instantiateApplication