const Submission = require('../models/submission.model.');

async function getSubmissionsForInstructor(user_id, filterText = null) {
    const lookup = [
        {
            $lookup: {
                from: "assignments",
                localField: "assignment_id",
                foreignField: "_id",
                as: "assignment"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $sort: {
                submission_time: -1
            }
        },
        {
            $project: {
                assignment_name: "$assignment.name",
                assignment_subject: "$assignment.subject",
                assignment_question: "$assignment.question",
                assignment_user_id: "$assignment.user_id",
                user_name: "$user.name",
                solution: 1,
                submission_time: 1,
                grade: 1
            }
        }
    ];

    if (filterText) {
        lookup.push({
            $match: {
                assignment_user_id: user_id,
                $or: [{user_name: filterText},
                    {user_email: filterText}]
            }
        });
    } else {
        lookup.push({
            $match: {
                assignment_user_id: user_id
            }
        });
    }
    // console.log(lookup);
    const submissions = await Submission.aggregate(lookup);
    return submissions;
}

module.exports = {
    getSubmissionsForInstructor
};