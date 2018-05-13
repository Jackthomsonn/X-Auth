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

  static validatePhoneNumber(phoneNumber) {
    var regex = /^(?:\W*\d){11}\W*$/
    return regex.test(phoneNumber)
  }

  static buildUrlQuery(req, url, queryParams) {
    let queryUrl = req.protocol + "://" + req.get('host') + '/' + url

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
}

module.exports = Utils