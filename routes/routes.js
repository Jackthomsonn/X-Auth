const UserModel = require('../models/user.model').getModel()

const AuthHandler = require('../auth/auth-handler')

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
    uri: '/auth/reset-password-request',
    model: UserModel,
    methods: [{
      name: 'post',
      handlers: [AuthHandler.initiatePasswordRequest]
    }]
  }, {
    uri: '/auth/update-password',
    model: UserModel,
    methods: [{
      name: 'post',
      handlers: [AuthHandler.checkAuthenticationForPasswordReset, AuthHandler.updatePassword]
    }]
  }
]

module.exports = routes