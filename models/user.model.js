const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const TextMagicClient = require('textmagic-rest-client')
const awesomePhonenumber = require("awesome-phonenumber")
const TokenHandler = require('../auth/token/token.handler')
const utils = require('../utils')
const env = require('../environment/env')
const sendmail = require('sendmail')()
const VerifyEmailChangeTemplate = require('../templates/verify-email-change')
const VerifyPhoneNumberChangeTemplate = require('../templates/verify-phone-number-change')
const { InternalServerError, BadRequest } = require('dynamic-route-generator')
const event = require('../events')

class UserSchema extends mongoose.Schema {
  constructor(definition) {
    super(definition)
    this.setupMethods()
    this.setupPreHooks()
  }

  setupPreHooks() {
    const schema = this

    this.pre('save', function (next) {
      utils.checkUsernameAndEmailIsAvailable(schema.getModel(), this).then(() => {
        if (!this.isModified('password')) {
          return next()
        }

        bcrypt.genSalt(env.SALT_WORK_FACTOR, (err, salt) => {
          if (err) {
            return next(err)
          }

          const pn = new awesomePhonenumber(this.phoneNumber, 'GB')
          this.phoneNumber = pn.getNumber()

          bcrypt.hash(this.password, salt, (err, hash) => {
            if (err) {
              next(err)
            } else {
              this.password = hash

              event.emit('registration-complete')
              return next()
            }
          })
        })
      }).catch((err) => {
        next(new BadRequest(err))
      })
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
            next(new BadRequest('Your old password is wrong'))
          } else {
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
          }
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
            next(new InternalServerError())
          } else {
            next(null)
          }
        })
      },
      verifyEmailChanged: function (user, oldEmail, email, next) {
        user.findOneAndUpdate({ email: oldEmail }, {
          $set: {
            emailChangeVerified: true,
            email: email
          }
        }, err => {
          if (err) {
            next(new InternalServerError())
          } else {
            next(null)
          }
        })
      },
      verifyPhoneNumberChange: function (user, oldPhoneNumber, phoneNumber, next) {
        user.findOneAndUpdate({ phoneNumber: oldPhoneNumber }, {
          $set: {
            phoneNumber: phoneNumber
          }
        }, err => {
          if (err) {
            next(new InternalServerError())
          } else {
            next(null)
          }
        })
      },
      generateAuthToken() {
        return Math.floor(1000 + Math.random() * 9000)
      },
      twoFactorAuthCheck: function (user, dataObj, phoneNumber, next) {
        const username = dataObj.username
        const generatedToken = this.generateAuthToken()
        let data = undefined

        user.findOne({ username }, (err, newUser) => {
          data = utils.buildDataModelForJwt(newUser)

          user.findOneAndUpdate({ username }, {
            $set: {
              twoFactorAuthToken: TokenHandler.signToken(data, generatedToken.toString(), 300000)
            }
          }, err => {
            if (err) {
              next(err)
            } else {
              var client = new TextMagicClient(env.TEXT_MAGIC_USERNAME, env.TEXT_MAGIC_TOKEN)
              client.Messages.send({
                text: 'Your code is: ' + generatedToken + ' - This code will expire in 5 minutes',
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
        })
      },
      updateAccount: function (user, id, req, next) {
        if (!utils.validatePassword(req.body.password)) {
          return next(new BadRequest('The password specified does not match the specified criteria'))
        }

        if (!utils.validateEmail(req.body.email)) {
          return next(new BadRequest('The email specified does not seem to exist'));
        }

        if (!utils.validatePhoneNumber(req.body.phoneNumber)) {
          return next(new BadRequest('The phone number specified does not seem to exist'));
        }

        req.body.verified = true;

        user.findOne({ _id: id }, async (err, doc) => {
          if (err) {
            return next(new InternalServerError(err));
          }

          const isChangingEmail = doc.email !== req.body.email;
          const isChangingPhoneNumber = doc.phoneNumber !== req.body.phoneNumber;

          if (isChangingEmail || req.body.emailChangeVerified && !isChangingEmail) {
            req.body.emailChangeVerified = false;
          }

          if (isChangingPhoneNumber) {
            await handlePhoneNumberChange(req, doc);
          }

          if (isChangingEmail) {
            await handleEmailChange(req, doc);
          }

          next();
        })
      }
    }
  }

  getModel() {
    return mongoose.model('User', this)
  }
}

const handlePhoneNumberChange = (req, doc) => {
  return new Promise(resolve => {
    if (env.EMAIL_VERIFICATION) {
      const token = TokenHandler.signToken({}, env.UPDATE_PROFILE_JWT_KEY, env.UPDATE_PROFILE_JWT_EXPIRATION)
      const url = utils.buildUrlQuery(req, 'auth/verify-phone-number-change', [`oldPhone=${doc.phoneNumber}`, `phoneNumber=${req.body.phoneNumber}`, `${token}`])

      sendmail({
        from: env.DOMAIN_EMAIL,
        to: doc.email,
        subject: env.APP_NAME + ' - Verify phone number change',
        html: VerifyPhoneNumberChangeTemplate(url)
      }, err => {
        if (err) {
          return next(new BadRequest('The email address on your account doesn\'t seem to exist'));
        } else {
          req.body.phoneNumber = doc.phoneNumber;
          resolve();
        }
      })
    } else {
      resolve();
    }
  });
}

const handleEmailChange = (req, doc) => {
  return new Promise(resolve => {
    if (env.EMAIL_VERIFICATION) {
      const token = TokenHandler.signToken({}, env.UPDATE_PROFILE_JWT_KEY, env.UPDATE_PROFILE_JWT_EXPIRATION)
      const url = utils.buildUrlQuery(req, 'auth/verify-email-change', [`oldEmail=${doc.email}`, `email=${req.body.email}`, `${token}`])

      sendmail({
        from: env.DOMAIN_EMAIL,
        to: req.body.email,
        subject: env.APP_NAME + ' - Verify email change',
        html: VerifyEmailChangeTemplate(url)
      }, err => {
        if (err) {
          return next(new BadRequest('The email address on your account doesn\'t seem to exist'))
        } else {
          req.body.email = doc.email;
          resolve();
        }
      })
    } else {
      resolve();
    }
  });
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
    unique: true
  },
  phoneNumber: {
    required: true,
    type: String
  },
  twoFactorAuthEnabled: {
    type: Boolean
  },
  twoFactorAuthToken: {
    type: String
  },
  verified: {
    type: Boolean,
    default: false
  },
  emailChangeVerified: {
    type: Boolean,
    default: true
  },
  verificationToken: {
    type: String
  },
  permissions: [mongoose.Schema.Types.Mixed],
  properties: {
    required: false,
    type: Object
  }
}, { timestamps: true })