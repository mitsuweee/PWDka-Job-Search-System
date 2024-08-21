const { json } = require('body-parser')
const database = require('../models/connection_db')
const {companyModel} = require('../models/company_model')
const util = require('./util')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')


const registerCompany = async (req,res,next) => {
    

    let name = req.body.name
    let address = req.body.address .toLowerCase()
    let city = req.body.city.toLowerCase()
    let description = req.body.description
    let contact_number = req.body.contact_number
    let email = req.body.email.toLowerCase() 
    let password = req.body.password
    let confirmPassword = req.body.confirm_password
    let profile_picture = req.body.profile_picture


    if(!name || !address || !city || !description || !contact_number || !email || !password || !profile_picture){
        return res.status(404).json({
            successful : false,
            message : "One or more details are missing"
        })
    }
    else if (util.checkSpecialChar(address)){
        return res.status(400).json({
            successful : false,
            message : "Invalid Address Format"
        })
    }
    else if (util.checkNumbersAndSpecialChar(city)){
        return res.status(400).json({
            successful : false,
            message : "Invalid City Format"
        })
    }
    else if (!util.checkContactNumber(contact_number)){
        return res.status(400).json({
            successful : false,
            message : "Invalid Contact Number Format"
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
        try{

            const connection = await database.pool.getConnection()

            try{
                const selectQuery = `SELECT email from company where email = ?`
                const rows = await connection.query(selectQuery , [email]) 

                if(rows.length > 0){
                    return res.status(400).json({
                        successful : false, 
                        message : "Email already exist"
                    })
                }
                else{

                    const selectEmailQuery = `SELECT email from admin WHERE email = ?`
                    const emailRows = await connection.query(selectEmailQuery, [email])

                    if(emailRows.length > 0){
                        return res.status(400).json({
                            successful : false,
                            message : "Email already Exist"
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
                            const insertQuery = `INSERT into company (name, address, city, description, contact_number, email, password, profile_picture) Values (?, ?, ?, ?, ?, ?, ?, ?)`
                            const hashedPassword = await bcrypt.hash(password, 10)
                            const values = companyModel(name, address, city, description, contact_number, email, hashedPassword, profile_picture)
                            const companyObj = [values.name, values.address, values.city, values.description, values.contact_number, values.email, values.password, values.profile_picture]
                            
                            await connection.query(insertQuery , companyObj)
        
                            const transporter = nodemailer.createTransport({
                                service: 'Gmail', 
                                auth: {
                                    user: 'livcenteno24@gmail.com',
                                    pass: 'glwg czmw tmdb rzvn' 
                                }
                            })
        
                           
                            const mailOptions = {
                                from: 'livcenteno24@gmail.com',
                                to: email,
                                subject: 'Account Verification',
                                text: `Dear ${values.name},

                                Thank you for registering. Your Company's account is under review and will be activated once verified. We will notify you once the verification process is complete.
                                
                                Here are the details you provided:
                                
                                - Company Name: ${values.name}
                                - Address: ${values.address}, ${values.city}
                                - Description: ${values.description}
                                - Contact Number: ${values.contact_number}
                                - Email: ${values.email}
                                
                                Best regards,
                                PWDKA Team`
                            }
        
                            // Send the email
                            await transporter.sendMail(mailOptions)
        
        
                            return res.status(200).json({
                                successful : true, 
                                message : "Successfully Registered Company! Before having the capability to access our website, We will check if all the data you have inputed is legitimate. Please wait for our email verification if the Company is accepted or rejected. Thank you!"
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
                successful : false, 
                message : err.message
            })
        }
    }
}


const loginCompany = async (req, res, next) => {
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
                const selectCompanyQuery = `SELECT email, password, status FROM company WHERE email = ?`
                const companyRows = await connection.query(selectCompanyQuery, [email])

                if (companyRows.length === 0) {
                    return res.status(400).json({
                        successful: false,
                        message: "Invalid Credentials"
                    })
                }

                const storedPassword = companyRows[0].password
                const passwordMatch = await bcrypt.compare(password, storedPassword)

                if (!passwordMatch) {
                    return res.status(400).json({
                        successful: false,
                        message: "Invalid Credentials"
                    })
                }

                else if (companyRows[0].status === "PENDING") {
                    return res.status(400).json({
                        successful: false,
                        message: "The Company's Account is under Verification. Please wait for the email confirmation."
                    })
                } else if (companyRows[0].status === "VERIFIED") {
                    return res.status(200).json({
                        successful: true,
                        id: companyRows[0].id, // added role
                        role: companyRows[0].role,
                        message: "Successfully Logged In."
                    })
                } else {
                    return res.status(500).json({
                        successful: false,
                        message: err.message
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


const updateCompany = async (req,res,next) =>{

    let id = req.params.id 
    let name = req.body.name
    let address = req.body.address
    let city = req.body.city 
    let description = req.body.description
    let contactNumber = req.body.contact_number
    let profilePicture = req.body.profile_picture


    if(!id || !name || !address || !city || !description || !contactNumber || !profilePicture){
        return res.status(404).json({
            successful : false, 
            message : "One or more details are missing"
        })
    }
    else if (util.checkSpecialChar(address)){
        return res.status(400).json({
            successful : false,
            message : "Invalid Address Format"
        })
    }
    else if (util.checkNumbersAndSpecialChar(city)){
        return res.status(400).json({
            successful : false,
            message : "Invalid City Format"
        })
    }
    else if (!util.checkContactNumber(contactNumber)){
        return res.status(400).json({
            successful : false,
            message : "Invalid Contact Number Format"
        })
    }
    else{

        try{
            const connection = await database.pool.getConnection()

            try{

                const updateQuery = `UPDATE company SET name = ?,address = ?, city = ?, description = ?, contact_number = ?, profile_picture = ? WHERE id = ?`
                const values = [name, address, city, description,  contactNumber, profilePicture, id]

                const result = await connection.query(updateQuery, values)

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        successful: false,
                        message: "Company not found"
                    })
                }
                else{
                    return res.status(200).json({
                        successful: true,
                        message: "Company updated successfully"
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


const companyChangePassword = async (req,res,next) =>{

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

                const selectIdQuery = `SELECT id, password FROM company WHERE id = ?`
                const companyRows = await connection.query(selectIdQuery, [id])

                if(companyRows.length === 0){
                    return res.status(400).json({
                        successful : false,
                        message : "Invalid company ID"
                    })
                }
                else{
                    const storedPassword = companyRows[0].password
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
                            const updateQuery = `UPDATE company SET password = ? WHERE id = ?`
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


const viewCompanyViaId = async (req, res, next) => {

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
                   const selectQuery = `
                   SELECT id, name, description, CONCAT(address, ' ', city) AS Location, contact_number, email, 
                   profile_picture 
                   FROM company 
                   where id = ?`
    
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
                        message : "Successfully Retrieved Company",
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





module.exports = {
    registerCompany,
    loginCompany,
    updateCompany,
    companyChangePassword,
    viewCompanyViaId
}