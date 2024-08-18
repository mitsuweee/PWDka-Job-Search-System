

let userModel = (id, firstName, middleInitial, lastName, address, city, gender, birthDate, email, password, contactNumber, disability_id, formalPicture, pictureWithId, pictureOfPwdId) =>{
    let user = {
        id : id,
        first_name : firstName,
        middle_initial : middleInitial,
        last_name : lastName , 
        address : address ,
        city : city, 
        gender : gender,
        birth_date : birthDate ,
        email : email , 
        password : password ,
        contact_number : contactNumber ,
        disability_id : disability_id , 
        formal_picture : formalPicture,
        picture_with_id : pictureWithId,
        picture_of_pwd_id : pictureOfPwdId
    }
    return user
}

module.exports = {
    userModel
}