const app = require('express')()
const mongoose = require('mongoose')

const UserModel = require('./models/user.model')
const GameModel = require('./models/game.model')

const AuthHandler = require('./auth/auth-handler')

const { RouteGenerator } = require('dynamic-route-generator')
const { DynamicApiDocsPlugin } = require('dynamic-api-docs')

const instantiateApplication = () => {
  mongoose.connect('mongodb://localhost/test')

  const routes = [
    {
      uri: '/auth/login',
      model: UserModel,
      methods: [{
        name: 'post',
        handlers: [AuthHandler.handleLogin]
      }]
    }, {
      uri: '/auth/register',
      model: UserModel,
      methods: [{
        name: 'post',
        handlers: [AuthHandler.handleRegistration]
      }]
    }, {
      uri: '/games',
      model: GameModel,
      methods: [{
        name: 'get',
        handlers: [AuthHandler.checkAuthentication]
      }, {
        name: 'post',
        handlers: [AuthHandler.checkAuthentication]
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