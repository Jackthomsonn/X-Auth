const userModel = require('../../models/user.model').getModel()
const event = require('../../events')
const env = require('../../environment/env')
const ms = require('ms')
const sendmail = require('sendmail')()
const utils = require('../../utils')
const TokenHandler = require('../token/token.handler')

class RegisterHandler {
  static handleRegistration(req, res, next) {
    const { username, password, email } = req.body
    const token = TokenHandler.signToken(email, env.AUTH_SECRET_KEY, env.JWT_TOKEN_EXPIRATION)

    let called = false

    if (!username || !password || !email) {
      return res.status(400).send({
        dev_message: 'missing fields',
        user_message: 'Please make sure you supply all fields',
        status: 400
      })
    }

    req.body.verificationToken = token

    next()

    event.on('registration-complete', () => {
      const url = utils.buildUrlQuery(req, env.VERIFICATION_PAGE_URI, [`email=${email}`, `${token}`])

      if (!called) {
        sendmail({
          from: env.DOMAIN_EMAIL,
          to: email,
          subject: env.APP_NAME + ' - Verify account',
          html: `
          <p>Please verify your account by clicking on the following link ${url}</p>
          
          <p>(This link will expire in ${ms(env.JWT_TOKEN_EXPIRATION)})</p>`
        }, err => {
          if (err) {
            return res.status(400).send({
              dev_message: 'email account does not exist',
              user_message: 'The email address on your account doesn\'t seem to exist',
              status: 400
            })
          } else {
            next(null)
          }
        })

        called = !called
      }
    })
  }

  static verifyEmail(req, res) {
    const email = req.url.split('&').shift().split('=').pop()
    const token = req.url.split('&').pop()

    userModel.findOne({ email }, (err, user) => {
      if (err) {
        return res.status(500).send({
          dev_message: 'internal server error',
          user_message: 'An internal server error occurred',
          moreInformation: err,
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
        if (user.verificationToken === token) {
          user.verifyAccount(userModel, email, err => {
            if (err) {
              return res.status(500).send({
                dev_message: 'verification failed',
                user_message: 'Verification failed',
                moreInformation: err,
                status: 500
              })
            } else {
              return res.status(200).send()
            }
          })
        } else {
          return res.status(403).send({
            dev_message: 'wrong verification token',
            user_message: 'The verification token supplied was invalid',
            status: 403
          })
        }
      }
    })
  }
}

module.exports = RegisterHandler