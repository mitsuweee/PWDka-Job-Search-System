


const companyModel = (name, address, city, description, contactNumber, email, password, profilePicture) =>{
        let company = {
            name : name,
            address : address,
            city : city,
            description : description,
            contact_number: contactNumber,
            email : email, 
            password : password,
            profile_picture : profilePicture
        }
        return company
}

module.exports = {
    companyModel
}