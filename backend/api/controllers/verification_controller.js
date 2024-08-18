const { json } = require('body-parser')
const database = require('../models/connection_db')
const nodemailer = require('nodemailer')


const viewPendingUsers = async (req, res, next) => {

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
               where status = 'PENDING'`

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

const verifyCompany = async (req,res,next) =>{

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
                const selectQuery = 'SELECT email FROM company WHERE id = ?'
                const rows = await connection.query(selectQuery, [id])

                if (rows.length === 0) {
                    return res.status(404).json({
                        successful: false,
                        message: "Company not found"
                    })
                }
                else {
                    const updateQuery = `UPDATE company SET status = 'VERIFIED' WHERE id = ?`

                    connection.query(updateQuery, [id])
                    const transporter = nodemailer.createTransport({
                        service: 'Gmail', 
                        auth: {
                            user: 'livcenteno24@gmail.com',
                            pass: 'glwg czmw tmdb rzvn' 
                        }
                    })

                   
                    const mailOptions = {
                        from: 'livcenteno24@gmail.com',
                        to: rows[0].email,
                        subject: 'ACCOUNT VERIFIED!',
                        text: `Dear User,\n\nCongratulations! Your company has been successfully verified. You can now access our platform.\n\nBest regards,\nPWDKA TEAM`
                    }

                    // Send the email
                    await transporter.sendMail(mailOptions)

                    return res.status(200).json({
                        successful : true, 
                        message : "Successfully Verified Company!"
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

const declineCompany = async (req,res,next) =>{

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
                const selectQuery = 'SELECT email FROM company WHERE id = ?'
                const rows = await connection.query(selectQuery, [id])

                if (rows.length === 0) {
                    return res.status(404).json({
                        successful: false,
                        message: "Company not found"
                    })
                }
                else {
                    const deleteQuery = `DELETE FROM company WHERE id = ?`

                    connection.query(deleteQuery, [id])
                    const transporter = nodemailer.createTransport({
                        service: 'Gmail', 
                        auth: {
                            user: 'livcenteno24@gmail.com',
                            pass: 'glwg czmw tmdb rzvn' 
                        }
                    })

                   
                    const mailOptions = {
                        from: 'livcenteno24@gmail.com',
                        to: rows[0].email,
                        subject: 'UNABLE TO VERIFY COMPANY',
                        text: `Dear User,\n\nYour Request To verify your company has been declined. Make sure the company is legitimate and all data that has been entered is correct. \nThe company can make another request to verify the account by registering again\n\nSincerely Yours,\nPWDKA TEAM`
                    }

                    // Send the email
                    await transporter.sendMail(mailOptions)

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

const verifyUser = async (req,res,next) =>{

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

                const selectQuery = 'SELECT email FROM user WHERE id = ?'
                const rows = await connection.query(selectQuery, [id])

                if (rows.length === 0) {
                    return res.status(404).json({
                        successful: false,
                        message: "user not found"
                    })
                }
                else{

                    const updateQuery = `UPDATE user SET status = 'VERIFIED' WHERE id = ?`
                    connection.query(updateQuery, [id])
                    const transporter = nodemailer.createTransport({
                        service: 'Gmail', 
                        auth: {
                            user: 'livcenteno24@gmail.com',
                            pass: 'glwg czmw tmdb rzvn' 
                        }
                    })

                   
                    const mailOptions = {
                        from: 'livcenteno24@gmail.com',
                        to: rows[0].email,
                        subject: 'ACCOUNT VERIFIED!',
                        text: `Dear User,\n\nCongratulations! Your Account has been successfully verified. You can now access our platform.\n\nBest regards,\nPWDKA TEAM`
                    }

                    // Send the email
                    await transporter.sendMail(mailOptions)
    
                    return res.status(200).json({
                        successful : true, 
                        message : "Successfully Verified User!"
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

const declineUser = async (req,res,next) =>{

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
                const selectQuery = 'SELECT email FROM user WHERE id = ?'
                const rows = await connection.query(selectQuery, [id])

                if (rows.length === 0) {
                    return res.status(404).json({
                        successful: false,
                        message: "user not found"
                    })
                }
                else {
                    const deleteQuery = `DELETE FROM user WHERE id = ?`

                    connection.query(deleteQuery, [id])
                    const transporter = nodemailer.createTransport({
                        service: 'Gmail', 
                        auth: {
                            user: 'livcenteno24@gmail.com',
                            pass: 'glwg czmw tmdb rzvn' 
                        }
                    })

                   
                    const mailOptions = {
                        from: 'livcenteno24@gmail.com',
                        to: rows[0].email,
                        subject: 'UNABLE TO VERIFY USER',
                        text: `Dear User,\n\nYour Request To verify your account has been declined. Make sure all data that has been entered is correct. \nThe user can make another request to verify the account by registering again\n\nSincerely Yours,\nPWDKA TEAM`
                    }

                    // Send the email
                    await transporter.sendMail(mailOptions)

                    return res.status(200).json({
                        successful : true, 
                        message : "Successfully Deleted user"
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
    verifyCompany,
    verifyUser,
    declineCompany,
    declineUser,
    viewPendingUsers
}