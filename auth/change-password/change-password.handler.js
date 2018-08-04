const userModel = require('../../models/user.model').getModel()
const utils = require('../../utils')

const { InternalServerError, BadRequest } = require('dynamic-route-generator')

class ChangePasswordHandler {
  static changePassword(req, res, next) {
    const { email, password, newPassword } = req.body

    userModel.findOne({ email }, (err, user) => {
      if (err) {
        next(new InternalServerError())
      }

      if (!utils.validatePassword(newPassword)) {
        next(new BadRequest('The password specified does not match the specified criteria'))
      }

      if (!user) {
        next(new BadRequest('Account not found'))
      } else {
        user.changePassword(password, newPassword, (err, newPassword) => {
          if (err) {
            next(new InternalServerError())
          }

          userModel.findOneAndUpdate({ email }, { $set: { password: newPassword } }, err => {
            if (err) {
              next(new InternalServerError())
            }

            next()
          })
        })
      }
    })
  }
}

module.exports = ChangePasswordHandler