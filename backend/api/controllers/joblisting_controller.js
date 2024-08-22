const { json } = require('body-parser')
const database = require('../models/connection_db')
const {jobListingModel} = require('../models/joblisting_model')
const util = require('./util')

const postJobs = async (req, res, next) => {
    let position_name = req.body.position_name
    let description = req.body.description
    let qualification = req.body.qualification
    let minimum_salary = req.body.minimum_salary 
    let maximum_salary = req.body.maximum_salary 
    let positiontype_id = req.body.positiontype_id
    let company_id = req.body.company_id
    let disability_ids = req.body.disability_ids


    if(!position_name || !description || !qualification || !positiontype_id || !company_id || !disability_ids || disability_ids.length === 0){
        return res.status(404).json({
            successful : false,
            message : "One or more details are missing, or the disability_ids array is empty"
        })
    }
    else if(util.checkSpecialChar(position_name)){
        return res.status(400).json({
            successful : false,
            message : "Position name must not contain special characters"
        })
    }
    else if(!util.checkNumbers(minimum_salary) || minimum_salary < 0){
        return res.status(400).json({
            successful : false,
            message : "Minimum Salary must only contain numbers that are greater than or equal to 0"
        })
    }
    else if(!util.checkNumbers(maximum_salary) || maximum_salary <= minimum_salary){
        return res.status(400).json({
            successful : false,
            message : "Maximum Salary must only contain numbers that are greater than minimum Salary"
        })
    }
    else{
        try {
            const connection = await database.pool.getConnection()
    
            try {
                const selectPositionTypeId = `SELECT id FROM position_type WHERE type = ?`
                const positionTypeRows = await connection.query(selectPositionTypeId, [positiontype_id])

                if(positionTypeRows.length === 0) {
                    return res.status(400).json({
                        successful : false, 
                        message : "Position Type Id is invalid"
                    })
                }
                else{
                    const insertJobQuery = `
                    INSERT INTO job_listing (position_name, description, qualification, minimum_salary, maximum_salary, positiontype_id, company_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `

                    const values = jobListingModel(position_name, description, qualification, minimum_salary, maximum_salary, positiontype_id, company_id)
                    const jobListingObj = [values.position_name, values.description, values.qualification, values.minimum_salary, values.maximum_salary, positionTypeRows[0].id, values.company_id]
                    const result = await connection.query(insertJobQuery, jobListingObj)
        
                    const jobListingId = result.insertId 
        
                    for (let disability_id of disability_ids) {
                        const selectDisabilityIdQuery = `SELECT id FROM disability WHERE type = ?`
                        const rows = await connection.query(selectDisabilityIdQuery, [disability_id])

                        if(rows.length === 0){
                            const deleteCreatedJob = `DELETE FROM job_listing WHERE id = ?`
                            await connection.query(deleteCreatedJob, [jobListingId])
                            return res.status(400).json({
                                successful : false, 
                                message : "Disability Id does not exist"
                            })
                        } else {
                            const insertDisabilityJobQuery = `
                            INSERT INTO disability_job_listing (disability_id, joblisting_id)
                            VALUES (?, ?)
                        `
                            await connection.query(insertDisabilityJobQuery, [rows[0].id, jobListingId])
                        }
                    }

                    return res.status(200).json({
                        successful: true,
                        message: "Job listing posted successfully!"
                    })
                }
            } finally {
                connection.release()
            }
        } catch (err) {
            return res.status(500).json({
                successful: false,
                message: err.message
            })
        }
    }
}



