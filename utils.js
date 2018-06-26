const awesomePhonenumber = require('awesome-phonenumber')
const env = require('./environment/env')
const refreshTokenModel = require('./models/refresh-token.model').getModel()

class Utils {
  static checkUsernameAndEmailIsAvailable(UserModel, user) {
    const { username, email } = user

    return new Promise((resolve, reject) => {
      UserModel.findOne({ username }, (err, user) => {
        try {
          if (err) {
            throw new Error(err)
          }

          if (user) {
            throw new Error('A user with that username already exists')
          }

          UserModel.findOne({ email }, (err, email) => {
            try {
              if (err) {
                throw new Error(err)
              }

              if (email) {
                throw new Error('A user with that email already exists')
              }

              resolve()
            } catch (error) {
              reject(error)
            }
          })
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  static validateEmail(email) {
    var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    return regex.test(email)
  }

  static validatePassword(password) {
    const strongPassword = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$")
    const veryStrongPassword = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})")
    switch (env.PASSWORD_STRENGTH) {
      case '0':
        return strongPassword.test(password)
        break;
      case '1':
        return veryStrongPassword.test(password)
        break;
    }
  }

  static validatePhoneNumber(phoneNumber) {
    const pn = new awesomePhonenumber(phoneNumber, 'GB');

    return pn.isValid() && pn.isMobile()
  }

  static buildUrlQuery(req, url, queryParams) {
    let queryUrl = req.protocol + '://' + req.get('host') + '/' + url

    if (queryParams && queryParams.length) {
      queryUrl += '?q='
    }

    queryParams.forEach((query, index) => {
      if (index + 1 !== queryParams.length) {
        queryUrl += query + '&'
      } else {
        queryUrl += query
      }
    })

    return queryUrl
  }

  static buildDataModelForJwt(user) {
    const model = {
      username: user.username ? user.username : undefined,
      permissions: user.permissions ? user.permissions : []
    }

    return model
  }

  static setRefreshToken(username, res) {
    const refreshToken = require('./auth/token/token.handler').signToken({}, env.REFRESH_TOKEN_SECRET_KEY, env.REFRESH_TOKEN_EXPIRATION)

    res.cookie(env.REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      maxAge: env.REFRESH_TOKEN_EXPIRATION
    })

    try {
      refreshTokenModel.collection.updateOne({ username: username }, {
        $set: {
          username: username,
          refreshToken: refreshToken,
          status: 'AUTHENTICATED'
        }
      }, { upsert: true })
    } catch(error) {
      console.log(error)
    }
  }

  static setAccessToken(data, res) {
    const accessToken = require('./auth/token/token.handler').signToken(data, env.AUTH_SECRET_KEY, env.JWT_TOKEN_EXPIRATION)

    res.cookie(env.COOKIE_NAME, accessToken, {
      maxAge: env.JWT_TOKEN_EXPIRATION
    })
  }
}

module.exports = Utils