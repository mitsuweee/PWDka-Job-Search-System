const { json } = require("body-parser");
const knex = require("../models/connection_db");
const { userModel } = require("../models/user_model");
const util = require("./util");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const sharp = require("sharp");
require("dotenv").config();

const registerUser = async (req, res, next) => {
  let id = req.body.id;
  let first_name = req.body.first_name.toLowerCase();
  let middle_initial = req.body.middle_initial.toLowerCase();
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
    !last_name ||
    !address ||
    !city ||
    !gender ||
    !birth_date ||
    !email ||
    !password ||
    !confirmPassword ||
    !contact_number ||
    !disability_id ||
    !formal_picture ||
    !picture_with_id ||
    !picture_of_pwd_id
  ) {
    return res.status(400).json({
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
  } else if (!util.checkMiddleInitial(middle_initial)) {
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
      message:
        "City Must only contain alphabetical characters and it should end with the word 'city'",
    });
  } else if (!util.checkCharacters(gender)) {
    return res.status(400).json({
      successful: false,
      message: "Gender Must only contain alphabetical characters",
    });
  } else if (util.calculateAge(birth_date) < 15) {
    return res.status(400).json({
      successful: false,
      message: "User must be 15 years old or higher",
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
        "Invalid Password Format. It should have at least one digit, one uppercase, one lowercase, one special character, and be at least 8 characters in length",
    });
  } else if (password !== confirmPassword) {
    return res.status(400).json({
      successful: false,
      message: "Passwords do not match",
    });
  } else if (!util.checkContactNumber(contact_number)) {
    return res.status(400).json({
      successful: false,
      message: "Invalid Contact Number Format. Ex(09123456789)",
    });
  } else {
    try {
      const existingContactUser = await knex("user")
        .where({ contact_number })
        .first();
      const existingContactCompany = await knex("company")
        .where({ contact_number })
        .first();
      const existingId = await knex("user").where({ id }).first();
      const existingEmail = await knex("user").where({ email }).first();
      const emailInAdmin = await knex("admin").where({ email }).first();
      const emailInCompany = await knex("company").where({ email }).first();
      if (existingId) {
        return res.status(400).json({
          successful: false,
          message: "ID already exists",
        });
      } else if (existingEmail || emailInAdmin || emailInCompany) {
        return res.status(400).json({
          successful: false,
          message: "Email already exists",
        });
      } else if (existingContactUser || existingContactCompany) {
        return res.status(400).json({
          successful: false,
          message: "Contact Number already exists",
        });
      } else {
        const disability = await knex("disability")
          .where({ type: disability_id })
          .first();
        if (!disability) {
          return res.status(400).json({
            successful: false,
            message: "Disability ID does not exist",
          });
        } else {
          const compressedFormalPicture = await sharp(
            Buffer.from(formal_picture, "base64")
          )
            .resize(300, 300, {
              fit: sharp.fit.inside,
              withoutEnlargement: true,
            })
            .png({ quality: 80 })
            .toBuffer();

          const compressedPictureWithId = await sharp(
            Buffer.from(picture_with_id, "base64")
          )
            .resize(300, 300, {
              fit: sharp.fit.inside,
              withoutEnlargement: true,
            })
            .png({ quality: 80 })
            .toBuffer();

          const compressedPictureOfPwdId = await sharp(
            Buffer.from(picture_of_pwd_id, "base64")
          )
            .resize(300, 300, {
              fit: sharp.fit.inside,
              withoutEnlargement: true,
            })
            .png({ quality: 80 })
            .toBuffer();

          const hashedPassword = await bcrypt.hash(password, 10);
          await knex("user").insert({
            id,
            first_name,
            middle_initial,
            last_name,
            address,
            city,
            gender,
            birth_date,
            email,
            password: hashedPassword,
            contact_number,
            disability_id: disability.id,
            formal_picture: compressedFormalPicture.toString("base64"),
            picture_with_id: compressedPictureWithId.toString("base64"),
            picture_of_pwd_id: compressedPictureOfPwdId.toString("base64"),
          });

          // Send verification email
          const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD,
            },
          });

          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Account Verification",
            text: `
                    Dear ${first_name},

                    Thank you for registering. Your account is under review and will be activated once verified. We will notify you once the verification process is complete.

                    Here are the details you provided:

                    - ID: ${id}
                    - Name: ${first_name} ${middle_initial} ${last_name}
                    - Address: ${address}, ${city}
                    - Gender: ${gender}
                    - Date of Birth: ${birth_date}
                    - Email: ${email}
                    - Contact Number: ${contact_number}
                    - Disability: ${disability.type}

                    Best regards,
                    PWDKA Team
                `,
          };

          await transporter.sendMail(mailOptions);

          return res.status(200).json({
            successful: true,
            message:
              "Successfully Registered User! We will update you via email once the user's account is verified. Thank you!",
          });
        }
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
    return res.status(400).json({
      successful: false,
      message: "Email or Password is missing",
    });
  } else {
    try {
      const user = await knex("user").where({ email }).first();
      if (!user) {
        return res.status(400).json({
          successful: false,
          message: "Invalid Credentials",
        });
      } else {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return res.status(400).json({
            successful: false,
            message: "Invalid Credentials",
          });
        } else if (user.status === "PENDING") {
          return res.status(400).json({
            successful: false,
            message:
              "The User's Account is under Verification. Please wait for the email confirmation.",
          });
        } else if (user.status === "VERIFIED") {
          return res.status(200).json({
            successful: true,
            id: user.id,
            role: user.role,
            message: "Successfully Logged In.",
          });
        } else {
          return res.status(500).json({
            successful: false,
            message: "Unexpected status",
          });
        }
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
  const id = req.params.id;
  const address = req.body.address.toLowerCase();
  const city = req.body.city.toLowerCase();
  const contact_number = req.body.contact_number;

  if (!id || !address || !city || !contact_number) {
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
      message:
        "City Must only contain alphabetical characters and it should end with the word 'city'",
    });
  } else if (!util.checkContactNumber(contact_number)) {
    return res.status(400).json({
      successful: false,
      message: "Invalid Contact Number Format. Ex(09123456789)",
    });
  } else {
    try {
      const existingContactUser = await knex("user")
        .where({ contact_number })
        .andWhere("id", "!=", id)
        .first();
      const existingContactCompany = await knex("company")
        .where({ contact_number })
        .first();

      if (existingContactUser || existingContactCompany) {
        return res.status(400).json({
          successful: false,
          message: "Contact Number already exists",
        });
      } else {
        const result = await knex("user").where({ id }).update({
          address,
          city,
          contact_number,
        });

        if (result === 0) {
          return res.status(404).json({
            successful: false,
            message: "User not found",
          });
        } else {
          return res.status(200).json({
            successful: true,
            message: "User Details updated successfully",
          });
        }
      }
    } catch (err) {
      return res.status(500).json({
        successful: false,
        message: err.message,
      });
    }
  }
};

