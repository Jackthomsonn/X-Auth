const mongoose = require('mongoose')

class GameSchema extends mongoose.Schema {
  constructor(definition) {
    super(definition)
  }

  getModel() {
    return mongoose.model('Game', this)
  }
}

module.exports = new GameSchema({
  name: {
    required: true,
    type: String
  },
  type: {
    required: true,
    type: String
  }
}).getModel()