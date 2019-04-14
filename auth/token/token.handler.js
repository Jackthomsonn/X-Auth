const jwt = require('jsonwebtoken')
const env = require('../../environment/env')
const utils = require('../../utils')
const refreshTokenModel = require('../../models/refresh-token.model').getModel()

const { InternalServerError, Unauthorized, Forbidden } = require('dynamic-route-generator')

class TokenHandler {
  static verifyToken(authKey, req, _res, next) {
    if (req.headers['authorization']) {
      const accessToken = req.headers['authorization'].split(' ')[1]

      jwt.verify(accessToken, authKey, (err) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            next(new Unauthorized('The token provided has expired'))
          } else {
            next(new Forbidden('Invalid token provided'))
          }
        } else {
          next()
        }
      })
    } else {
      next(new Forbidden('No token provided'))
    }
  }

  static getRefreshToken(accessToken, res, next) {
    if (!accessToken) {
      next(new Forbidden('You must supply a valid access token'))
    }

    const decodedToken = jwt.decode(accessToken)

    if (decodedToken === null) {
      next(new Forbidden('Invalid access token provided'))
    }

    const { username } = decodedToken.data ? decodedToken.data : {}

    refreshTokenModel.collection.findOne({
      username: username
    }, (err, doc) => {
      if (err) {
        next(new InternalServerError())
      } else {
        if (doc) {
          jwt.verify(doc.refreshToken, env.REFRESH_TOKEN_SECRET_KEY, (err) => {
            if (err) {
              next(new Forbidden('Invalid refresh token provided'))
            } else {
              const { status, username } = doc ? doc : {};

              if (status === 'AUTHENTICATED') {
                const userModel = require('../../models/user.model').getModel()

                userModel.findOne({ username }, (err, user) => {
                  console.log(err)
                  if (err) {
                    next(new InternalServerError())
                  } else {
                    if (user) {
                      const updatedUserData = utils.buildDataModelForJwt(user)
                      const { username } = updatedUserData

                      // utils.setAccessToken(updatedUserData, res)
                      utils.setRefreshToken(username, res)

                      res.status(200).send({
                        accessToken: require('../../auth/token/token.handler').signToken(updatedUserData, env.AUTH_SECRET_KEY, env.JWT_TOKEN_EXPIRATION),
                        userId: user._id
                      })
                    }
                  }
                })
              } else {
                next(new Forbidden('Revoked refresh token provided'))
              }
            }
          })
        } else {
          next(new Forbidden('It looks like your account does not have a refresh token'))
        }
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