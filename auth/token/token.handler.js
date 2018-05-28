const jwt = require('jsonwebtoken')
const env = require('../../environment/env')
const moment = require('moment')

class TokenHandler {
  static verifyToken(authToken, refresh, req, res, next) {
    if (req.headers['authorization']) {
      req.token = req.headers['authorization']

      jwt.verify(req.token, authToken, (err, token) => {
        if (err) {
          return res.status(403).send({
            dev_message: 'invalid token',
            user_message: 'Invalid token provided',
            status: 403
          })
        } else {
          if (token && token.exp && refresh) {
            this.generateNewToken(token, res)
          }
          next()
        }
      })
    } else {
      return res.status(403).send({
        dev_message: 'no token',
        user_message: 'No token provided',
        status: 403
      })
    }
  }

  static generateNewToken(token, res) {
    if (moment(token.exp * 1000).fromNow() === 'in a few seconds') {
      res.cookie(env.COOKIE_NAME, this.signToken(token.data, env.AUTH_SECRET_KEY, env.JWT_TOKEN_EXPIRATION), {
        maxAge: env.JWT_TOKEN_EXPIRATION
      })
    }
  }

  static signToken(data, secretKey, expiry) {
    return jwt.sign({ data }, secretKey, {
      expiresIn: expiry ? expiry / 1000 : 86400
    })
  }
}

module.exports = TokenHandler