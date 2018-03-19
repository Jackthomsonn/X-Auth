const env = require('../env')
const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')

class AuthHandler {
  handleLogin(req, res) {
    const username = req.body.username
    const password = req.body.password

    userModel.findOne({ username: username }, (err, user) => {
      if (err) {
        return res.status(500).send({
          dev_message: 'internal server error',
          user_message: 'An internal server error was found',
          status: 500
        })
      }

      if (!user) {
        return res.status(404).send({
          dev_message: 'auth error',
          user_message: 'That account could not be found, please make sure both your username and password are correct',
          status: 404
        })
      } else {
        user.comparePassword(password, (err, isMatch) => {
          if (isMatch) {
            res.cookie(env.COOKIE_NAME, jwt.sign({ user: user.username }, env.AUTH_SECRET_KEY), {
              maxAge: 3600000
            })

            return res.status(200).send()
          } else {
            return res.status(404).send({
              dev_message: 'auth error',
              user_message: 'That account could not be found, please make sure both your username and password are correct',
              status: 404
            })
          }
        })
      }
    })
  }

  handleRegistration(req, res, next) {
    if (!req.body.username || !req.body.password) {
      return res.status(400).send({
        dev_message: 'missing fields',
        user_message: 'Please make sure you supply all fields',
        status: 400
      })
    }

    next()
  }

  checkAuthentication(req, res, next) {
    if (req.headers['authorization']) {
      req.token = req.headers['authorization']

      jwt.verify(req.token, env.AUTH_SECRET_KEY, err => {
        if (err) {
          return res.status(403).send({
            message: 'Invalid Token',
            reason: 'The token provided is not valid'
          })
        } else {
          next()
        }
      })
    } else {
      res.status(403).send({
        message: 'No Token',
        reason: 'No token provided'
      })
    }
  }
}

module.exports = new AuthHandler()