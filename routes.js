const UserModel = require('./models/user.model').getModel()
const GameModel = require('./models/game.model').getModel()

const AuthHandler = require('./auth/auth-handler')

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

module.exports = routes