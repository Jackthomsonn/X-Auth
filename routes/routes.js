const UserModel = require('../models/user.model').getModel()
const TwoFactorModel = require('../models/two-factor.model').getModel()

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
    uri: '/auth/login/authenticate',
    model: TwoFactorModel,
    methods: [{
      name: 'post',
      handlers: [AuthHandler.handleTwoFactorAuthentication]
    }]
  }, {
    uri: '/auth/verify',
    model: UserModel,
    methods: [{
      name: 'get',
      handlers: [AuthHandler.verifyEmail]
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
      handlers: [AuthHandler.initiatePasswordResetRequest]
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