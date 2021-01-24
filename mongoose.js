const mongoose = require('mongoose');

// connect to mongo db
const mongoUri = process.env.MONGODB;
let options = {keepAlive: 1, useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true};
mongoose.connect(mongoUri, options);
mongoose.connection.on('error', () => {
    throw new Error(`unable to connect to database: ${mongoUri}`);
});

