const mongoose = require('mongoose')

class RefreshTokenSchema extends mongoose.Schema {
  constructor(definition) {
    super(definition)
  }

  getModel() {
    return mongoose.model('RefreshTokenModel', this)
  }
}

module.exports = new RefreshTokenSchema({
  token: {
    required: true,
    type: String
  }
})