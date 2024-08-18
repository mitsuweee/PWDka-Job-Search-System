

const jobListingModel = (positionName, description, qualification, minimumSalary, maximumSalary, positionType_id, company_id, disability_id ) =>{

    let jobListing = {
        position_name : positionName,
        description : description,
        qualification : qualification,
        minimum_salary : minimumSalary,
        maximum_salary : maximumSalary, 
        positiontype_id : positionType_id,
        company_id : company_id, 
        disability_id : disability_id
    }
    return jobListing
}

module.exports = {
    jobListingModel
}