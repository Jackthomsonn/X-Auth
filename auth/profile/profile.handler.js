const userModel = require('../../models/user.model').getModel()
const { InternalServerError, BadRequest, NotFound } = require('dynamic-route-generator')

class ProfileHandler {
  static getProfile(req, res, next) {
    const { id } = req.params

    userModel.findById(id, (err, user) => {
      if (err) {
        return next(new NotFound('User not found'))
      }

      if (!user) {
        return next(new BadRequest('Account Not Found'));
      } else {
        if (!user.verified) {
          return next(new BadRequest('Account not verified'));
        } else {
          return res.status(200).send({
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber,
            properties: user.properties,
            verified: user.verified,
            emailChangeVerified: user.emailChangeVerified
          })
        }
      }
    })
  }

  static updateProfile(req, res, next) {
    const { id } = req.params

    userModel.findOne({ _id: id }, (err, user) => {
      if (err) {
        return next(new InternalServerError(err));
      }

      user.updateAccount(userModel, id, req, next)
    })
  }
}

module.exports = ProfileHandler