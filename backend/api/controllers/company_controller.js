const { json } = require("body-parser");
const knex = require("../models/connection_db");
const { companyModel } = require("../models/company_model");
const sharp = require("sharp");
const util = require("./util");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
require("dotenv").config();

const registerCompany = async (req, res, next) => {
  let name = req.body.name;
  let address = req.body.address.toLowerCase();
  let city = req.body.city.toLowerCase();
  let description = req.body.description;
  let contact_number = req.body.contact_number;
  let email = req.body.email.toLowerCase();
  let password = req.body.password;
  let confirm_password = req.body.confirm_password;
  let profile_picture = req.body.profile_picture;

  if (
    !name ||
    !address ||
    !city ||
    !description ||
    !contact_number ||
    !email ||
    !password ||
    !profile_picture
  ) {
    return res.status(400).json({
      successful: false,
      message: "One or more details are missing",
    });
  } else if (util.checkSpecialChar(address)) {
    return res.status(400).json({
      successful: false,
      message: "Special Characters are not allowed in Address",
    });
  } else if (util.checkNumbersAndSpecialChar(city) || !city.endsWith("city")) {
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
  } else if (password !== confirm_password) {
    return res.status(400).json({
      successful: false,
      message: "Passwords do not match",
    });
  } else {
    try {
      const existingCompany = await knex("company").where({ email }).first();
      const existingAdmin = await knex("admin").where({ email }).first();
      const existingUser = await knex("user").where({ email }).first();

      if (existingCompany || existingAdmin || existingUser) {
        return res.status(400).json({
          successful: false,
          message: "Email already exists",
        });
      } else {
        // Compress the profile picture
        const compressedProfilePicture = await sharp(
          Buffer.from(profile_picture, "base64")
        )
          .resize(300, 300, {
            fit: sharp.fit.inside,
            withoutEnlargement: true,
          })
          .png({ quality: 80 })
          .toBuffer();

        const hashedPassword = await bcrypt.hash(password, 10);

        await knex("company").insert({
          name,
          address,
          city,
          description,
          contact_number,
          email,
          password: hashedPassword,
          profile_picture: compressedProfilePicture.toString("base64"),
        });

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
          text: `Dear ${name},

Thank you for registering. Your Company's account is under review and will be activated once verified. We will notify you once the verification process is complete.

Here are the details you provided:

- Company Name: ${name}
- Address: ${address}, ${city}
- Description: ${description}
- Contact Number: ${contact_number}
- Email: ${email}

Best regards,
PWDKA TEAM`,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
          successful: true,
          message:
            "Successfully Registered Company! We will update you via email once the company is verified.",
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

const loginCompany = async (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({
      successful: false,
      message: "Email or Password is missing",
    });
  } else {
    try {
      const company = await knex("company").where({ email }).first();

      if (!company) {
        return res.status(400).json({
          successful: false,
          message: "Invalid Credentials",
        });
      } else {
        const passwordMatch = await bcrypt.compare(password, company.password);

        if (!passwordMatch) {
          return res.status(400).json({
            successful: false,
            message: "Invalid Credentials",
          });
        } else if (company.status === "PENDING") {
          return res.status(400).json({
            successful: false,
            message:
              "The Company's Account is under Verification. Please wait for the email confirmation.",
          });
        } else if (company.status === "VERIFIED") {
          return res.status(200).json({
            successful: true,
            id: company.id,
            role: company.role,
            message: "Successfully Logged In.",
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

const updateCompany = async (req, res, next) => {
  let id = req.params.id;
  let name = req.body.name;
  let address = req.body.address;
  let city = req.body.city;
  let description = req.body.description;
  let contact_number = req.body.contact_number;

  if (!id || !name || !address || !city || !description || !contact_number) {
    return res.status(400).json({
      successful: false,
      message: "One or more details are missing",
    });
  } else if (util.checkSpecialChar(address)) {
    return res.status(400).json({
      successful: false,
      message: "Special Characters are not allowed in Address",
    });
  } else if (util.checkNumbersAndSpecialChar(city) || !city.endsWith("city")) {
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
      const result = await knex("company").where({ id }).update({
        name,
        address,
        city,
        description,
        contact_number,
      });

      if (result === 0) {
        return res.status(404).json({
          successful: false,
          message: "Company not found",
        });
      } else {
        return res.status(200).json({
          successful: true,
          message: "Company Details updated successfully",
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

const updateCompanyProfilePicture = async (req, res, next) => {
  const id = req.params.id;
  const profile_picture = req.body.profile_picture;

  if (!id || !profile_picture) {
    return res.status(400).json({
      successful: false,
      message: "One or more details are missing",
    });
  } else {
    try {
      const compressedProfilePicture = await sharp(
        Buffer.from(profile_picture, "base64")
      )
        .resize(300, 300, {
          fit: sharp.fit.inside,
          withoutEnlargement: true,
        })
        .png({ quality: 80 })
        .toBuffer();

      profile_picture;
      const result = await knex("company")
        .where({ id })
        .update({
          profile_picture: compressedProfilePicture.toString("base64"),
        });

      if (result === 0) {
        return res.status(404).json({
          successful: false,
          message: "Company not found",
        });
      } else {
        return res.status(200).json({
          successful: true,
          message: "Company Profile Picture updated successfully",
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

const companyChangePassword = async (req, res, next) => {
  let id = req.params.id;
  let password = req.body.password;
  let new_password = req.body.new_password;
  let confirm_password = req.body.confirm_password;

  if (!id || !password || !new_password || !confirm_password) {
    return res.status(400).json({
      successful: false,
      message: "One or more details are missing",
    });
  } else if (!util.checkPassword(new_password)) {
    return res.status(400).json({
      successful: false,
      message:
        "Invalid Password Format. It should have at least one digit, one uppercase, one lowercase, one special character, and at least 8 in length",
    });
  } else if (new_password !== confirm_password) {
    return res.status(400).json({
      successful: false,
      message: "Password Does not match",
    });
  } else {
    try {
      const company = await knex("company").where({ id }).first();

      if (!company) {
        return res.status(400).json({
          successful: false,
          message: "Invalid company ID",
        });
      } else {
        const passwordMatch = await bcrypt.compare(password, company.password);

        if (!passwordMatch) {
          return res.status(400).json({
            successful: false,
            message: "Invalid Credentials",
          });
        } else {
          const newPasswordMatch = await bcrypt.compare(
            new_password,
            company.password
          );

          if (newPasswordMatch) {
            return res.status(400).json({
              successful: false,
              message: "New password must not be the same as the old password",
            });
          } else {
            const hashedNewPassword = await bcrypt.hash(new_password, 10);

            await knex("company")
              .where({ id })
              .update({ password: hashedNewPassword });

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

const viewCompanyViaId = async (req, res, next) => {
  let id = req.params.id;

  if (!id) {
    return res.status(400).json({
      successful: false,
      message: "ID is Missing",
    });
  }

  try {
    const company = await knex("company")
      .select(
        "id",
        "name",
        "description",
        "address",
        "city",
        "contact_number",
        "email",
        "profile_picture"
      )
      .where({ id })
      .first();

    if (!company) {
      return res.status(404).json({
        successful: false,
        message: "ID is Invalid",
      });
    } else {
      // Convert profile_picture BLOB to string
      const processedCompany = {
        ...company,
        profile_picture: company.profile_picture
          ? company.profile_picture.toString()
          : null,
      };

      return res.status(200).json({
        successful: true,
        message: "Successfully Retrieved Company",
        data: processedCompany,
      });
    }
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

const updateCompanyEmail = async (req, res, next) => {
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
      // Check if the company exists
      const company = await knex("company").where({ id }).first();
      if (!company) {
        return res.status(404).json({
          successful: false,
          message: "Company not found",
        });
      }

      // Verify the provided password
      const passwordMatch = await bcrypt.compare(password, company.password);
      if (!passwordMatch) {
        return res.status(400).json({
          successful: false,
          message: "Invalid Credentials",
        });
      }
      const companyWithEmail = await knex("company").where({ email }).first();

      if (adminWithEmail || userWithEmail || companyWithEmail) {
        return res.status(400).json({
          successful: false,
          message: "Email already exists in the system",
        });
      } else {
        const result = await knex("company").where({ id }).update({ email });

        return res.status(200).json({
          successful: true,
          message: "Company email updated successfully",
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

module.exports = {
  registerCompany,
  loginCompany,
  updateCompany,
  updateCompanyProfilePicture,
  companyChangePassword,
  viewCompanyViaId,
  updateCompanyEmail,
};
