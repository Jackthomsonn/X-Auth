const userModel = require('../../models/user.model').getModel()
const event = require('../../events')
const env = require('../../environment/env')
const sendmail = require('sendmail')()
const utils = require('../../utils')
const TokenHandler = require('../token/token.handler')
const VerifyAccountEmailTemplate = require('../../templates/verify-account')

class RegisterHandler {
  static handleRegistration(req, res, next) {
    const { username, password, email } = req.body
    const token = TokenHandler.signToken(email, env.AUTH_SECRET_KEY, env.JWT_TOKEN_EXPIRATION)

    if (!utils.validatePassword(password)) {
      return res.status(400).send({
        dev_message: 'password criteria not met',
        user_message: 'The password specified does not match the specified criteria',
        status: 400
      })
    }

    let called = false

    if (!env.EMAIL_VERIFICATION) {
      req.body.verified = true
      next()
    } else {
      req.body.verificationToken = token
      next()
      event.on('registration-complete', () => {
        const url = utils.buildUrlQuery(req, 'auth/verify', [`email=${email}`, `${token}`])

        if (!called) {
          sendmail({
            from: env.DOMAIN_EMAIL,
            to: email,
            subject: env.APP_NAME + ' - Verify account',
            html: VerifyAccountEmailTemplate(url)
          }, err => {
            if (err) {
              return res.status(400).send({
                dev_message: 'email account does not exist',
                user_message: 'The email address on your account doesn\'t seem to exist',
                status: 400
              })
            } else {
              next(null)
              called = !called
            }
          })
        }
      })
    }
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
              return res.status(200).send(env.VERIFICATION_PAGE_TEMPLATE
                ? env.VERIFICATION_PAGE_TEMPLATE
                : require('../../templates/account-verified')
              )
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