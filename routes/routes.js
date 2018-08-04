const UserModel = require('../models/user.model').getModel()
const TwoFactorModel = require('../models/two-factor.model').getModel()
const RefreshTokenModel = require('../models/refresh-token.model').getModel()

const AuthHandler = require('../auth/auth-handler')

const env = require('../environment/env')

const routes = [
  {
    uri: '/auth/login', // Handles login at the API level
    model: UserModel,
    methods: [{
      name: 'post',
      handlers: [AuthHandler.handleLogin]
    }]
  }, {
    uri: '/auth/login/authenticate', // Handles two factor login at the API level
    model: TwoFactorModel,
    methods: [{
      name: 'post',
      handlers: [AuthHandler.handleTwoFactorAuthentication]
    }]
  }, {
    uri: '/auth/verify', // Handles verification from email and redirects to applications base location
    model: UserModel,
    methods: [{
      name: 'get',
      handlers: [AuthHandler.verifyEmail]
    }]
  }, {
    uri: '/auth/register', // Handles registration at the API level
    model: UserModel,
    methods: [{
      name: 'post',
      handlers: [AuthHandler.handleRegistration]
    }]
  }, {
    uri: '/auth/reset-password-request', // Handles reset password request at the API level
    model: UserModel,
    methods: [{
      name: 'post',
      handlers: [AuthHandler.initiatePasswordResetRequest]
    }]
  }, {
    uri: '/auth/update-password', // Handles update password at the API level
    model: UserModel,
    methods: [{
      name: 'post',
      handlers: [AuthHandler.checkAuthenticationForPasswordReset, AuthHandler.updatePassword]
    }]
  },
  {
    uri: '/auth/refreshtoken', // Gets a refresh token
    model: RefreshTokenModel,
    methods: [{
      name: 'post',
      handlers: [AuthHandler.getRefreshToken]
    }]
  },
  {
    uri: '/auth/forgotten-password', // Handles at the API Level
    model: UserModel,
    methods: [{
      name: 'get'
    }]
  },
  {
    uri: '/auth/change-password', // Handles change password at the API level
    model: UserModel,
    methods: [{
      name: 'post',
      handlers: [AuthHandler.changePassword]
    }]
  }
]

module.exports = routes