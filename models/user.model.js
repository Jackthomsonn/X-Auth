const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const TextMagicClient = require('textmagic-rest-client')
const env = require('../environment/env')
const awesomePhonenumber = require("awesome-phonenumber")

const event = require('../events')

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
      Utils.checkUsernameAndEmailIsAvailable(schema.getModel(), this).then(() => {
        if (!this.isModified('password')) {
          next(null)
        }

        bcrypt.genSalt(env.SALT_WORK_FACTOR, (err, salt) => {
          if (err) {
            next(err)
          }

          const pn = new awesomePhonenumber(this.phoneNumber, 'GB')
          this.phoneNumber = pn.getNumber()

          bcrypt.hash(this.password, salt, (err, hash) => {
            if (err) {
              next(err)
            } else {
              this.password = hash

              event.emit('registration-complete')
              next(null)
            }
          })
        })
      }).catch(next)
    })
  }

  setupMethods() {
    this.methods = {
      comparePassword: function (candidatePassword, next) {
        bcrypt.compare(candidatePassword, this.password, function (err, isValid) {
          if (err) {
            return next(err)
          }

          next(null, isValid)
        })
      },
      resetPassword: function (candidatePassword, next) {
        bcrypt.genSalt(env.SALT_WORK_FACTOR, (err, salt) => {
          if (err) {
            return next(err)
          }

          bcrypt.hash(candidatePassword, salt, (err, hash) => {
            if (err) {
              return next(err)
            }

            next(null, hash)
          })
        })
      },
      changePassword: function (oldPassword, newPassword, next) {
        bcrypt.compare(oldPassword, this.password, function (err, isValid) {
          if (err) {
            return next(err)
          }

          if (!isValid) {
            return next({ message: 'Your old password is wrong' })
          }

          bcrypt.genSalt(env.SALT_WORK_FACTOR, (err, salt) => {
            if (err) {
              return next(err)
            }

            bcrypt.hash(newPassword, salt, (err, hash) => {
              if (err) {
                return next(err)
              }

              next(null, hash)
            })
          })
        })
      },
      verifyAccount: function (user, email, next) {
        user.findOneAndUpdate({ email }, {
          $set: {
            verified: true,
            verificationToken: undefined
          }
        }, err => {
          if (err) {
            return res.status(500).send({
              dev_message: 'internal server error',
              user_message: 'An internal server error occurred',
              moreInformation: err,
              status: 500
            })
          } else {
            next(null)
          }
        })
      },
      generateAuthToken() {
        return Math.floor(1000 + Math.random() * 9000)
      },
      twoFactorAuthCheck: function (user, username, phoneNumber, next) {
        const generatedToken = this.generateAuthToken()

        user.findOneAndUpdate({ username }, { $set: { twoFactorAuthToken: generatedToken } }, err => {
          if (err) {
            next(err)
          } else {
            var client = new TextMagicClient(env.TEXT_MAGIC_USERNAME, env.TEXT_MAGIC_TOKEN)
            client.Messages.send({
              text: 'Your code is: ' + generatedToken,
              phones: phoneNumber
            }, function (err) {
              if (err) {
                next(err)
              } else {
                next()
              }
            })
          }
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
    type: String,
    unique: true
  },
  password: {
    required: true,
    type: String
  },
  email: {
    required: true,
    type: String,
    unique: true,
    validate: [Utils.validateEmail, 'The email address that was supplied was invalid'],
  },
  phoneNumber: {
    required: true,
    type: String,
    validate: [Utils.validatePhoneNumber, 'The phone number that was supplied was invalid'],
  },
  twoFactorAuthEnabled: {
    type: Boolean
  },
  twoFactorAuthToken: {
    type: Number
  },
  verified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String
  },
  properties: [mongoose.Schema.Types.Mixed]
})