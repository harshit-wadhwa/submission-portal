const mongoose = require('mongoose');

// connect to mongo db
const mongoUri = 'mongodb+srv://harshit:wadhwa@cluster0.xeob6.mongodb.net/submissions?retryWrites=true&w=majority';
let options = {keepAlive: 1, useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true};
mongoose.connect(mongoUri, options);
mongoose.connection.on('error', () => {
    throw new Error(`unable to connect to database: ${mongoUri}`);
});

