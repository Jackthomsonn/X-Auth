const userModel = require('../../models/user.model').getModel()
const sendmail = require('sendmail')()
const env = require('../..//environment/env')
const utils = require('../../utils')
const TokenHandler = require('../token/token.handler')
const PasswordResetEmailTemplate = require('../../templates/password-reset')

class ForgottenPasswordHandler {
  static initiatePasswordResetRequest(req, res) {
    const { email } = req.body
    const token = TokenHandler.signToken(email, env.AUTH_SECRET_KEY_FORGOTTEN_PASSWORD, env.JWT_TOKEN_EXPIRATION)
    const url = utils.buildUrlQuery(req, 'auth/forgotten-password', [`email=${email}`, `${token}`])

    userModel.findOne({ email }, (err, user) => {
      if (err) {
        return res.status(500).send({
          dev_message: 'internal server error',
          user_message: 'An internal server error occurred',
          moreInformation: err,
          status: 500
        })
      }

      if (!user.verified) {
        return res.status(403).send({
          dev_message: 'account not verified',
          user_message: 'This account is not yet verified',
          status: 404
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
          html: PasswordResetEmailTemplate(url),
        }, err => {
          if (err) {
            return res.status(400).send({
              dev_message: 'email account does not exist',
              user_message: 'The email address on your account doesn\'t seem to exist',
              status: 400
            })
          } else {
            return res.status(200).send()
          }
        })
      }
    })
  }

  static updatePassword(req, res) {
    const { email, password } = req.body

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
        user.resetPassword(password, (err, newPassword) => {
          if (err) {
            return res.status(500).send({
              dev_message: 'internal server error',
              user_message: 'An internal server error occurred',
              moreInformation: err,
              status: 500
            })
          }

          if (!utils.validatePassword(password)) {
            return res.status(400).send({
              dev_message: 'password criteria not met',
              user_message: 'The password specified does not match the specified criteria',
              moreInformation: err,
              status: 400
            })
          }

          userModel.findOneAndUpdate({ email }, { $set: { password: newPassword } }, err => {
            if (err) {
              return res.status(500).send({
                dev_message: 'internal server error',
                user_message: 'An internal server error occurred',
                moreInformation: err,
                status: 500
              })
            }

            return res.status(200).send()
          })
        })
      }
    })
  }
}

module.exports = ForgottenPasswordHandler