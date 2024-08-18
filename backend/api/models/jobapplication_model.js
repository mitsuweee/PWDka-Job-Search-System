

const jobApplicationModel = (user_id, joblisting_id, resume) =>{

    let jobApplication = {
        user_id : user_id,
        joblisting_id : joblisting_id, 
        resume : resume
    }

    return jobApplication
}

module.exports = jobApplicationModel