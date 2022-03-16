/**
 * Leaderboard Model
 */

 const mongoose = require('mongoose');

 // Declare Model Schema
 const leaderboardSchema = new mongoose.Schema({
     username: String,
     highscore: Number,
 });
 
 // Declare Model
 const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
 
 module.exports = Leaderboard;
 