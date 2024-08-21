const { json } = require("body-parser");
const database = require("../models/connection_db");
const { userModel } = require("../models/user_model");
const util = require("./util");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const registerUser = async (req, res, next) => {

    let id = req.body.id;
    let first_name = req.body.first_name.toLowerCase();
    let middle_inital = req.body.middle_initial.toLowerCase();
    let last_name = req.body.last_name.toLowerCase();
    let address = req.body.address.toLowerCase();
    let city = req.body.city.toLowerCase();
    let gender = req.body.gender.toLowerCase();
    let birth_date = req.body.birth_date;
    let email = req.body.email.toLowerCase();
    let password = req.body.password;
    let confirmPassword = req.body.confirm_password;
    let contact_number = req.body.contact_number;
    let disability_id = req.body.disability_id;
    let formal_picture = req.body.formal_picture;
    let picture_with_id = req.body.picture_with_id;
    let picture_of_pwd_id = req.body.picture_of_pwd_id;

    if (
        !id ||
        !first_name ||
        !middle_inital ||
        !last_name ||
        !address ||
        !city ||
        !gender ||
        !birth_date ||
        !email ||
        !password ||
        !contact_number ||
        !disability_id ||
        !formal_picture ||
        !picture_with_id ||
        !picture_of_pwd_id
    ) {
        return res.status(404).json({
            successful: false,
            message: "One or more details are missing",
        });
    } else if (!util.checkPwdIdFormat(id)) {
        return res.status(400).json({
            successful: false,
            message: "Invalid ID number",
        });
    } else if (!util.checkCharacters(first_name)) {
        return res.status(400).json({
            successful: false,
            message: "First Name Must only contain alphabetical characters",
        });
    } else if (!util.checkMiddleInitial(middle_inital)) {
        return res.status(400).json({
            successful: false,
            message: "Middle Initial should be a single character",
        });
    } else if (!util.checkCharacters(last_name)) {
        return res.status(400).json({
            successful: false,
            message: "Last Name Must only contain alphabetical characters",
        });
    } else if (util.checkSpecialChar(address)) {
        return res.status(400).json({
            successful: false,
            message: "Special Characters are not allowed in Address",
        });
    } else if (!util.checkCharacters(city) || !city.endsWith("city")) {
        return res.status(400).json({
            successful: false,
            message: "City Must only contain alphabetical characters",
        });
    } else if (!util.checkCharacters(gender)) {
        return res.status(400).json({
            successful: false,
            message: "City Must only contain alphabetical characters",
        });
    } else if (util.calculateAge(birth_date) < 15) {
        return res.status(400).json({
            successful: false,
            message: "User must be 18 years old or higher",
        });
    } else if (!util.checkEmail(email)) {
        return res.status(400).json({
            successful: false,
            message: "Invalid Email",
        });
    } else if (!util.checkPassword(password)) {
        return res.status(400).json({
            successful: false,
            message:
                "Invalid Password Format. It should have atleast one digit, one uppercase, one lowercase, one special character, and atleast 8 in length",
        });
    } else if (password != confirmPassword) {
        return res.status(400).json({
            successful: false,
            message: "Passwords does not match",
        });
    } else if (!util.checkContactNumber(contact_number)) {
        return res.status(400).json({
            successful: false,
            message: "Invalid Contact Number Format",
        });
    } else {
        try {
            const connection = await database.pool.getConnection();

            try {
                const selectIdQuery = `SELECT id FROM user WHERE id = ?`;
                const idRows = await connection.query(selectIdQuery, [id]);

                if (idRows.length > 0) {
                    return res.status(400).json({
                        successful: false,
                        message: "ID already Exist",
                    });
                } else {
                    const selectEmailQuery = `SELECT email from user WHERE email = ?`;
                    const emailRows = await connection.query(selectEmailQuery, [
                        email,
                    ]);

                    if (emailRows.length > 0) {
                        return res.status(400).json({
                            successful: false,
                            message: "Email already Exist",
                        });
                    } else {
                        const selectEmailQuery = `SELECT email from admin WHERE email = ?`;
                        const emailRows = await connection.query(
                            selectEmailQuery,
                            [email]
                        );

                        if (emailRows.length > 0) {
                            return res.status(400).json({
                                successful: false,
                                message: "Email already Exist",
                            });
                        } else {
                            const selectEmailQuery = `SELECT email from company WHERE email = ?`;
                            const emailRows = await connection.query(
                                selectEmailQuery,
                                [email]
                            );

                            if (emailRows.length > 0) {
                                return res.status(400).json({
                                    successful: false,
                                    message: "Email already Exist",
                                });
                            } else {
                                const selectDisabilityIdQuery = `SELECT id, type from disability where type = ?`;
                                const disabilityRows = await connection.query(
                                    selectDisabilityIdQuery,
                                    [disability_id]
                                );

                                if (disabilityRows.length === 0) {
                                    return res.status(400).json({
                                        successful: false,
                                        message: "Disability ID Does not exist",
                                    });
                                } else {
                                    const insertQuery = `INSERT into user (id, first_name, middle_initial, last_name, address, city, gender, birth_date, email, password, contact_number, disability_id, formal_picture, picture_with_id, picture_of_pwd_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                                    const hashedPassword = await bcrypt.hash(
                                        password,
                                        10
                                    );
                                    const values = userModel(
                                        id,
                                        first_name,
                                        middle_inital,
                                        last_name,
                                        address,
                                        city,
                                        gender,
                                        birth_date,
                                        email,
                                        hashedPassword,
                                        contact_number,
                                        disability_id,
                                        formal_picture,
                                        picture_with_id,
                                        picture_of_pwd_id
                                    );
                                    const userObj = [
                                        values.id,
                                        values.first_name,
                                        values.middle_initial,
                                        values.last_name,
                                        values.address,
                                        values.city,
                                        values.gender,
                                        values.birth_date,
                                        values.email,
                                        values.password,
                                        values.contact_number,
                                        disabilityRows[0].id,
                                        values.formal_picture,
                                        values.picture_with_id,
                                        values.picture_of_pwd_id,
                                    ];

                                    await connection.query(
                                        insertQuery,
                                        userObj
                                    );

                                    const transporter =
                                        nodemailer.createTransport({
                                            service: "Gmail",
                                            auth: {
                                                user: "livcenteno24@gmail.com",
                                                pass: "glwg czmw tmdb rzvn",
                                            },
                                        });

                                    const mailOptions = {
                                        from: "livcenteno24@gmail.com",
                                        to: email,
                                        subject: "Account Verification",
                                        text: `
                                        Dear ${values.first_name},

                                        Thank you for registering. Your account is under review and will be activated once verified. We will notify you once the verification process is complete.

                                        Here are the details you provided:

                                        - ID: ${values.id}
                                        - Name: ${values.first_name} ${values.middle_initial} ${values.last_name}
                                        - Address: ${values.address}, ${values.city}
                                        - Gender: ${values.gender}
                                        - Date of Birth: ${values.birth_date}
                                        - Email: ${values.email}
                                        - Contact Number: ${values.contact_number}
                                        - Disability: ${disabilityRows[0].type}

                                        Best regards,
                                        PWDKA Team
                                    `
                                    };

                                    // Send the email
                                    await transporter.sendMail(mailOptions);

                                    return res.status(200).json({
                                        successful: true,
                                        message:
                                            "Successfully Registered User! Before having the capability to access our website, We will check if all the data you have inputed is legitimate. Please wait for our email verification if the User is accepted or rejected. Thank you!",
                                    });
                                }
                            }
                        }
                    }
                }
            } finally {
                connection.release();
            }
        } catch (err) {
            return res.status(500).json({
                successful: false,
                message: err.message,
            });
        }
    }
};
const loginUser = async (req, res, next) => {
    let email = req.body.email.toLowerCase();
    let password = req.body.password;

    if (!email || !password) {
        return res.status(404).json({
            successful: false,
            message: "Email or Password is missing",
        });
    } else {
        try {
            const connection = await database.pool.getConnection();

            try {
                const selectUserQuery = `SELECT email, password, status FROM user WHERE email = ?`;
                const userRows = await connection.query(selectUserQuery, [
                    email,
                ]);

                if (userRows.length === 0) {
                    return res.status(400).json({
                        successful: false,
                        message: "Invalid Credentials",
                    });
                }

                const storedPassword = userRows[0].password;
                const passwordMatch = await bcrypt.compare(
                    password,
                    storedPassword
                );

                if (!passwordMatch) {
                    return res.status(400).json({
                        successful: false,
                        message: "Invalid Credentials",
                    });
                } else if (userRows[0].status === "PENDING") {
                    return res.status(400).json({
                        successful: false,
                        message:
                            "The User's Account is under Verification. Please wait for the email confirmation.",
                    });
                } else if (userRows[0].status === "VERIFIED") {
                    return res.status(200).json({
                        successful: true,
                        id: userRows[0].id, // added role
                        role: userRows[0].role,
                        message: "Successfully Logged In.",

                    });
                } else {
                    return res.status(500).json({
                        successful: false,
                        message: err.message,
                    });
                }
            } finally {
                connection.release();
            }
        } catch (err) {
            return res.status(500).json({
                successful: false,
                message: err.message,
            });
        }
    }
};

const updateUser = async (req, res, next) => {
    let id = req.params.id;
    let address = req.body.address.toLowerCase();
    let city = req.body.city.toLowerCase();
    let contactNumber = req.body.contact_number;
    let formalPicture = req.body.formal_picture;

    if (
        id == null ||
        address == null ||
        city == null ||
        contactNumber == null ||
        formalPicture == null
    ) {
        return res.status(404).json({
            successful: false,
            message: "One or more details are missing",
        });
    } else if (util.checkSpecialChar(address)) {
        return res.status(400).json({
            successful: false,
            message: "Special Characters are not allowed in Address",
        });
    } else if (!util.checkCharacters(city) || !city.endsWith("city")) {
        return res.status(400).json({
            successful: false,
            message: "City Must only contain alphabetical characters",
        });
    } else if (!util.checkContactNumber(contactNumber)) {
        return res.status(400).json({
            successful: false,
            message: "Invalid Contact Number Format",
        });
    } else {
        try {
            const connection = await database.pool.getConnection();

            try {
                const updateQuery = `UPDATE user SET address = ?, city = ?, contact_number = ?, formal_picture = ? WHERE id = ?`;
                const values = [
                    address,
                    city,
                    contactNumber,
                    formalPicture,
                    id,
                ];

                const result = await connection.query(updateQuery, values);

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        successful: false,
                        message: "User not found",
                    });
                } else {
                    return res.status(200).json({
                        successful: true,
                        message: "User updated successfully",
                    });
                }
            } finally {
                connection.release();
            }
        } catch (err) {
            return res.status(500).json({
                successful: false,
                message: err.message,
            });
        }
    }
};

const userChangePassword = async (req, res, next) => {
    let id = req.params.id;
    let password = req.body.password;
    let newPassword = req.body.new_password;
    let confirmPassword = req.body.confirm_password;

    if (!id || !password || !newPassword || !confirmPassword) {
        return res.status(404).json({
            successful: false,
            message: "One or more details are missing",
        });
    } else if (!util.checkPassword(newPassword)) {
        return res.status(404).json({
            successful: false,
            message:
                "Invalid Password Format. It should have atleast one digit, one uppercase, one lowercase, one special character, and atleast 8 in length",
        });
    } else if (newPassword != confirmPassword) {
        return res.status(404).json({
            successful: false,
            message: "Password Does not match",
        });
    } else {
        try {
            const connection = await database.pool.getConnection();

            try {
                const selectIdQuery = `SELECT id, password from user where id = ?`;
                const userRows = await connection.query(selectIdQuery, [id]);

                if (userRows.length === 0) {
                    return res.status(400).json({
                        successful: false,
                        message: "Invalid User ID",
                    });
                } else {
                    const storedPassword = userRows[0].password;
                    const passwordMatch = await bcrypt.compare(
                        password,
                        storedPassword
                    );

                    if (!passwordMatch) {
                        return res.status(400).json({
                            successful: false,
                            message: "Invalid Credentials",
                        });
                    } else {
                        const passwordMatch = await bcrypt.compare(
                            newPassword,
                            storedPassword
                        );
                        if (passwordMatch) {
                            return res.status(400).json({
                                successful: false,
                                message: "Password must not be the same",
                            });
                        } else {
                            const updateQuery = `UPDATE user SET password = ? WHERE id = ?`;
                            const hashedPassword = await bcrypt.hash(
                                newPassword,
                                10
                            );
                            const values = [hashedPassword, id];

                            await connection.query(updateQuery, values);
                            return res.status(200).json({
                                successful: true,
                                message: "Password updated successfully",
                            });
                        }
                    }
                }
            } finally {
                connection.release();
            }
        } catch (err) {
            return res.status(500).json({
                successful: false,
                message: err.message,
            });
        }
    }
};

const viewUserViaId = async (req, res, next) => {
    let id = req.params.id;

    if (!id) {
        return res.status(404).json({
            successful: false,
            message: "ID Is Missing",
        });
    } else {
        try {
            const connection = await database.pool.getConnection();

            try {
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
                   where user.id = ?`;

                const rows = await connection.query(selectQuery, [id]);

                if (rows.length == 0) {
                    return res.status(404).json({
                        successful: false,
                        message: "ID is Invalid",
                    });
                } else {
                    return res.status(200).json({
                        successful: true,
                        message: "Successfully Retrieved Users",
                        data: rows,
                    });
                }
            } finally {
                connection.release();
            }
        } catch (err) {
            return res.status(500).json({
                successful: false,
                message: err.message,
            });
        }
    }
};

module.exports = {
    registerUser,
    loginUser,
    updateUser,
    userChangePassword,
    viewUserViaId,
};

