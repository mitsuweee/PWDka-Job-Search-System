const { json } = require('body-parser')
const database = require('../models/connection_db')
const util = require('./util')


const userChangePassword = async (req,res,next) =>{

    let password = req.body.password
    let newPassword = req.body.new_password
    let confirmPassword = req.body.confirm_password

    if(!password || !newPassword || !confirmPassword){
        return res.status(404).json({
            successful : false, 
            message : "One or more details are missing"
        })
    }
    else if(!util.checkPassword(newPassword)){
        return res.status(404).json({
            successful : false, 
        })
    }
}

module.exports = {
    userForgetPassword
}