/**
 * Model
 */

 const debug = require('debug')('game:models');
 const mongoose = require('mongoose');
 
 // set up the database connection
 try{
    await mongoose.connect(process.env.DB_CONNECTION);
} catch (e) {
    debug("Error when trying to connect to MongoDB Atlas:", e);
    throw e;
}
 
 // set up the models we want to use in our app
 
 module.exports = {
 
 };