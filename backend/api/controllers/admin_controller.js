const { json } = require("body-parser");
const knex = require("../models/connection_db");
const { adminModel } = require("../models/admin_model");
const util = require("./util");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// Generate a 256-bit (32-byte) secret key, encoded in hexadecimal
const SECRET_KEY = crypto.randomBytes(32).toString("hex");

const registerAdmin = async (req, res, next) => {
  let firstName = req.body.firstName.toLowerCase();
  let lastName = req.body.lastName.toLowerCase();
  let email = req.body.email.toLowerCase();
  let password = req.body.password;
  let confirmPassword = req.body.confirm_password;

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return res.status(400).json({
      successful: false,
      message: "One or more details are missing",
    });
  } else if (
    util.checkNumbersAndSpecialChar(firstName) ||
    util.checkNumbersAndSpecialChar(lastName)
  ) {
    return res.status(400).json({
      successful: false,
      message: "Invalid Name format",
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
  } else {
    try {
      // Check if email exists in any table
      const adminExists = await knex("admin").where({ email }).first();
      const userExists = await knex("user").where({ email }).first();
      const companyExists = await knex("company").where({ email }).first();

      if (adminExists || userExists || companyExists) {
        return res.status(400).json({
          successful: false,
          message: "Email already exists",
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      const newAdmin = {
        first_name: firstName,
        last_name: lastName,
        email,
        password: hashedPassword,
      };

      await knex("admin").insert(newAdmin);

      return res.status(200).json({
        successful: true,
        message: "Successfully Registered Admin",
      });
    } catch (err) {
      return res.status(500).json({
        successful: false,
        message: err.message,
      });
    }
  }
};

const loginAdmin = async (req, res, next) => {
  const email = req.body.email.toLowerCase();
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({
      successful: false,
      message: "Email or Password is missing",
    });
  }

  try {
    const admin = await knex("admin")
      .select("id", "email", "password", "role")
      .where({ email })
      .first();

    if (!admin) {
      return res.status(400).json({
        successful: false,
        message: "Invalid Credentials",
      });
    }

    const { id, password: storedPassword, role } = admin;

    // Verify the password
    const passwordMatch = await bcrypt.compare(password, storedPassword);

    if (!passwordMatch) {
      return res.status(400).json({
        successful: false,
        message: "Invalid Credentials",
      });
    }

    // Create a JWT token
    const token = jwt.sign({ id, role }, SECRET_KEY, { expiresIn: "1h" });

    return res.status(200).json({
      successful: true,
      role: role,
      id: id,
      token: token,
      message: `Successfully Logged In as Admin.`,
    });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

const viewCounts = async (req, res, next) => {
  try {
    const verifiedUsersCount = await knex("user")
      .where({ status: "VERIFIED" })
      .count("id as count")
      .first();

    const verifiedCompaniesCount = await knex("company")
      .where({ status: "VERIFIED" })
      .count("id as count")
      .first();

    const pendingUsersCount = await knex("user")
      .where({ status: "PENDING" })
      .count("id as count")
      .first();

    const pendingCompaniesCount = await knex("company")
      .where({ status: "PENDING" })
      .count("id as count")
      .first();

    const totalJobListingsCount = await knex("job_listing")
      .count("id as count")
      .first();

    const totalJobApplicationCount = await knex("job_application")
      .count("id as count")
      .first();

    return res.status(200).json({
      successful: true,
      message: "Successfully Retrieved Counts",
      data: {
        verified_users: verifiedUsersCount.count,
        pending_users: pendingUsersCount.count,
        verified_companies: verifiedCompaniesCount.count,
        pending_companies: pendingCompaniesCount.count,
        total_job_listings: totalJobListingsCount.count,
        total_job_application: totalJobApplicationCount.count,
      },
    });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

const viewAdmins = async (req, res, next) => {
  try {
    const rows = await knex("admin")
      .select("id", "first_name", "last_name", "email", "date_created")
      .where({ status: "ACTIVE" }); // Filter to only include ACTIVE admins

    return res.status(200).json({
      successful: true,
      message: "Successfully Retrieved Active Admins",
      data: rows,
    });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

const viewUsers = async (req, res, next) => {
  try {
    const users = await knex("user")
      .join("disability", "user.disability_id", "=", "disability.id")
      .select(
        "user.id",
        "disability.type AS type",
        "user.first_name",
        "user.middle_initial",
        "user.last_name",
        "user.date_created",
        "email",
        "address",
        "city",
        "gender",
        "birth_date",
        "contact_number",
        "formal_picture",
        "picture_with_id",
        "picture_of_pwd_id"
      )
      .where("status", "VERIFIED");

    const formattedUsers = users.map((user) => ({
      ...user,
      formal_picture: user.formal_picture
        ? user.formal_picture.toString()
        : null,
      picture_with_id: user.picture_with_id
        ? user.picture_with_id.toString()
        : null,
      picture_of_pwd_id: user.picture_of_pwd_id
        ? user.picture_of_pwd_id.toString()
        : null,
    }));

    return res.status(200).json({
      successful: true,
      message: "Successfully Retrieved Users",
      data: formattedUsers,
    });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

const viewCompanies = async (req, res, next) => {
  try {
    const companies = await knex("company")
      .select(
        "id",
        "name",
        "description",
        "date_created",
        "address",
        "city",
        "contact_number",
        "email",
        "profile_picture",
        "date_created"
      )
      .where("status", "VERIFIED");

    // Convert BLOB data to String
    const processedCompanies = companies.map((company) => ({
      ...company,
      profile_picture: company.profile_picture
        ? company.profile_picture.toString()
        : null,
    }));

    return res.status(200).json({
      successful: true,
      message: "Successfully Retrieved Companies",
      data: processedCompanies,
    });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

const viewAllJobListingNewestToOldest = async (req, res, next) => {
  const { order } = req.query; // New code: get order parameter from frontend
  const sortOrder = order === "Oldest" ? "asc" : "desc"; // New code: determine sort order
  try {
    const rows = await knex("job_listing")
      .join(
        "position_type",
        "job_listing.positiontype_id",
        "=",
        "position_type.id"
      )
      .join("company", "job_listing.company_id", "=", "company.id")
      .join(
        "disability_job_listing",
        "job_listing.id",
        "=",
        "disability_job_listing.joblisting_id"
      )
      .join(
        "disability",
        "disability_job_listing.disability_id",
        "=",
        "disability.id"
      )
      .select(
        "job_listing.id",
        "job_listing.position_name",
        "job_listing.level",
        "job_listing.description",
        "job_listing.date_created",
        "job_listing.qualification",
        "job_listing.requirement",
        "job_listing.minimum_salary",
        "job_listing.maximum_salary",
        "job_listing.salary_visibility",
        "position_type.type AS position_type",
        "company.name AS company_name",
        "company.profile_picture AS company_profile_picture",
        knex.raw(
          "GROUP_CONCAT(disability.type SEPARATOR ', ') AS disability_types"
        )
      )
      .where("company.status", "VERIFIED")
      .groupBy(
        "job_listing.id",
        "job_listing.position_name",
        "job_listing.level",
        "job_listing.description",
        "job_listing.date_created",
        "job_listing.qualification",
        "job_listing.requirement",
        "job_listing.minimum_salary",
        "job_listing.maximum_salary",
        "job_listing.salary_visibility",
        "position_type.type",
        "company.profile_picture",
        "company.name"
      )
      .orderBy("job_listing.date_created", sortOrder); // New code: apply dynamic sort order

    if (rows.length === 0) {
      return res.status(404).json({
        successful: false,
        message: "Job Listing not found",
      });
    } else {
      // Convert BLOB data to String
      const processedRows = rows.map((row) => ({
        ...row,
        profile_picture: row.profile_picture
          ? row.profile_picture.toString()
          : null,
      }));

      return res.status(200).json({
        successful: true,
        message: "Successfully Retrieved All Job Listings",
        data: processedRows,
      });
    }
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

const viewJobListing = async (req, res, next) => {
  let id = req.params.id;

  if (!id) {
    return res.status(404).json({
      successful: false,
      message: "ID is missing",
    });
  } else {
    try {
      const rows = await knex("job_listing")
        .join(
          "position_type",
          "job_listing.positiontype_id",
          "=",
          "position_type.id"
        )
        .join("company", "job_listing.company_id", "=", "company.id")
        .join(
          "disability_job_listing",
          "job_listing.id",
          "=",
          "disability_job_listing.joblisting_id"
        )
        .join(
          "disability",
          "disability_job_listing.disability_id",
          "=",
          "disability.id"
        )
        .select(
          "job_listing.id",
          "job_listing.position_name",
          "job_listing.level",
          "job_listing.description",
          "job_listing.date_created",
          "job_listing.qualification",
          "job_listing.requirement",
          "job_listing.minimum_salary",
          "job_listing.maximum_salary",
          "job_listing.salary_visibility",
          "position_type.type AS position_type",
          "company.profile_picture AS company_profile_picture",
          "company.name AS company_name",
          knex.raw(
            "GROUP_CONCAT(disability.type SEPARATOR ', ') AS disability_types"
          )
        )
        .where("job_listing.id", id)
        .groupBy(
          "job_listing.id",
          "job_listing.position_name",
          "job_listing.description",
          "job_listing.date_created",
          "job_listing.qualification",
          "job_listing.requirement",
          "job_listing.minimum_salary",
          "job_listing.maximum_salary",
          "job_listing.salary_visibility",
          "position_type.type",
          "company.name",
          "company.profile_picture"
        );

      if (rows.length === 0) {
        return res.status(404).json({
          successful: false,
          message: "Job Listing not found",
        });
      } else {
        // Convert BLOB data to String
        const processedRows = rows.map((row) => ({
          ...row,
          company_profile_picture: row.company_profile_picture
            ? row.company_profile_picture.toString()
            : null,
        }));

        return res.status(200).json({
          successful: true,
          message: "Successfully Retrieved Job Listing",
          data: processedRows,
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

const adminChangePassword = async (req, res, next) => {
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
    return res.status(400).json({
      successful: false,
      message:
        "Invalid Password Format. It should have at least one digit, one uppercase, one lowercase, one special character, and be at least 8 characters in length",
    });
  } else if (newPassword !== confirmPassword) {
    return res.status(400).json({
      successful: false,
      message: "Password Does not match",
    });
  } else {
    try {
      const adminRow = await knex("admin")
        .select("id", "password")
        .where("id", id)
        .first();

      if (!adminRow) {
        return res.status(400).json({
          successful: false,
          message: "Invalid admin ID",
        });
      } else {
        const storedPassword = adminRow.password;
        const passwordMatch = await bcrypt.compare(password, storedPassword);

        if (!passwordMatch) {
          return res.status(400).json({
            successful: false,
            message: "Invalid Credentials",
          });
        } else {
          const newPasswordMatch = await bcrypt.compare(
            newPassword,
            storedPassword
          );
          if (newPasswordMatch) {
            return res.status(400).json({
              successful: false,
              message: "Password must not be the same",
            });
          } else {
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await knex("admin")
              .where("id", id)
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

const updateAdmin = async (req, res, next) => {
  const id = req.params.id;
  const firstName = req.body.first_name.toLowerCase();
  const lastName = req.body.last_name.toLowerCase();

  if (!id || !firstName || !lastName) {
    return res.status(404).json({
      successful: false,
      message: "One or more details are missing",
    });
  } else if (
    util.checkNumbersAndSpecialChar(firstName) ||
    util.checkNumbersAndSpecialChar(lastName)
  ) {
    return res.status(400).json({
      successful: false,
      message: "Special characters or numbers are not allowed in name fields",
    });
  } else {
    try {
      const result = await knex("admin").where({ id }).update({
        first_name: firstName,
        last_name: lastName,
      });

      if (result === 0) {
        return res.status(404).json({
          successful: false,
          message: "Admin not found",
        });
      } else {
        return res.status(200).json({
          successful: true,
          message: "Admin details updated successfully",
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

const deleteAdmin = async (req, res, next) => {
  let id = req.params.id;

  if (!id) {
    return res.status(404).json({
      successful: false,
      message: "ID is missing",
    });
  } else {
    try {
      const adminRow = await knex("admin").where("id", id).first();

      if (!adminRow) {
        return res.status(400).json({
          successful: false,
          message: "Invalid admin ID",
        });
      } else {
        await knex("admin").where("id", id).del();

        return res.status(200).json({
          successful: true,
          message: "Successfully Deleted Admin",
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

const deleteUser = async (req, res, next) => {
  let id = req.params.id;

  if (!id) {
    return res.status(404).json({
      successful: false,
      message: "ID is missing",
    });
  } else {
    try {
      const userRow = await knex("user").where("id", id).first();

      if (!userRow) {
        return res.status(400).json({
          successful: false,
          message: "Invalid user ID",
        });
      } else {
        await knex("user").where("id", id).del();

        return res.status(200).json({
          successful: true,
          message: "Successfully Deleted User",
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

const deleteCompany = async (req, res, next) => {
  let id = req.params.id;

  if (!id) {
    return res.status(404).json({
      successful: false,
      message: "ID is missing",
    });
  } else {
    try {
      const companyRow = await knex("company").where("id", id).first();

      if (!companyRow) {
        return res.status(400).json({
          successful: false,
          message: "Invalid company ID",
        });
      } else {
        await knex("company").where("id", id).del();

        return res.status(200).json({
          successful: true,
          message: "Successfully Deleted Company",
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
const deleteJob = async (req, res, next) => {
  const id = req.params.id;

  if (!id) {
    return res.status(404).json({
      successful: false,
      message: "Id is missing",
    });
  }

  try {
    const job = await knex("job_listing").where({ id }).first();

    if (!job) {
      return res.status(404).json({
        successful: false,
        message: "Job listing not found",
      });
    }

    await knex("job_listing").where({ id }).del();

    return res.status(200).json({
      successful: true,
      message: "Successfully deleted job listing",
    });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

const searchUser = async (req, res, next) => {
  const firstName = req.params.first_name;

  if (!firstName) {
    return res.status(400).json({
      successful: false,
      message: "Name is missing",
    });
  } else {
    try {
      const users = await knex("user")
        .select(
          "user.id",
          "disability.type",
          knex.raw(
            "CONCAT(user.first_name, ' ', user.middle_initial, '. ', user.last_name) AS full_name"
          ),
          "email",
          knex.raw("CONCAT(address, ' ', city) AS Location"),
          "gender",
          "birth_date",
          "contact_number",
          "formal_picture"
        )
        .join("disability", "user.disability_id", "disability.id")
        .where({
          status: "VERIFIED",
          "user.first_name": firstName,
        });

      if (users.length === 0) {
        return res.status(404).json({
          successful: false,
          message: "No users found",
        });
      }

      return res.status(200).json({
        successful: true,
        message: "Successfully retrieved users",
        data: users,
      });
    } catch (err) {
      return res.status(500).json({
        successful: false,
        message: err.message,
      });
    }
  }
};

const viewAdminViaId = async (req, res, next) => {
  const id = req.params.id;

  if (!id) {
    return res.status(404).json({
      successful: false,
      message: "ID is missing",
    });
  } else {
    try {
      const admin = await knex("admin").where({ id }).first();

      if (!admin) {
        return res.status(404).json({
          successful: false,
          message: "ID is invalid",
        });
      }

      return res.status(200).json({
        successful: true,
        message: "Successfully retrieved admin",
        data: admin,
      });
    } catch (err) {
      return res.status(500).json({
        successful: false,
        message: err.message,
      });
    }
  }
};

const updateJobListing = async (req, res, next) => {
  let id = req.params.id;
  let position_name = req.body.position_name;
  let description = req.body.description;
  let qualification = req.body.qualification;
  let minimum_salary = req.body.minimum_salary;
  let maximum_salary = req.body.maximum_salary;
  let positiontype_id = req.body.positiontype_id;

  if (
    !id ||
    !position_name ||
    !description ||
    !qualification ||
    !positiontype_id
  ) {
    return res.status(400).json({
      successful: false,
      message: "One or more details are missing",
    });
  } else if (util.checkSpecialChar(position_name)) {
    return res.status(400).json({
      successful: false,
      message: "Position name must not contain special characters",
    });
  } else if (!util.checkNumbers(minimum_salary) || minimum_salary < 0) {
    return res.status(400).json({
      successful: false,
      message:
        "Minimum Salary must only contain numbers that are greater than or equal to 0",
    });
  } else if (
    !util.checkNumbers(maximum_salary) ||
    maximum_salary <= minimum_salary
  ) {
    return res.status(400).json({
      successful: false,
      message:
        "Maximum Salary must only contain numbers that are greater than minimum Salary",
    });
  } else {
    try {
      const positionType = await knex("position_type")
        .where({ id: positiontype_id })
        .first();

      if (!positionType) {
        return res.status(400).json({
          successful: false,
          message: "Position Type Id is invalid",
        });
      }

      const result = await knex("job_listing").where({ id }).update({
        position_name,
        description,
        qualification,
        minimum_salary,
        maximum_salary,
      });

      if (result === 0) {
        return res.status(404).json({
          successful: false,
          message: "Job Listing not found",
        });
      }

      return res.status(200).json({
        successful: true,
        message: "Job Listing updated successfully",
      });
    } catch (err) {
      return res.status(500).json({
        successful: false,
        message: err.message,
      });
    }
  }
};

const sendEmailConcern = async (req, res) => {
  const email = req.body.email;
  const subject = req.body.subject;
  const body = req.body.body;

  if (!email || !body || !subject) {
    return res.status(400).json({
      successful: false,
      message: "Email , Subject and Body are required",
    });
  } else if (!util.checkEmail(email)) {
    return res.status(400).json({
      successful: false,
      message: "Invalid Email",
    });
  } else {
    try {
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `${subject}" -"Concern From ${email}`,
        text: body,
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({
        successful: true,
        message: "Email sent successfully!",
      });
    } catch (error) {
      return res.status(500).json({
        successful: false,
        message: "Failed to send email",
        error: error.message,
      });
    }
  }
};

const updateAdminEmail = async (req, res, next) => {
  const id = req.params.id;
  const email = req.body.email.toLowerCase();

  if (!id || !email) {
    return res.status(400).json({
      successful: false,
      message: "ID or Email is missing",
    });
  } else if (!util.checkEmail(email)) {
    return res.status(400).json({
      successful: false,
      message: "Invalid Email Format",
    });
  } else {
    try {
      // Check if email exists in other tables
      const adminWithEmail = await knex("admin").where({ email }).first();
      const userWithEmail = await knex("user").where({ email }).first();
      const companyWithEmail = await knex("company").where({ email }).first();

      if (adminWithEmail || userWithEmail || companyWithEmail) {
        return res.status(400).json({
          successful: false,
          message: "Email already exists in the system",
        });
      }

      const result = await knex("admin").where({ id }).update({ email });

      if (result === 0) {
        return res.status(404).json({
          successful: false,
          message: "Admin not found",
        });
      }

      return res.status(200).json({
        successful: true,
        message: "Admin email updated successfully",
      });
    } catch (err) {
      return res.status(500).json({
        successful: false,
        message: err.message,
      });
    }
  }
};

const deactivateAdmin = async (req, res, next) => {
  const id = req.params.id;

  if (!id) {
    return res.status(404).json({
      successful: false,
      message: "ID is missing",
    });
  }

  try {
    const user = await knex("admin").where({ id }).first();

    if (!user) {
      return res.status(404).json({
        successful: false,
        message: "Admin not found",
      });
    }

    await knex("admin").where({ id }).update({ status: "DEACTIVATE" });

    return res.status(200).json({
      successful: true,
      message: "Successfully Deactivated Admin!",
    });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  viewCounts,
  viewAdmins,
  viewUsers,
  viewCompanies,
  viewAllJobListingNewestToOldest,
  viewJobListing,
  adminChangePassword,
  updateAdmin,
  deleteAdmin,
  deleteUser,
  deleteCompany,
  deleteJob,
  searchUser,
  viewAdminViaId,
  updateJobListing,
  sendEmailConcern,
  updateAdminEmail,
  deactivateAdmin,
};
