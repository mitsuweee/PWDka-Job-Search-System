const mariadb = require('mariadb')

const pool = mariadb.createPool({
    host: "localhost",
    user: "root",
    database: "pwdka_db",
})

const connectDatabase = async () => {
    try {
        const connection = await pool.getConnection()
        console.log("Successfully connected to database")
        connection.release() 
    } catch (error) {
        console.error("Error connecting to database:", error)
    }
}

module.exports = {
    pool,
    connectDatabase
}
