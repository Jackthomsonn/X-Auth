const userModel = require('../../models/user.model').getModel()
const event = require('../../events')
const env = require('../../environment/env')
const sendmail = require('sendmail')()
const utils = require('../../utils')
const TokenHandler = require('../token/token.handler')
const VerifyAccountEmailTemplate = require('../../templates/verify-account')

const { InternalServerError, Forbidden, BadRequest } = require('dynamic-route-generator')

class RegisterHandler {
  static handleRegistration(req, _res, next) {
    const { username, password, email, phoneNumber } = req.body
    let data = undefined

    userModel.findOne({ username }, (err, user) => {
      const token = TokenHandler.signToken({}, env.AUTH_SECRET_KEY, env.JWT_TOKEN_EXPIRATION)

      if (err) {
        return next(new InternalServerError())
      }

      if (user) {
        return next(new BadRequest('That username has been taken, please choose another one'))
      }

      if (!utils.validateEmail(email)) {
        return next(new BadRequest('The email specified does not seem to exist'))
      }

      if (!utils.validatePhoneNumber(phoneNumber)) {
        return next(new BadRequest('The phone number specified does not seem to exist'))
      }

      if (!utils.validatePassword(password)) {
        return next(new BadRequest('The password specified does not match the specified criteria'))
      }

      let called = false

      if (!env.EMAIL_VERIFICATION) {
        req.body.verified = true
        next()
      } else {
        req.body.verificationToken = token
        next()
        event.once('registration-complete', () => {
          const url = utils.buildUrlQuery(req, env.BASE_URI + '/auth/verify', [`email=${email}`, `${token}`])

          if (!called) {
            sendmail({
              from: env.DOMAIN_EMAIL,
              to: email,
              subject: env.APP_NAME + ' - Verify account',
              html: VerifyAccountEmailTemplate(url)
            }, err => {
              if (err) {
                next(new BadRequest('The email address on your account doesn\'t seem to exist'))
              } else {
                next(null)
                called = !called
              }
            })
          }
        })
      }
    })
  }

  static verifyEmail(req, res, next) {
    const email = req.url.split('&').shift().split('=').pop()
    const token = req.url.split('&').pop()

    userModel.findOne({ email }, (err, user) => {
      if (err) {
        next(new InternalServerError())
      }

      if (!user) {
        next(BadRequest('That account could not be found, please make sure both your email is correct'))
      } else {
        if (user.verificationToken === token) {
          user.verifyAccount(userModel, email, err => {
            if (err) {
              next(new InternalServerError())
            } else {
              res.redirect('/')
            }
          })
        } else {
          next(new Forbidden('The verification token supplied was invalid'))
        }
      }
    })
  }

  static verifyEmailChange(req, res, next) {
    const oldEmail = req.url.split('&')[0].split('=').pop();
    const email = req.url.split('&')[1].split('=').pop();

    userModel.findOne({ email: oldEmail }, (err, user) => {
      if (err) {
        next(new InternalServerError())
      }

      if (!user) {
        next(new BadRequest('That account could not be found, please make sure both your email is correct'))
      } else {
        user.verifyEmailChanged(userModel, oldEmail, email, err => {
          if (err) {
            next(new InternalServerError())
          } else {
            res.redirect('/')
          }
        })
      }
    })
  }

  static verifyPhoneNumberChange(req, res, next) {
    const oldPhoneNumber = req.url.split('&')[0].split('=').pop();
    const phoneNumber = req.url.split('&')[1].split('=').pop();

    userModel.findOne({ phoneNumber: oldPhoneNumber }, (err, user) => {
      if (err) {
        next(new InternalServerError())
      }

      if (!user) {
        next(new BadRequest('That account could not be found'))
      } else {
        user.verifyPhoneNumberChange(userModel, oldPhoneNumber, phoneNumber, err => {
          if (err) {
            next(new InternalServerError())
          } else {
            res.redirect('/')
          }
        })
      }
    })
  }
}

module.exports = RegisterHandler