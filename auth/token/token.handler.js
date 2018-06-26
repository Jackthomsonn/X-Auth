const jwt = require('jsonwebtoken')
const env = require('../../environment/env')
const utils = require('../../utils')
const refreshTokenModel = require('../../models/refresh-token.model').getModel()

class TokenHandler {
  static verifyToken(authKey, req, res, next) {
    if (req.headers['authorization']) {
      const accessToken = req.headers['authorization'].split(' ')[1]
      const refreshToken = req.headers['x-refresh'] ? req.headers['x-refresh'] : undefined

      jwt.verify(accessToken, authKey, (err) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            this.refreshToken(accessToken, refreshToken, res, next)
          } else {
            return res.status(403).send({
              dev_message: 'invalid token',
              user_message: 'Invalid token provided',
              status: 403
            })
          }
        } else {
          next()
        }
      })
    } else {
      return res.status(403).send({
        dev_message: 'no token',
        user_message: 'No token provided',
        status: 403
      })
    }
  }

  static refreshToken(accessToken, refreshToken, res, next) {
    const { username } = jwt.decode(accessToken).data ? jwt.decode(accessToken).data : {}

    jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET_KEY, (err) => {
      if (err) {
        return res.status(403).send({
          dev_message: 'invalid refresh token',
          user_message: 'Invalid refresh token provided',
          status: 403
        })
      } else {
        refreshTokenModel.collection.findOne({
          username: username
        }, (err, doc) => {
          if (err) {
            return res.status(500).send({
              dev_message: 'internal server error',
              user_message: 'An internal server error occurred',
              moreInformation: err,
              status: 500
            })
          } else {
            const { status, username } = doc ? doc : {};

            if (status === 'AUTHENTICATED') {
              const userModel = require('../../models/user.model').getModel()

              userModel.findOne({ username }, (err, user) => {
                if (user) {
                  const updatedUserData = utils.buildDataModelForJwt(user)
                  const { username } = updatedUserData

                  utils.setAccessToken(updatedUserData, res)
                  utils.setRefreshToken(username, res)
                }
              })

              next()
            } else {
              return res.status(403).send({
                dev_message: 'revoked refresh token',
                user_message: 'Revoked refresh token provided',
                status: 403
              })
            }
          }
        })
      }
    })
  }

  static signToken(data, secretKey, expiry) {
    return jwt.sign({ data }, secretKey, {
      expiresIn: expiry ? expiry / 1000 : 86400
    })
  }
}

module.exports = TokenHandler