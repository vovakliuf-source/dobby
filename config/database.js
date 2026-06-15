const mongoose = require('mongoose');

const db = () => {
    mongoose.connect(process.env.DB_URI, {
 }).then(con => {
    console.log(`MongoDB connected: ${con.connection.host}, ${process.env.DB_URI}`);
 }).catch(err => {
    console.error(`MongoDB connection error: ${err}`);
    process.exit(1);
 });
}

 module.exports = db;