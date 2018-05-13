const env = require('../environment/env')

const TokenHandler = require('./token/token.handler')
const LoginHandler = require('./login/login.handler')
const RegisterHandler = require('./register/register.handler')
const TwoFactorAuthenticationHandler = require('./two-factor/two-factor.handler')
const ForgottenPasswordHandler = require('./forgot-password/forgot-password.handler')

class AuthHandler {
  handleLogin(req, res) {
    new LoginHandler(req, res)
  }

  handleTwoFactorAuthentication(req, res) {
    new TwoFactorAuthenticationHandler(req, res)
  }

  handleRegistration(req, res, next) {
    RegisterHandler.handleRegistration(req, res, next)
  }

  verifyEmail(req, res) {
    RegisterHandler.verifyEmail(req, res)
  }

  initiatePasswordResetRequest(req, res) {
    ForgottenPasswordHandler.initiatePasswordResetRequest(req, res)
  }

  updatePassword(req, res) {
    ForgottenPasswordHandler.updatePassword(req, res)
  }

  checkAuthentication(req, res, next) {
    TokenHandler.verifyToken(env.AUTH_SECRET_KEY, req, res, next)
  }

  checkAuthenticationForPasswordReset(req, res, next) {
    TokenHandler.verifyToken(env.AUTH_SECRET_KEY_FORGOTTEN_PASSWORD, req, res, next)
  }
}

module.exports = new AuthHandler()