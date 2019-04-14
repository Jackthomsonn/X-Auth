const userModel = require('../../models/user.model').getModel()
const utils = require('../../utils')
const env = require('../../environment/env')

const { InternalServerError, BadRequest } = require('dynamic-route-generator')

class LoginHandler {
  static login(req, res, next) {
    const { username, password } = req.body

    userModel.findOne({ username }, (err, user) => {
      if (err) {
        next(new InternalServerError('An internal server error occured'))
      }

      if (!user) {
        next(new BadRequest('Account Not Found'));
      } else {
        if (!user.verified) {
          next(new BadRequest('Account not verified'));
        } else {
          user.comparePassword(password, (err, isMatch) => {
            const data = utils.buildDataModelForJwt(user)
            const accessToken = require('../../auth/token/token.handler').signToken(data, env.AUTH_SECRET_KEY, env.JWT_TOKEN_EXPIRATION)
            const { username } = data

            if (isMatch && !user.twoFactorAuthEnabled) {
              utils.setAccessToken(data, accessToken, res)
              utils.setRefreshToken(username, res)

              res.status(200).send({
                accessToken: accessToken,
                userId: user._id
              })
            } else if (isMatch && user.twoFactorAuthEnabled) {
              user.twoFactorAuthCheck(userModel, data, user.phoneNumber, err => {
                if (err) {
                  next(new InternalServerError('An Internal Server Error Occured'))
                } else {
                  res.status(200).send({
                    accessToken: accessToken,
                    userId: user._id
                  })
                }
              })
            } else {
              next(new BadRequest('Account Not Found'));
            }
          })
        }
      }
    })
  }
}

module.exports = LoginHandler