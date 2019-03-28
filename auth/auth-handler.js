const env = require('../environment/env')
const TokenHandler = require('./token/token.handler')
const ProfileHandler = require('./profile/profile.handler')
const LoginHandler = require('./login/login.handler')
const RegisterHandler = require('./register/register.handler')
const TwoFactorAuthenticationHandler = require('./two-factor/two-factor.handler')
const ForgottenPasswordHandler = require('./forgot-password/forgot-password.handler')
const ChangePasswordHandler = require('./change-password/change-password.handler')

class AuthHandler {
  handleLogin(req, res, next) {
    LoginHandler.login(req, res, next)
  }

  getProfile(req, res, next) {
    ProfileHandler.getProfile(req, res, next)
  }

  updateProfile(req, res, next) {
    ProfileHandler.updateProfile(req, res, next)
  }

  handleTwoFactorAuthentication(req, res, next) {
    TwoFactorAuthenticationHandler.authenticate(req, res, next)
  }

  handleRegistration(req, res, next) {
    RegisterHandler.handleRegistration(req, res, next)
  }

  verifyEmail(req, res, next) {
    RegisterHandler.verifyEmail(req, res, next)
  }

  verifyEmailChange(req, res, next) {
    RegisterHandler.verifyEmailChange(req, res, next)
  }

  verifyPhoneNumberChange(req, res, next) {
    RegisterHandler.verifyPhoneNumberChange(req, res, next)
  }

  initiatePasswordResetRequest(req, res, next) {
    ForgottenPasswordHandler.initiatePasswordResetRequest(req, res, next)
  }

  updatePassword(req, res, next) {
    ForgottenPasswordHandler.updatePassword(req, res, next)
  }

  changePassword(req, res, next) {
    ChangePasswordHandler.changePassword(req, res, next)
  }

  checkAuthentication(req, res, next) {
    TokenHandler.verifyToken(env.AUTH_SECRET_KEY, req, res, next)
  }

  checkAuthenticationForPasswordReset(req, res, next) {
    TokenHandler.verifyToken(env.AUTH_SECRET_KEY_FORGOTTEN_PASSWORD, req, res, next)
  }

  checkAuthenticationForProfileUpdate(req, res, next) {
    const token = req.url.split('&')[2];

    req.headers = {
      authorization: `Bearer ${token}`
    }

    TokenHandler.verifyToken(env.UPDATE_PROFILE_JWT_KEY, req, res, next)
  }

  getRefreshToken(req, res, next) {
    TokenHandler.getRefreshToken(req.body.token, res, next)
  }
}

module.exports = new AuthHandler()