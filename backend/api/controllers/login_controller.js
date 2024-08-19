
const { json } = require('body-parser')
const database = require('../models/connection_db')
const bcrypt = require('bcrypt')

const login = async (req, res, next) => {
    const email = req.body.email.toLowerCase()
    const password = req.body.password

    if (!email || !password) {
        return res.status(404).json({
            successful: false,
            message: "Email or Password is missing"
        })
    }

    try {
        const connection = await database.pool.getConnection()
        try {
            let query, role, status, storedPassword

            // Query the user table first
            query = `SELECT email, password, 'user' AS role, status FROM user WHERE email = ?`
            let rows = await connection.query(query, [email])

            if (rows.length === 0) {
                // If no match in user, query the company table
                query = `SELECT email, password, 'company' AS role, status FROM company WHERE email = ?`
                rows = await connection.query(query, [email])
            }

            if (rows.length === 0) {
                // If no match in company, query the admin table
                query = `SELECT email, password, 'admin' AS role FROM admin WHERE email = ?`
                rows = await connection.query(query, [email])
            }

            if (rows.length === 0) {
                return res.status(400).json({
                    successful: false,
                    message: "Invalid Credentials"
                })
            }

            // Extract role, status, and password from the result
            storedPassword = rows[0].password
            role = rows[0].role
            status = rows[0].status  // Note: Admins might not have a status column

            // Verify the password
            const passwordMatch = await bcrypt.compare(password, storedPassword)

            if (!passwordMatch) {
                return res.status(400).json({
                    successful: false,
                    message: "Invalid Credentials"
                })
            }

            // Check status for user and company roles (admins may not have status)
            if (role !== "admin" && status === "PENDING") {
                return res.status(400).json({
                    successful: false,
                    message: `${role.charAt(0).toUpperCase() + role.slice(1)}'s Account is under Verification. Please wait for the email confirmation.`
                })
            }

            // Successful login response
            return res.status(200).json({
                successful: true,
                role: role,
                message: `Successfully Logged In as ${role.charAt(0).toUpperCase() + role.slice(1)}.`
            })

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


module.exports = {
    login
}
