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
  refreshToken: {
    required: false,
    type: String
  },
  username: {
    required: false,
    type: String
  },
  status: {
    required: false,
    type: String
  }
})