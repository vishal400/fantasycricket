const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  Player: String,
  Team: String,
  Role: String,
  points: { type: Number, default: 0 }

}, { timestamps: true });

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;
