const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URL_LOCAL = process.env.MONGODB_URL_LOCAL;

mongoose.connect(MONGODB_URL_LOCAL)
    .then(() => {
        console.log('Connected to MongoDB Database.!');
    })
    .catch((err) => {
        console.error(' connecting Failed to MongosDB Database.!', err);
    });


const db = mongoose.connection;