const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const env = require('../env')

const Utils = require('../utils')

class UserSchema extends mongoose.Schema {
  constructor(definition) {
    super(definition)
    this.setupMethods()
    this.setupPreHooks()
  }

  setupPreHooks() {
    const that = this

    this.pre('save', function (next) {
      const user = this

      Utils.checkUsernameIsAvailable(that.getModel(), user).then(() => {
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
  }

  setupMethods() {
    this.methods = {
      comparePassword: function (candidatePassword, cb) {
        bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
          if (err) {
            return cb(err)
          }

          cb(null, isMatch)
        })
      }
    }
  }

  getModel() {
    return mongoose.model('User', this)
  }
}

module.exports = new UserSchema({
  username: {
    required: true,
    type: String
  },
  password: {
    required: true,
    type: String
  }
}).getModel()