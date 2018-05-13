const userModel = require('../../models/user.model').getModel()
const sendmail = require('sendmail')()
const env = require('../..//environment/env')
const ms = require('ms')
const utils = require('../../utils')
const TokenHandler = require('../token/token.handler')

class ForgottenPasswordHandler {
  static initiatePasswordResetRequest(req, res) {
    const { email } = req.body
    const token = TokenHandler.signToken(email, env.AUTH_SECRET_KEY_FORGOTTEN_PASSWORD, env.JWT_TOKEN_EXPIRATION)
    const url = utils.buildUrlQuery(req, env.FORGOTTEN_PASSWORD_PAGE_URI, [`email=${email}`, `${token}`])

    userModel.findOne({ email }, (err, user) => {
      if (err) {
        return res.status(500).send({
          dev_message: 'internal server error',
          user_message: 'An internal server error occurred',
          moreInformation: err,
          moreInformation: err,
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
            <p>A request has been made on your account to reset your password. If this was you, please click the following link ${url} (This link will expire in ${ms(env.JWT_TOKEN_EXPIRATION)})</p>
            </br>
            <p>If this request was not made by you, please ignore this email</p>`,
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