const userModel = require('../../models/user.model').getModel()
const sendmail = require('sendmail')()
const env = require('../..//environment/env')
const utils = require('../../utils')
const TokenHandler = require('../token/token.handler')

class ChangePasswordHandler {
  static changePassword(req, res) {
    const { email, password, newPassword } = req.body

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
        user.changePassword(password, newPassword, (err, newPassword) => {
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

module.exports = ChangePasswordHandler