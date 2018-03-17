const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const env = require('../env')

const userSchema = new mongoose.Schema({
  username: {
    required: true,
    type: String
  },
  password: {
    required: true,
    type: String
  }
})

const checkUsernameIsAvailable = (user) => {
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

userSchema.pre('save', function (next) {
  const user = this

  checkUsernameIsAvailable(user).then(() => {
    if (!user.isModified('password')) {
      return next()
    }

    bcrypt.genSalt(env.SALT_WORK_FACTOR, (err, salt) => {
      if (err) {
        return next(err)
      }

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) {
          return next(err)
        }

        user.password = hash
        next()
      })
    })
  }).catch(error => {
    return next(new Error(error))
  })
})

userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) {
      return cb(err)
    }

    cb(null, isMatch)
  })
}

const UserModel = mongoose.model('Users', userSchema)

module.exports = UserModel