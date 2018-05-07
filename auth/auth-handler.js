const env = require('../environment/env')
const jwt = require('jsonwebtoken')
const sendmail = require('sendmail')()
const ms = require('ms')
const userModel = require('../models/user.model').getModel()

class AuthHandler {
  handleLogin(req, res, next) {
    const { username, password } = req.body

    userModel.findOne({ username }, (err, user) => {
      if (err) {
        return res.status(500).send({
          dev_message: 'internal server error',
          user_message: 'An internal server error occurred',
          status: 500
        })
      }

      if (!user) {
        return res.status(404).send({
          dev_message: 'account not found',
          user_message: 'That account could not be found, please make sure both your username and password are correct',
          status: 404
        })
      } else {
        user.comparePassword(password, (err, isMatch) => {
          if (isMatch) {
            res.cookie(env.COOKIE_NAME, jwt.sign({ username }, env.AUTH_SECRET_KEY), {
              maxAge: 3600000
            })

            res.status(200).send()
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
    if (!req.body.username || !req.body.password || !req.body.email) {
      return res.status(400).send({
        dev_message: 'missing fields',
        user_message: 'Please make sure you supply all fields',
        status: 400
      })
    }

    next()
  }

  initiatePasswordRequest(req, res, next) {
    const { email } = req.body

    const getResetPasswordLink = () => {
      const token = jwt.sign({ email }, env.AUTH_SECRET_KEY_FORGOTTEN_PASSWORD, {
        expiresIn: env.JWT_TOKEN_EXPIRATION / 1000
      })

      return req.protocol + "://" + req.get('host') + '/' + env.FORGOTTEN_PASSWORD_PAGE_URI + '?' + email + '&' + token
    }

    userModel.findOne({ email }, (err, user) => {
      if (err) {
        return res.status(500).send({
          dev_message: 'internal server error',
          user_message: 'An internal server error occurred',
          status: 500
        })
      }

      if (!email) {
        return res.status(404).send({
          dev_message: 'non existent email',
          user_message: 'That email does not exist. Please try again',
          status: 404
        })
      } else {
        sendmail({
          from: env.DOMAIN_EMAIL,
          to: email,
          subject: env.APP_NAME + ' - Password reset request',
          html: `
            <strong>Password Reset Request for ${env.APP_NAME}</strong>
            </br>
            <p>A request has been made on your account to reset your password. If this was you, please click the following link ${getResetPasswordLink()} (This link will expire in ${ms(env.JWT_TOKEN_EXPIRATION)})</p>
            </br>
            <p>If this request was not made by you, please ignore this email</p>`,
        }, (err, reply) => {
          if (err) {
            return res.status(400).send({
              dev_message: 'email account does not exist',
              user_message: 'The email address on your account doesn\'t seem to exist',
              status: 400
            })
          } else {
            res.status(200).send()
          }
        });
      }
    })
  }

  updatePassword(req, res, next) {
    const { email, password } = req.body

    userModel.findOne({ email }, (err, user) => {
      if (err) {
        return res.status(500).send({
          dev_message: 'internal server error',
          user_message: 'An internal server error occurred',
          status: 500
        })
      }

      if (!user) {
        return res.status(404).send({
          dev_message: 'account not found',
          user_message: 'That account could not be found, please make sure both your username and password are correct',
          status: 404
        })
      } else {
        user.resetPassword(password, (err, newPassword) => {
          if (err) {
            return res.status(500).send({
              dev_message: 'internal server error',
              user_message: 'An internal server error occurred',
              status: 500
            })
          }

          userModel.findOneAndUpdate({ email }, { $set: { password: newPassword } }, (err, doc) => {
            if (err) {
              return res.status(500).send({
                dev_message: 'internal server error',
                user_message: 'An internal server error occurred',
                status: 500
              })
            }

            return res.status(200).send
          })

          return res.status(200).send()
        })
      }
    })
  }

  checkAuthentication(req, res, next) {
    if (req.headers['authorization']) {
      req.token = req.headers['authorization']

      jwt.verify(req.token, env.AUTH_SECRET_KEY, err => {
        if (err) {
          return res.status(403).send({
            dev_message: 'invalid token',
            user_message: 'Invalid token provided',
            status: 403
          })
        } else {
          next()
        }
      })
    } else {
      res.status(403).send({
        dev_message: 'no token',
        user_message: 'No token provided',
        status: 403
      })
    }
  }

  checkAuthenticationForPasswordReset(req, res, next) {
    if (req.headers['authorization']) {
      req.token = req.headers['authorization']

      jwt.verify(req.token, env.AUTH_SECRET_KEY_FORGOTTEN_PASSWORD, err => {
        if (err) {
          return res.status(403).send({
            dev_message: 'invalid token',
            user_message: 'Invalid token provided',
            status: 403
          })
        } else {
          next()
        }
      })
    } else {
      res.status(403).send({
        dev_message: 'no token',
        user_message: 'No token provided',
        status: 403
      })
    }
  }
}

module.exports = new AuthHandler()