const viewJobListing = async (req,res,next) =>{


    let id = req.params.id

    if(id == null){
        return res.status(404).json({
            successful : false, 
            message : "id is missing"
        })
    }
    else{

        try{
            const connection = await database.pool.getConnection()

            try{
                const selectQuery = `
                SELECT 
                    job_listing.id,
                    job_listing.position_name, 
                    job_listing.description, 
                    job_listing.qualification, 
                    job_listing.minimum_salary,
                    job_listing.maximum_salary, 
                    position_type.type AS position_type,
                    company.name AS company_name,
                    company.email AS company_email,
                    company.address AS company_address,
                    company.contact_number AS company_contact_number,
                    company.description AS company_description,
                    GROUP_CONCAT(disability.type SEPARATOR ', ') AS disability_types
                FROM job_listing
                JOIN position_type ON job_listing.positiontype_id = position_type.id 
                JOIN company ON job_listing.company_id = company.id
                JOIN disability_job_listing ON job_listing.id = disability_job_listing.joblisting_id
                JOIN disability ON disability_job_listing.disability_id = disability.id
                WHERE job_listing.id = ?
                GROUP BY 
                    job_listing.id,
                    job_listing.position_name, 
                    job_listing.description, 
                    job_listing.qualification, 
                    job_listing.minimum_salary,
                    job_listing.maximum_salary, 
                    position_type.type,
                    company.name
            `

                const rows = await connection.query(selectQuery, [id])

                if (rows.length === 0) {
                    return res.status(404).json({
                        successful: false,
                        message: "Job Listing not found"
                    })
                }
                else {
                    return res.status(200).json({
                        successful : true,
                        message : "Successfully Retrieved Job Listing",
                        data : rows
                    })
                    
                }
            }
            finally{
                connection.release()
            }
        }
        catch(err){
            return res.status(500).json({
                successful : false, 
                message : err.message
            })
        }
    }

} 

const viewJobListingViaUserNewestToOldest = async (req,res,next) =>{


    let id = req.params.id

    if(id == null){
        return res.status(404).json({
            successful : false, 
            message : "id is missing"
        })
    }
    else{

        try{
            const connection = await database.pool.getConnection()

            try{
                const selectQuery = `
                SELECT 
                    job_listing.id,
                    job_listing.position_name, 
                    job_listing.description, 
                    job_listing.qualification, 
                    job_listing.minimum_salary,
                    job_listing.maximum_salary, 
                    position_type.type AS position_type,
                    company.name AS company_name,
                    company.email AS company_email,
                    company.address AS company_address,
                    company.contact_number AS company_contact_number,
                    company.description AS company_description
                FROM job_listing
                JOIN position_type ON job_listing.positiontype_id = position_type.id 
                JOIN company ON job_listing.company_id = company.id
                JOIN disability_job_listing ON job_listing.id = disability_job_listing.joblisting_id
                JOIN disability ON disability_job_listing.disability_id = disability.id
                JOIN user ON user.disability_id = disability.id
                WHERE user.id = ?
                ORDER BY job_listing.date_created DESC`

                const rows = await connection.query(selectQuery, [id])

                if (rows.length === 0) {
                    return res.status(404).json({
                        successful: false,
                        message: "Job Listing not found"
                    })
                }
                else {
                    return res.status(200).json({
                        successful : true,
                        message : "Successfully Retrieved Job Listing",
                        data : rows
                    })
                    
                }
            }
            finally{
                connection.release()
            }
        }
        catch(err){
            return res.status(500).json({
                successful : false, 
                message : err.message
            })
        }
    }

} 

const viewJobListingViaUserOldestToNewest = async (req,res,next) =>{


    let id = req.params.id

    if(id == null){
        return res.status(404).json({
            successful : false, 
            message : "id is missing"
        })
    }
    else{

        try{
            const connection = await database.pool.getConnection()

            try{
                const selectQuery = `
                SELECT 
                    job_listing.id,
                    job_listing.position_name, 
                    job_listing.description, 
                    job_listing.qualification, 
                    job_listing.minimum_salary,
                    job_listing.maximum_salary, 
                    position_type.type AS position_type,
                    company.name AS company_name,
                    company.email AS company_email,
                    company.address AS company_address,
                    company.contact_number AS company_contact_number,
                    company.description AS company_description
                FROM job_listing
                JOIN position_type ON job_listing.positiontype_id = position_type.id 
                JOIN company ON job_listing.company_id = company.id
                JOIN disability_job_listing ON job_listing.id = disability_job_listing.joblisting_id
                JOIN disability ON disability_job_listing.disability_id = disability.id
                JOIN user ON user.disability_id = disability.id
                WHERE user.id = ?
                ORDER BY job_listing.date_created ASC`

                const rows = await connection.query(selectQuery, [id])

                if (rows.length === 0) {
                    return res.status(404).json({
                        successful: false,
                        message: "Job Listing not found"
                    })
                }
                else {
                    return res.status(200).json({
                        successful : true,
                        message : "Successfully Retrieved Job Listing",
                        data : rows
                    })
                    
                }
            }
            finally{
                connection.release()
            }
        }
        catch(err){
            return res.status(500).json({
                successful : false, 
                message : err.message
            })
        }
    }

} 


