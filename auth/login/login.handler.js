const userModel = require('../../models/user.model').getModel()
const env = require('../../environment/env')
const TokenHandler = require('../token/token.handler')

class LoginHandler {
  static login(req, res) {
    const { username, password } = req.body

    userModel.findOne({ username }, (err, user) => {
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
        if (!user.verified) {
          return res.status(403).send({
            dev_message: 'account not verified',
            user_message: 'This account is not yet verified',
            status: 404
          })
        }

        user.comparePassword(password, (err, isMatch) => {
          if (isMatch && !user.twoFactorAuthEnabled) {
            res.cookie(env.COOKIE_NAME, TokenHandler.signToken(username, env.AUTH_SECRET_KEY, env.JWT_TOKEN_EXPIRATION), {
              maxAge: env.JWT_TOKEN_EXPIRATION
            })

            return res.status(200).send()
          } else if (isMatch && user.twoFactorAuthEnabled) {
            user.twoFactorAuthCheck(userModel, username, user.phoneNumber, err => {
              if (err) {
                return res.status(500).send({
                  dev_message: 'internal server error',
                  user_message: 'Internal server error',
                  moreInformation: err,
                  status: 500
                })
              } else {
                return res.status(202).send({
                  username: username
                })
              }
            })
          }
          else {
            return res.status(404).send({
              dev_message: 'auth error',
              user_message: 'That account could not be found, please make sure both your username and password are correct',
              status: 404
            })
          }
        })
      }
    })
  }
}

module.exports = LoginHandler