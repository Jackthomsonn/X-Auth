const mongoose = require('mongoose')
const UserModel = require('./models/user.model')
const GameModel = require('./models/game.model')

const { CheckAuthentication, HandleLogin, HandleRegistration } = require('./auth/auth-handler')
const { RouteGenerator } = require('./node_modules/dynamic-route-generator/build')
const { DynamicApiDocsPlugin } = require('./node_modules/dynamic-api-docs')

const instantiateApplication = app => {
  mongoose.connect('mongodb://localhost/test')

  const routes = [
    {
      uri: '/auth/login',
      model: UserModel,
      methods: [{
        name: 'post',
        handlers: [HandleLogin]
      }, {
        name: 'get'
      }]
    }, {
      uri: '/auth/register',
      model: UserModel,
      methods: [{
        name: 'post',
        handlers: [HandleRegistration]
      }]
    }, {
      uri: '/games',
      model: GameModel,
      methods: [{
        name: 'get',
        handlers: [CheckAuthentication]
      }, {
        name: 'post',
        handlers: [CheckAuthentication]
      }]
    }
  ]

  new RouteGenerator({
    routes: routes,
    app: app,
    baseUri: '/'
  })

  app.listen(8080)
}

module.exports = instantiateApplication