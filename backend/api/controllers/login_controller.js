
const { json } = require('body-parser')
const database = require('../models/connection_db')
const bcrypt = require('bcrypt')

const login = async (req, res, next) => {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
        return res.status(404).json({
            successful: false,
            message: "Email or Password is missing"
        });
    }

    try {
        const connection = await database.pool.getConnection();
        try {
            let query, storedPassword, role, status;

            // Query each table until a match is found
            const tables = ['user', 'company', 'admin'];
            for (let table of tables) {
                query = `SELECT email, password, role${table !== 'admin' ? ', status' : ''} FROM ${table} WHERE email = ?`;
                const rows = await connection.query(query, [email]);

                if (rows.length > 0) {
                    storedPassword = rows[0].password;
                    role = rows[0].role;
                    status = table !== 'admin' ? rows[0].status : null;
                    break;
                }
            }

            if (!storedPassword) {
                return res.status(400).json({
                    successful: false,
                    message: "Invalid Credentials"
                });
            }

            // Verify the password
            const passwordMatch = await bcrypt.compare(password, storedPassword);

            if (!passwordMatch) {
                return res.status(400).json({
                    successful: false,
                    message: "Invalid Credentials"
                });
            }

            // Check status for user and company roles
            if (role !== "admin" && status === "PENDING") {
                return res.status(400).json({
                    successful: false,
                    message: `${role.charAt(0).toUpperCase() + role.slice(1)}'s Account is under Verification. Please wait for the email confirmation.`
                });
            }

            // Successful login response
            return res.status(200).json({
                successful: true,
                role: role,
                message: `Successfully Logged In as ${role.charAt(0).toUpperCase() + role.slice(1)}.`
            });

        } finally {
            connection.release();
        }
    } catch (err) {
        return res.status(500).json({
            successful: false,
            message: err.message
        });
    }
};


module.exports = {
    login
}
