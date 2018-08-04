const userModel = require('../../models/user.model').getModel()
const utils = require('../../utils')
const jwt = require('jsonwebtoken')

const { InternalServerError, Forbidden } = require('dynamic-route-generator')

class TwoFactorAuthenticationHandler {
  static authenticate(req, res, next) {
    const { token } = req.body
    const username = req.query.q.split('=').pop()

    userModel.findOne({ username }, (err, user) => {
      if (user && !user.twoFactorAuthEnabled) {
        next(new InternalServerError())
      }

      if (err) {
        next(new InternalServerError())
      } else {
        jwt.verify(user.twoFactorAuthToken, token, (err) => {
          if (err) {
            next(new Forbidden('The two factor auth token that was provided is not valid'))
          } else {
            const data = utils.buildDataModelForJwt(user)
            const { username } = data

            utils.setAccessToken(data, res)
            utils.setRefreshToken(username, res)

            next()
          }
        })
      }
    })
  }
}

module.exports = TwoFactorAuthenticationHandler