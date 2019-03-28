const mongoose = require('mongoose')

class TwoFactorSchema extends mongoose.Schema {
  constructor(definition) {
    super(definition)
  }

  getModel() {
    return mongoose.model('TwoFactorModel', this)
  }
}

module.exports = new TwoFactorSchema({
  token: {
    required: true,
    type: Number
  }
}, { timestamps: true })