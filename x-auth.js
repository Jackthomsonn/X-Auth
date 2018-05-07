const routes = require('./routes/routes')
const env = require('./environment/env')
const mongoose = require('mongoose')

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
    env.FORGOTTEN_PASSWORD_PAGE_URI = props.forgottenPasswordPageUri
    env.JWT_TOKEN_EXPIRATION = props.jwtTokenExpiration
    env.SALT_WORK_FACTOR = props.saltWorkFactor
    env.PORT = props.port
    env.DATABASE_URI = props.databaseUri
  }

  apply(routeGenerator) {
    if (
      !env.APP_NAME ||
      !env.AUTH_SECRET_KEY ||
      !env.AUTH_SECRET_KEY_FORGOTTEN_PASSWORD ||
      !env.COOKIE_NAME ||
      !env.COOKIE_NAME_FORGOTTEN_PASSWORD ||
      !env.DOMAIN_EMAIL ||
      !env.FORGOTTEN_PASSWORD_PAGE_URL ||
      !env.JWT_TOKEN_EXPIRATION ||
      !env.PORT ||
      !env.SALT_WORK_FACTOR,
      !env.DATABASE_URI
    ) {
      throw new Error('You must set all the required properties for XAuth to begin installing')
    }
    mongoose.connect(env.DATABASE_URI)
    routes.forEach(route => routeGenerator.routes.push(route))
  }
}

module.exports = XAuth