const viewJobsCreatedByCompanyNewestToOldest = async (req, res, next) => {
    let id = req.params.id

    if(id == null){
        return res.status(404).json({
            successful : false, 
            message : "id is missing"
        })
    }
    else{

        try{
            const connection = await database.pool.getConnection()

            try{
                const selectQuery = `
                    SELECT 
                        job_listing.id,
                        job_listing.position_name, 
                        job_listing.description, 
                        job_listing.qualification, 
                        job_listing.minimum_salary,
                        job_listing.maximum_salary, 
                        position_type.type AS position_type,
                        company.name AS company_name,
                        company.email AS company_email,
                        company.address AS company_address,
                        company.contact_number AS company_contact_number,
                        company.description AS company_description,
                        GROUP_CONCAT(disability.type SEPARATOR ', ') AS disability_types,
                        job_listing.date_created
                    FROM job_listing
                    JOIN position_type ON job_listing.positiontype_id = position_type.id 
                    JOIN company ON job_listing.company_id = company.id
                    JOIN disability_job_listing ON job_listing.id = disability_job_listing.joblisting_id
                    JOIN disability ON disability_job_listing.disability_id = disability.id
                    WHERE company.id = ?
                    GROUP BY 
                        job_listing.id, 
                        job_listing.position_name, 
                        job_listing.description, 
                        job_listing.qualification, 
                        job_listing.minimum_salary,
                        job_listing.maximum_salary, 
                        position_type.type,
                        company.name,
                        job_listing.date_created
                    ORDER BY job_listing.date_created DESC  `

                const rows = await connection.query(selectQuery, [id])

                if (rows.length === 0) {
                    return res.status(404).json({
                        successful: false,
                        message: "Company's Job Listings not found"
                    })
                }
                else {
                    return res.status(200).json({
                        successful : true,
                        message : "Successfully Retrieved Company's Job Listing",
                        data : rows
                    })
                    
                }
            }
            finally{
                connection.release()
            }
        }
        catch(err){
            return res.status(500).json({
                successful : false, 
                message : err.message
            })
        }
    }

}

const viewJobsCreatedByCompanyOldestToNewest = async (req, res, next) => {
    let id = req.params.id

    if(id == null){
        return res.status(404).json({
            successful : false, 
            message : "id is missing"
        })
    }
    else{

        try{
            const connection = await database.pool.getConnection()

            try{
                const selectQuery = `
                SELECT 
                    job_listing.id,
                    job_listing.position_name, 
                    job_listing.description, 
                    job_listing.qualification, 
                    job_listing.minimum_salary,
                    job_listing.maximum_salary, 
                    position_type.type AS position_type,
                    company.name AS company_name,
                    company.email AS company_email,
                    company.address AS company_address,
                    company.contact_number AS company_contact_number,
                    company.description AS company_description,
                    GROUP_CONCAT(disability.type SEPARATOR ', ') AS disability_types,
                    job_listing.date_created
                FROM job_listing
                JOIN position_type ON job_listing.positiontype_id = position_type.id 
                JOIN company ON job_listing.company_id = company.id
                JOIN disability_job_listing ON job_listing.id = disability_job_listing.joblisting_id
                JOIN disability ON disability_job_listing.disability_id = disability.id
                WHERE company.id = ?
                GROUP BY 
                    job_listing.id, 
                    job_listing.position_name, 
                    job_listing.description, 
                    job_listing.qualification, 
                    job_listing.minimum_salary,
                    job_listing.maximum_salary, 
                    position_type.type,
                    company.name,
                    job_listing.date_created
                ORDER BY job_listing.date_created ASC`

                const rows = await connection.query(selectQuery, [id])

                if (rows.length === 0) {
                    return res.status(404).json({
                        successful: false,
                        message: "Company's Job Listings not found"
                    })
                }
                else {
                    return res.status(200).json({
                        successful : true,
                        message : "Successfully Retrieved Company's Job Listing",
                        data : rows
                    })
                    
                }
            }
            finally{
                connection.release()
            }
        }
        catch(err){
            return res.status(500).json({
                successful : false, 
                message : err.message
            })
        }
    }

}


