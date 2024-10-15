const { json } = require("body-parser");
const knex = require("../models/connection_db");
const { companyModel } = require("../models/company_model");
const util = require("./util");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
require("dotenv").config();

const registerCompany = async (req, res, next) => {
  let {
    name,
    address,
    city,
    description,
    contact_number,
    email,
    password,
    confirm_password,
    profile_picture,
  } = req.body;

  address = address.toLowerCase();
  city = city.toLowerCase();
  email = email.toLowerCase();

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
  }

  if (util.checkSpecialChar(address)) {
    return res.status(400).json({
      successful: false,
      message: "Invalid Address Format",
    });
  }

  if (util.checkNumbersAndSpecialChar(city)) {
    return res.status(400).json({
      successful: false,
      message: "Invalid City Format",
    });
  }

  if (!util.checkContactNumber(contact_number)) {
    return res.status(400).json({
      successful: false,
      message: "Invalid Contact Number Format",
    });
  }

  if (!util.checkEmail(email)) {
    return res.status(400).json({
      successful: false,
      message: "Invalid Email",
    });
  }

  if (!util.checkPassword(password)) {
    return res.status(400).json({
      successful: false,
      message: "Invalid Password Format",
    });
  }

  if (password !== confirm_password) {
    return res.status(400).json({
      successful: false,
      message: "Passwords do not match",
    });
  }

  try {
    const existingCompany = await knex("company").where({ email }).first();
    const existingAdmin = await knex("admin").where({ email }).first();
    const existingUser = await knex("user").where({ email }).first();

    if (existingCompany || existingAdmin || existingUser) {
      return res.status(400).json({
        successful: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await knex("company").insert({
      name,
      address,
      city,
      description,
      contact_number,
      email,
      password: hashedPassword,
      profile_picture,
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
Your Team`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      successful: true,
      message:
        "Successfully Registered Company! We will update you via email once the company is verified.",
    });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

const loginCompany = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      successful: false,
      message: "Email or Password is missing",
    });
  }

  try {
    const company = await knex("company").where({ email }).first();

    if (!company) {
      return res.status(400).json({
        successful: false,
        message: "Invalid Credentials",
      });
    }

    const passwordMatch = await bcrypt.compare(password, company.password);

    if (!passwordMatch) {
      return res.status(400).json({
        successful: false,
        message: "Invalid Credentials",
      });
    }

    if (company.status === "PENDING") {
      return res.status(400).json({
        successful: false,
        message:
          "The Company's Account is under Verification. Please wait for the email confirmation.",
      });
    }

    if (company.status === "VERIFIED") {
      return res.status(200).json({
        successful: true,
        id: company.id,
        role: company.role,
        message: "Successfully Logged In.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

const updateCompany = async (req, res, next) => {
  const { id } = req.params;
  const { name, address, city, description, contact_number } = req.body;

  if (!id || !name || !address || !city || !description || !contact_number) {
    return res.status(400).json({
      successful: false,
      message: "One or more details are missing",
    });
  } else if (util.checkSpecialChar(address)) {
    return res.status(400).json({
      successful: false,
      message: "Invalid Address Format",
    });
  } else if (util.checkNumbersAndSpecialChar(city)) {
    return res.status(400).json({
      successful: false,
      message: "Invalid City Format",
    });
  } else if (!util.checkContactNumber(contact_number)) {
    return res.status(400).json({
      successful: false,
      message: "Invalid Contact Number Format",
    });
  }

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
    }

    return res.status(200).json({
      successful: true,
      message: "Company Details updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
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
      const result = await knex("company").where({ id }).update({
        profile_picture,
      });

      if (result === 0) {
        return res.status(404).json({
          successful: false,
          message: "Company not found",
        });
      }

      return res.status(200).json({
        successful: true,
        message: "Company Profile Picture updated successfully",
      });
    } catch (err) {
      return res.status(500).json({
        successful: false,
        message: err.message,
      });
    }
  }
};

const companyChangePassword = async (req, res, next) => {
  const { id } = req.params;
  const { password, new_password, confirm_password } = req.body;

  if (!id || !password || !new_password || !confirm_password) {
    return res.status(400).json({
      successful: false,
      message: "One or more details are missing",
    });
  }

  if (!util.checkPassword(new_password)) {
    return res.status(400).json({
      successful: false,
      message: "Invalid Password Format",
    });
  }

  if (new_password !== confirm_password) {
    return res.status(400).json({
      successful: false,
      message: "Password Does not match",
    });
  }

  try {
    const company = await knex("company").where({ id }).first();

    if (!company) {
      return res.status(400).json({
        successful: false,
        message: "Invalid company ID",
      });
    }

    const passwordMatch = await bcrypt.compare(password, company.password);

    if (!passwordMatch) {
      return res.status(400).json({
        successful: false,
        message: "Invalid Credentials",
      });
    }

    const newPasswordMatch = await bcrypt.compare(
      new_password,
      company.password
    );

    if (newPasswordMatch) {
      return res.status(400).json({
        successful: false,
        message: "New password must not be the same as the old password",
      });
    }

    const hashedNewPassword = await bcrypt.hash(new_password, 10);

    await knex("company").where({ id }).update({ password: hashedNewPassword });

    return res.status(200).json({
      successful: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

const viewCompanyViaId = async (req, res, next) => {
  const { id } = req.params;

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
    }

    // Convert profile_picture BLOB to Base64 string
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
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

module.exports = {
  registerCompany,
  loginCompany,
  updateCompany,
  updateCompanyProfilePicture,
  companyChangePassword,
  viewCompanyViaId,
};
