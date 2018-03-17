const mongoose = require('mongoose')

const gameSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String
  },
  type: {
    required: true,
    type: String
  }
})

module.exports = mongoose.model('Games', gameSchema)