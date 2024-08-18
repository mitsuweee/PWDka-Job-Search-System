

const adminModel = (firstName, lastName, email, password) =>{
    let admin = {
        first_name : firstName,
        last_name : lastName,
        email : email,
        password : password
    }
    return admin
}

module.exports = {
    adminModel
}