const updateJobListing = async(req,res,next) =>{
    let id = req.params.id
    let position_name = req.body.position_name
    let description = req.body.description
    let qualification = req.body.qualification
    let minimum_salary = req.body.minimum_salary
    let maximum_salary = req.body.maximum_salary
    let positiontype_id = req.body.positiontype_id

    if(!id || !position_name || !description || !qualification || !positiontype_id){
        return res.status(400).json({
            successful : false,
            message : "One or more details are missing"
        })
    }
    else if(util.checkSpecialChar(position_name)){
        return res.status(400).json({
            successful : false,
            message : "Postion name must not contain special characters"
        })
    }
    else if(!util.checkNumbers(minimum_salary) || minimum_salary < 0){
        return res.status(400).json({
            successful : false,
            message : "Minimum Salary must only contain numbers that are greater than or equal 0"
        })
    }
    else if(!util.checkNumbers(maximum_salary) || maximum_salary <= minimum_salary){
        return res.status(400).json({
            successful : false,
            message : "Maximum Salary must only contain numbers that are greater than minimum Salary"
        })
    }
    else{

        try{

            const connection = await database.pool.getConnection()

            try{

                const selectPositionTypeId = `SELECT id FROM position_type WHERE id = ?`
                const positionTypeRows = await connection.query(selectPositionTypeId, [positiontype_id])

                if(positionTypeRows.length === 0) {
                    return res.status(400).json({
                        successful : false, 
                        message : "Position Type Id is invalid"
                    })
                }
                else{

                    const updateQuery = `UPDATE job_listing SET position_name = ?, description = ?, qualification = ?, minimum_salary = ?, maximum_salary = ? WHERE id = ?`
                    const values = [position_name, description,  qualification, minimum_salary, maximum_salary, id]
    
                    const result = await connection.query(updateQuery, values)
    
                    if (result.affectedRows === 0) {
                        return res.status(404).json({
                            successful: false,
                            message: "Job Listing not found"
                        })
                    }
                    else{
                        return res.status(200).json({
                            successful: true,
                            message: "Job Listing updated successfully"
                        })
                    }

                }
            }
            finally{
                connection.release
            }
        }
        catch(err){
            return res.status(500).json({
                successful : false, 
                message : err.message
            })
        }
    }
}
const deleteJob = async(req,res,next) => {
    let id = req.params.id

    if(id === null){
        return res.status(404).json({
            successful : false,
            message : "Id is missing"
        })
    }
    else{
        try{
            const connection = await database.pool.getConnection()

            try{

                const selectQuery = `SELECT description FROM job_listing WHERE id = ?`
                const rows = await connection.query(selectQuery, [id])

                    if(rows.length === 0){
                        return res.status(404).json({
                            successful : false, 
                            message : "Job listing not Found"
                        })
                    }  
                    else{

                        const deleteQuery = `DELETE FROM job_listing WHERE id = ?`
                        await connection.query(deleteQuery, [id])

                        return res.status(200).json({
                            successful : true, 
                            message : " Successfully Deleted Job Listing"
                        })
                    } 
                
            }
            finally{
                connection.release()
            }
        }
        catch(err){
            return res.status(500).json({
                successful : false,
                message : err.message
            })
        }
    }
}

module.exports = {
    postJobs,
    viewJobListing,
    viewJobListingViaUserNewestToOldest,
    viewJobListingViaUserOldestToNewest,
    viewJobsCreatedByCompanyNewestToOldest,
    viewJobsCreatedByCompanyOldestToNewest,
    updateJobListing,
    deleteJob
}