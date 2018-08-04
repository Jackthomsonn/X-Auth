const userModel = require('../../models/user.model').getModel()
const sendmail = require('sendmail')()
const env = require('../..//environment/env')
const utils = require('../../utils')
const TokenHandler = require('../token/token.handler')
const PasswordResetEmailTemplate = require('../../templates/password-reset')

const { InternalServerError, BadRequest } = require('dynamic-route-generator')

class ForgottenPasswordHandler {
  static initiatePasswordResetRequest(req, res, next) {
    const { email } = req.body

    if (!email) {
      next(new BadRequest('You must provide an email'))
    }

    userModel.findOne({ email }, (err, user) => {
      if (err) {
        return next(new InternalServerError(err))
      }

      if (!user) {
        next(new BadRequest('A user with that email does not exist'))
      } else {
        const data = utils.buildDataModelForJwt(user)
        const token = TokenHandler.signToken(data, env.AUTH_SECRET_KEY_FORGOTTEN_PASSWORD, env.JWT_TOKEN_EXPIRATION)
        const url = utils.buildUrlQuery(req, 'auth/forgotten-password', [`email=${email}`, `token=${token}`])

        if (!user.verified) {
          next(new BadRequest('This account is not yet verified. Please check your emails and verify your account'))
        }

        if (!email) {
          next(new BadRequest('That email does not exist. Please try again'))
        } else {
          sendmail({
            from: env.DOMAIN_EMAIL,
            to: email,
            subject: env.APP_NAME + ' - Password reset request',
            html: PasswordResetEmailTemplate(url),
          }, err => {
            if (err) {
              next(new BadRequest('The email address on your account doesn\'t seem to exist'))
            } else {
              res.status(200).send()
            }
          })
        }
      }
    })
  }

  static updatePassword(req, res, next) {
    const { email, password } = req.body

    userModel.findOne({ email }, (err, user) => {
      if (err) {
        return next(new InternalServerError())
      }

      if (!password) {
        return next(new BadRequest('You must supply a new password'))
      }

      if (!user) {
        return next(
          new BadRequest('That account could not be found, please make sure both your username and password are correct')
        )
      } else {
        user.resetPassword(password, (err, newPassword) => {
          if (err) {
            return next(new InternalServerError())
          }

          if (!utils.validatePassword(password)) {
            return next(new BadRequest('The password specified does not match the specified criteria'))
          }

          userModel.findOneAndUpdate({ email }, { $set: { password: newPassword } }, err => {
            if (err) {
              next(new InternalServerError())
            } else {
              res.status(200).send()
            }
          })
        })
      }
    });
  }
}

module.exports = ForgottenPasswordHandler