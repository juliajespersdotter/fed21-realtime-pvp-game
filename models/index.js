/**
 * Model
 */

 const debug = require('debug')('game:models');
 const mongoose = require('mongoose');
 
 // set up the database connection
const connect = async () => {
    try{
        await mongoose.connect(process.env.DB_CONNECTION);
        debug("Successfully connected to MongoDB Atlas!");
    } catch (e) {
        debug("Error when trying to connect to MongoDB Atlas:", e);
        throw e;    
    }
}

// set up the models we want to use in our app
const models = {}
models.leaderboard = require('./Leaderboard.js');

module.exports = {
    connect,
    ...models,
};