class Utils {
  static checkUsernameIsAvailable(UserModel, user) {
    const { username } = user

    return new Promise((resolve, reject) => {
      UserModel.findOne({ username }, (err, user) => {
        try {
          if (err) {
            throw new Error(err)
          }

          if (user) {
            throw new Error('A user with that username already exists')
          }

          resolve()
        } catch (error) {
          reject(error)
        }
      })
    })
  }
}

module.exports = Utils