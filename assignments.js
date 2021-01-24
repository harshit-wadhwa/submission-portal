const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AssignmentSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    subject: {
        type: String
    },
    question: {
        type: String
    },
    deadline: {
        type: Number
    },
    user_id: {
        type: Schema.Types.ObjectId
    },
    submitted_by: {
        type: Array
    }
}, {
    versionKey: false
});


module.exports = mongoose.model('assignments', AssignmentSchema);
