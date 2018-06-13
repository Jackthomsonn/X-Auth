const mongoose = require('mongoose')
const routes = require('./routes/routes')
const env = require('./environment/env')

const AuthHandler = require('./auth/auth-handler')

class XAuth {
  static install(event) {
    event.emit('Plugin Installed', this)
  }

  static setupProps(props) {
    env.APP_NAME = props.appName
    env.AUTH_SECRET_KEY = props.authSecretKey
    env.AUTH_SECRET_KEY_FORGOTTEN_PASSWORD = props.authSecretKeyForgottenPassword
    env.COOKIE_NAME = props.cookieName
    env.COOKIE_NAME_FORGOTTEN_PASSWORD = props.cookieNameForgottenPassword
    env.DOMAIN_EMAIL = props.domainEmail
    env.JWT_TOKEN_EXPIRATION = props.jwtTokenExpiration
    env.SALT_WORK_FACTOR = props.saltWorkFactor
    env.DATABASE_URI = props.databaseUri
    env.EMAIL_VERIFICATION = props.emailVerification
    env.PASSWORD_STRENGTH = props.passwordStrength

    // Optionals
    env.TEXT_MAGIC_USERNAME = props.textMagicUsername
    env.TEXT_MAGIC_TOKEN = props.textMagicToken
    env.VERIFICATION_PAGE_TEMPLATE = props.verificationPageTemplate
    env.FORGOTTEN_PASSWORD_PAGE_TEMPLATE = props.forgottenPasswordPagetemplate
    env.THEME_COLOUR = props.themeColour
  }

  apply(routeGenerator) {
    try {
      if (!env.APP_NAME) {
        throw ('appName')
      } else if (!env.AUTH_SECRET_KEY) {
        throw ('authSecretKey')
      } else if (!env.AUTH_SECRET_KEY_FORGOTTEN_PASSWORD) {
        throw ('authSecretKeyForgottenPassword')
      } else if (!env.COOKIE_NAME) {
        throw ('cookieName')
      } else if (!env.COOKIE_NAME_FORGOTTEN_PASSWORD) {
        throw ('cookieNameForgottenPassword')
      } else if (!env.DOMAIN_EMAIL) {
        throw ('domainEmail')
      } else if (!env.JWT_TOKEN_EXPIRATION) {
        throw ('jwtTokenExpiration')
      } else if (!env.SALT_WORK_FACTOR) {
        throw ('saltWorkFactor')
      } else if (!env.DATABASE_URI) {
        throw ('databaseUri')
      } else if (!env.EMAIL_VERIFICATION.toString()) {
        throw ('emailVerification')
      } else if (!env.PASSWORD_STRENGTH) {
        throw ('passwordStrength')
      }
    } catch (property) {
      throw new Error(`You must set all the required properties for XAuth to begin installing. Missing: ${property}`)
    }
    mongoose.connect(env.DATABASE_URI)
    routes.forEach(route => routeGenerator.routes.push(route))
  }
}

module.exports = {
  XAuth: XAuth,
  CheckAuthentication: AuthHandler.checkAuthentication
}