const updateUserProfilePicture = async (req, res, next) => {
  const id = req.params.id;
  const formalPicture = req.body.formal_picture;

  if (!id || !formalPicture) {
    return res.status(404).json({
      successful: false,
      message: "One Or More Details missing",
    });
  } else {
    try {
      // Compress the profile picture
      const compressedformalPicture = await sharp(
        Buffer.from(formalPicture, "base64")
      )
        .resize(300, 300, {
          fit: sharp.fit.inside,
          withoutEnlargement: true,
        })
        .png({ quality: 80 })
        .toBuffer();

      const result = await knex("user")
        .where({ id })
        .update({
          formal_picture: compressedformalPicture.toString("base64"),
        });

      if (result === 0) {
        return res.status(404).json({
          successful: false,
          message: "User not found",
        });
      } else {
        return res.status(200).json({
          successful: true,
          message: "User Details updated successfully",
        });
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
  const id = req.params.id;
  const password = req.body.password;
  const newPassword = req.body.new_password;
  const confirmPassword = req.body.confirm_password;

  if (!id || !password || !newPassword || !confirmPassword) {
    return res.status(404).json({
      successful: false,
      message: "One or more details are missing",
    });
  } else if (!util.checkPassword(newPassword)) {
    return res.status(400).json({
      successful: false,
      message:
        "Invalid Password Format. It should have at least one digit, one uppercase, one lowercase, one special character, and at least 8 in length",
    });
  } else if (newPassword !== confirmPassword) {
    return res.status(400).json({
      successful: false,
      message: "Password does not match",
    });
  } else {
    try {
      const user = await knex("user").where({ id }).first(["id", "password"]);

      if (!user) {
        return res.status(400).json({
          successful: false,
          message: "Invalid User ID",
        });
      } else {
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return res.status(400).json({
            successful: false,
            message: "Invalid Credentials",
          });
        } else {
          const newPasswordMatch = await bcrypt.compare(
            newPassword,
            user.password
          );
          if (newPasswordMatch) {
            return res.status(400).json({
              successful: false,
              message: "Password must not be the same as the current one",
            });
          } else {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await knex("user")
              .where({ id })
              .update({ password: hashedPassword });

            return res.status(200).json({
              successful: true,
              message: "Password updated successfully",
            });
          }
        }
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
  const id = req.params.id;

  if (!id) {
    return res.status(404).json({
      successful: false,
      message: "ID is missing",
    });
  } else {
    try {
      const rows = await knex("user")
        .join("disability", "user.disability_id", "disability.id")
        .where("user.id", id)
        .select(
          "user.id",
          "disability.type",
          "user.first_name",
          "user.middle_initial",
          "user.last_name",
          "user.email",
          "user.address",
          "user.city",
          "user.gender",
          "user.birth_date",
          "user.contact_number",
          "user.formal_picture",
          "user.picture_with_id",
          "user.picture_of_pwd_id"
        );

      if (rows.length === 0) {
        return res.status(404).json({
          successful: false,
          message: "ID is Invalid",
        });
      } else {
        // Convert BLOBs to String
        const user = {
          ...rows[0],
          formal_picture: rows[0].formal_picture
            ? rows[0].formal_picture.toString()
            : null,
          picture_with_id: rows[0].picture_with_id
            ? rows[0].picture_with_id.toString()
            : null,
          picture_of_pwd_id: rows[0].picture_of_pwd_id
            ? rows[0].picture_of_pwd_id.toString()
            : null,
        };

        return res.status(200).json({
          successful: true,
          message: "Successfully Retrieved User",
          data: user,
        });
      }
    } catch (err) {
      return res.status(500).json({
        successful: false,
        message: err.message,
      });
    }
  }
};

const updateUserEmail = async (req, res, next) => {
  const id = req.params.id;
  const email = req.body.email.toLowerCase();
  const password = req.body.password;

  if (!id || !email || !password) {
    return res.status(400).json({
      successful: false,
      message: "ID, Email, or Password is missing",
    });
  } else if (!util.checkEmail(email)) {
    return res.status(400).json({
      successful: false,
      message: "Invalid Email Format",
    });
  } else {
    try {
      // Check if the user exists
      const user = await knex("user")
        .select("id", "email", "password")
        .where({ id })
        .first();
      if (!user) {
        return res.status(404).json({
          successful: false,
          message: "User not found",
        });
      }

      // Verify the provided password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({
          successful: false,
          message: "Invalid Credentials",
        });
      }
      const adminWithEmail = await knex("admin").where({ email }).first();
      const userWithEmail = await knex("user").where({ email }).first();
      const companyWithEmail = await knex("company").where({ email }).first();
      if (adminWithEmail || userWithEmail || companyWithEmail) {
        return res.status(400).json({
          successful: false,
          message: "Email already exists in the system",
        });
      } else {
        const result = await knex("user").where({ id }).update({ email });

        return res.status(200).json({
          successful: true,
          message: "User email updated successfully",
        });
      }
    } catch (err) {
      return res.status(500).json({
        successful: false,
        message: err.message,
      });
    }
  }
};

const deactivateUser = async (req, res, next) => {
  const id = req.params.id;
  const password = req.body.password;
  const confirmPassword = req.body.confirm_password;

  if (!id || !password || !confirmPassword) {
    return res.status(404).json({
      successful: false,
      message: "One or more details missing",
    });
  } else if (password !== confirmPassword) {
    return res.status(400).json({
      successful: false,
      message: "Password does not match",
    });
  } else {
    try {
      const user = await knex("user")
        .select("id", "password")
        .where({ id })
        .first();

      if (!user) {
        return res.status(404).json({
          successful: false,
          message: "User not found",
        });
      } else {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return res.status(400).json({
            successful: false,
            message: "Invalid Credentials",
          });
        } else {
          await knex("user").where({ id }).update({ status: "DEACTIVATE" });

          return res.status(200).json({
            successful: true,
            message: "Successfully Deactivated User!",
          });
        }
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
  updateUserProfilePicture,
  userChangePassword,
  viewUserViaId,
  updateUserEmail,
  deactivateUser,
};
