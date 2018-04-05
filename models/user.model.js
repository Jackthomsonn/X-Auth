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
    const schema = this

    this.pre('save', function (next) {
      Utils.checkUsernameIsAvailable(schema.getModel(), this).then(() => {
        if (!this.isModified('password')) {
          return next()
        }

        bcrypt.genSalt(env.SALT_WORK_FACTOR, (err, salt) => {
          if (err) {
            return next(err)
          }

          bcrypt.hash(this.password, salt, (err, hash) => {
            if (err) {
              return next(err)
            }

            this.password = hash
            next()
          })
        })
      }).catch(next)
    })
  }

  setupMethods() {
    this.methods = {
      comparePassword: function (candidatePassword, next) {
        bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
          if (err) {
            return next(err)
          }

          next(null, isMatch)
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
})