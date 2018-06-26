const userModel = require('../../models/user.model').getModel()
const utils = require('../../utils')
const jwt = require('jsonwebtoken')

class TwoFactorAuthenticationHandler {
  static authenticate(req, res) {
    const { token } = req.body
    const username = req.query.q.split('=').pop()

    userModel.findOne({ username }, (err, user) => {
      if (user && !user.twoFactorAuthEnabled) {
        return res.status(500).send({
          dev_message: 'two factor auth not enabled',
          user_message: 'Two factor authentication is not enabled on this account',
          moreInformation: err,
          status: 500
        })
      }

      if (err) {
        return res.status(500).send({
          dev_message: 'internal server error',
          user_message: 'An internal server error occurred',
          moreInformation: err,
          status: 500
        })
      } else {
        jwt.verify(user.twoFactorAuthToken, token, (err) => {
          if (err) {
            return res.status(403).send({
              dev_message: 'token not valid',
              user_message: 'The two factor auth token that was provided is not valid',
              status: 403
            })
          } else {
            const data = utils.buildDataModelForJwt(user)
            const { username } = data

            utils.setAccessToken(data, res)
            utils.setRefreshToken(username, res)

            return res.status(200).send()
          }
        })
      }
    })
  }
}

module.exports = TwoFactorAuthenticationHandler