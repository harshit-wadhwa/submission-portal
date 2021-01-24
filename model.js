const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    type: {
        type: String
    },
    subjects: {
        type: String
    }
}, {
    versionKey: false
});


module.exports = mongoose.model('users', UserSchema);
