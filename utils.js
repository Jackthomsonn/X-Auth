class Utils {
  static checkUsernameIsAvailable(UserModel, user){
    return new Promise((resolve, reject) => {
      UserModel.findOne({ username: user.username }, (err, user) => {
        if (!err) {
          if (!user) {
            resolve()
          } else {
            reject('A user with that username already exists')
          }
        }
  
        reject()
      })
    })
  }
}

module.exports = Utils