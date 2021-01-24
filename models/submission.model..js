const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubmissionSchema = new mongoose.Schema({
    user_id: {
        type: Schema.Types.ObjectId,
    },
    assignment_id: {
        type: Schema.Types.ObjectId
    },
    solution: {
        type: String
    },
    grade: {
        type: Number
    },
    submission_time: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false
});


module.exports = mongoose.model('submissions', SubmissionSchema);
