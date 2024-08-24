const { json } = require('body-parser')
const database = require('../models/connection_db')
const {adminModel} = require('../models/admin_model')
const util = require('./util')
const bcrypt = require('bcrypt')

const registerAdmin = async (req, res, next) => {

    let firstName = req.body.firstName.toLowerCase()
    let lastName = req.body.lastName.toLowerCase()
    let email = req.body.email.toLowerCase()
    let password = req.body.password
    let confirmPassword = req.body.confirm_password


    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
        successful: false,
        message: "One or more details are missing"
        })
    }

    else if (util.checkNumbersAndSpecialChar(firstName) || util.checkNumbersAndSpecialChar(lastName)) {
        return res.status(400).json({
        successful: false,
        message: "Invalid Name format"
        })
    }

    else if (!util.checkEmail(email)) {
        return res.status(400).json({
        successful: false,
        message: "Invalid Email"
        })
    }
    else if(!util.checkPassword(password)){
        return res.status(400).json({
            successful : false,
            message : "Invalid Password Format. It should have atleast one digit, one uppercase, one lowercase, one special character, and atleast 8 in length"
        })
    }
    else if(password != confirmPassword){
        return res.status(400).json({
            successful : false, 
            message : "Passwords does not match"
        })
    }
    else{
        try {
            const connection = await database.pool.getConnection()
    
            try {
                const selectQuery = `SELECT email FROM admin WHERE email = ?`
                const rows = await connection.query(selectQuery, [email])
    
                if (rows.length > 0) {
                    return res.status(400).json({
                     successful: false,
                     message: "Email already exists"
                    })
                }
    
               else{

                const selectEmailQuery = `SELECT email from user WHERE email = ?`
                const emailRows = await connection.query(selectEmailQuery, [email])

                if(emailRows.length > 0){
                    return res.status(400).json({
                        successful : false,
                        message : "Email already Exist"
                    })
                }
                else{
                        const selectEmailQuery = `SELECT email from company WHERE email = ?`
                        const emailRows = await connection.query(selectEmailQuery, [email])

                        if(emailRows.length > 0){
                            return res.status(400).json({
                                successful : false,
                                message : "Email already Exist"
                            })
                        }
                        else{
                            const insertQuery = `INSERT INTO admin (first_name, last_name, email, password) VALUES (?, ?, ?, ?)`
                            const hashedPassword = await bcrypt.hash(password, 10)
                            const values = adminModel(firstName, lastName, email, hashedPassword)
                            const adminObj = [values.first_name, values.last_name, values.email, values.password]
                            
                            await connection.query(insertQuery, adminObj)
                
                            return res.status(200).json({
                                successful: true,
                                message: "Successfully Registered Admin"
                            })
                        }
                    }
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

const loginAdmin = async (req, res, next) => {
    let email = req.body.email.toLowerCase()
    let password = req.body.password

    if (!email || !password) {
        return res.status(404).json({
            successful: false,
            message: "Email or Password is missing"
        })
    } else {
        try {
            const connection = await database.pool.getConnection()

            try {
                const selectAdminQuery = `SELECT id, email, password FROM admin WHERE email = ?`
                const adminRows = await connection.query(selectAdminQuery, [email])

                if (adminRows.length === 0) {
                    return res.status(400).json({
                        successful: false,
                        message: "Invalid Credentials"
                    })
                }

                const storedPassword = adminRows[0].password
                const passwordMatch = await bcrypt.compare(password, storedPassword)

                if (!passwordMatch) {
                    return res.status(400).json({
                        successful: false,
                        message: "Invalid Credentials"
                    })
                }
               else {
                    return res.status(200).json({
                        successful: true,
                        message: "Successfully Login"
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

const viewAdmins = async (req, res, next) => {

    try{
        const connection = await database.pool.getConnection()

        try{
              const selectQuery = `SELECT id, first_name, last_name, email FROM admin`

              const rows = await connection.query(selectQuery)

              return res.status(200).json({
                successful : true,
                message : "Successfully Retrieved Admins",
                data : rows
              })
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



const viewUsers = async (req, res, next) => {

    try{
        const connection = await database.pool.getConnection()

        try{
               const selectQuery = `
               SELECT 
                    user.id, 
                    disability.type AS type,
                    CONCAT(user.first_name, ' ', user.middle_initial,'. ', user.last_name) AS full_name,
                    email, 
                    address,
                    city,
                    gender,
                    birth_date,
                    contact_number,
                    formal_picture 
               FROM user 
               JOIN disability ON user.disability_id = disability.id
               where status = 'VERIFIED'`

              const rows = await connection.query(selectQuery)

              return res.status(200).json({
                successful : true,
                message : "Successfully Retrieved Users",
                data : rows
              })
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


const viewCompanies = async (req, res, next) => {
    
    try{
        const connection = await database.pool.getConnection()

        try{
              const selectQuery = `
              SELECT id, name, description, address, city, contact_number, email, profile_picture FROM company where status = 'VERIFIED'`

              const rows = await connection.query(selectQuery)

              return res.status(200).json({
                successful : true,
                message : "Successfully Retrieved Companies",
                data : rows
              })
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



const viewAllJobListingNewestToOldest = async (req,res,next) =>{
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
                GROUP_CONCAT(disability.type SEPARATOR ', ') AS disability_types
            FROM job_listing
            JOIN position_type ON job_listing.positiontype_id = position_type.id 
            JOIN company ON job_listing.company_id = company.id
            JOIN disability_job_listing ON job_listing.id = disability_job_listing.joblisting_id
            JOIN disability ON disability_job_listing.disability_id = disability.id 
            GROUP BY 
                job_listing.id,
                job_listing.position_name, 
                job_listing.description, 
                job_listing.qualification, 
                job_listing.minimum_salary,
                job_listing.maximum_salary, 
                position_type.type,
                company.name
            ORDER BY job_listing.date_created DESC
                `



            const rows = await connection.query(selectQuery)

            if (rows.length === 0) {
                return res.status(404).json({
                    successful: false,
                    message: "Job Listing not found"
                })
            }
            else {
                return res.status(200).json({
                    successful : true,
                    message : "Successfully Retrieved All Job Listing",
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

const viewAllJobListingOldestToNewest = async (req,res,next) =>{
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
                GROUP_CONCAT(disability.type SEPARATOR ', ') AS disability_types
            FROM job_listing
            JOIN position_type ON job_listing.positiontype_id = position_type.id 
            JOIN company ON job_listing.company_id = company.id
            JOIN disability_job_listing ON job_listing.id = disability_job_listing.joblisting_id
            JOIN disability ON disability_job_listing.disability_id = disability.id 
            GROUP BY 
                job_listing.id,
                job_listing.position_name, 
                job_listing.description, 
                job_listing.qualification, 
                job_listing.minimum_salary,
                job_listing.maximum_salary, 
                position_type.type,
                company.name
            ORDER BY job_listing.date_created ASC
                `



            const rows = await connection.query(selectQuery)

            if (rows.length === 0) {
                return res.status(404).json({
                    successful: false,
                    message: "Job Listing not found"
                })
            }
            else {
                return res.status(200).json({
                    successful : true,
                    message : "Successfully Retrieved All Job Listing",
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


const adminChangePassword = async (req,res,next) =>{

    let id = req.params.id
    let password = req.body.password
    let newPassword = req.body.new_password
    let confirmPassword = req.body.confirm_password

    if(!id || !password || !newPassword || !confirmPassword){
        return res.status(404).json({
            successful : false, 
            message : "One or more details are missing"
        })
    }
    else if(!util.checkPassword(newPassword)){
        return res.status(404).json({
            successful : false, 
            message : "Invalid Password Format. It should have atleast one digit, one uppercase, one lowercase, one special character, and atleast 8 in length"
        })
    }
    else if(newPassword != confirmPassword){
        return res.status(404).json({
            successful : false,
            message : "Password Does not match"
        })
    }
    else{
        try{
            const connection = await database.pool.getConnection()

            try{

                const selectIdQuery = `SELECT id, password FROM admin WHERE id = ?`
                const adminRows = await connection.query(selectIdQuery, [id])

                if(adminRows.length === 0){
                    return res.status(400).json({
                        successful : false,
                        message : "Invalid admin ID"
                    })
                }
                else{
                    const storedPassword = adminRows[0].password
                    const passwordMatch = await bcrypt.compare(password, storedPassword)

                    if (!passwordMatch) {
                        return res.status(400).json({
                            successful: false,
                            message: "Invalid Credentials"
                        })
                    }
                   else {
                        const passwordMatch = await bcrypt.compare(newPassword, storedPassword)
                        if (passwordMatch) {
                            return res.status(400).json({
                                successful: false,
                                message: "Password must not be the same"
                            })
                        }
                        else{
                            const updateQuery = `UPDATE admin SET password = ? WHERE id = ?`
                            const hashedPassword = await bcrypt.hash(newPassword, 10)
                            const values = [hashedPassword, id]
            
                            await connection.query(updateQuery, values)
                            return res.status(200).json({
                                successful: true,
                                message: "Password updated successfully"
                            })
                        }
                  
                
                    }
                }
                
            }
            finally{
                connection.release()
            }
        }
        catch(err){
            return res.status(500).json({
                successful :false ,
                message : err.message
            })
        }
    }
}

const deleteUser = async (req,res,next) =>{

    let id = req.params.id

    if(id === null){
        return res.status(404).json({
            successful : false, 
            message : "id is missing"
        })
    }
    else{

        try{

            const connection = await database.pool.getConnection()
    
            try{
    
                const selectQuery = `SELECT first_name from user where id = ?`
                const rows = await connection.query(selectQuery, [id])

                if(rows.length === 0){
                    return res.status(404).json({
                        successful : false, 
                        message : "User Not Found"
                    })
                }
                else{
                    const deleteQuery = `DELETE from user WHERE id = ?`
                    await connection.query(deleteQuery, [id])

                    return res.status(200).json({
                        successful : true, 
                        message : "Successfully Deleted User"
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

const deleteCompany = async (req,res,next) =>{

    let id = req.params.id

    if(id === null){
        return res.status(404).json({
            successful : false, 
            message : "id is missing"
        })
    }
    else{

        try{

            const connection = await database.pool.getConnection()
    
            try{
    
                const selectQuery = `SELECT name from company where id = ?`
                const rows = await connection.query(selectQuery, [id])

                if(rows.length === 0){
                    return res.status(404).json({
                        successful : false, 
                        message : "Company Not Found"
                    })
                }
                else{
                    const deleteQuery = `DELETE from company WHERE id = ?`
                    await connection.query(deleteQuery, [id])

                    return res.status(200).json({
                        successful : true, 
                        message : "Successfully Deleted Company"
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

const searchUser = async (req, res, next) => {

    let first_name = req.params.first_name

    if(!first_name){
        return res.status(400).json({
            successful : false,
            message : "Name is missing"
        })
    }
   else{
        try{
            const connection = await database.pool.getConnection()

            try{
                const selectQuery = `
                SELECT 
                        user.id, 
                        disability.type,
                        CONCAT(user.first_name, ' ', user.middle_initial,'. ', user.last_name) AS full_name,
                        email, 
                        CONCAT(address, ' ', city) AS Location,
                        gender,
                        birth_date,
                        contact_number,
                        formal_picture 
                FROM user 
                JOIN disability ON user.disability_id = disability.id
                where status = 'VERIFIED' AND first_name = ?`

                const rows = await connection.query(selectQuery, [first_name])


                if(rows.length == 0 ){
                    return res.status(404).json({
                        successful : false,
                        message : "No User was Found"
                    })
                }
                else{
                    return res.status(200).json({
                        successful : true,
                        message : "Successfully Retrieved Users",
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


const viewAdminViaId = async (req, res, next) => {

    let id = req.params.id 

    if(!id){
        return res.status(404).json({
            successful : false,
            message : "ID Is Missing"
        })
    }
    else{
        try{
            const connection = await database.pool.getConnection()
    
            try{
                   const selectQuery = `SELECT id, first_name, last_name, email FROM admin WHERE id = ?`
    
                  const rows = await connection.query(selectQuery, [id])

                  if(rows.length == 0){
                    return res.status(404).json({
                        successful : false,
                        message : "ID is Invalid"
                    })
                  }
                  else{
                    return res.status(200).json({
                        successful : true,
                        message : "Successfully Retrieved Admin",
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



module.exports = {
    registerAdmin,
    loginAdmin,
    viewAdmins,
    viewUsers,
    viewCompanies,
    viewAllJobListingNewestToOldest,
    viewAllJobListingOldestToNewest,
    viewJobListing,
    adminChangePassword,
    deleteUser,
    deleteCompany,
    deleteJob,
    searchUser,
    viewAdminViaId,
    updateJobListing
}