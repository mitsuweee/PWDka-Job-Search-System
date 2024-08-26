const { json } = require("body-parser");
const knex = require("../models/connection_db");
const { adminModel } = require("../models/admin_model");
const util = require("./util");
const bcrypt = require("bcrypt");

const registerAdmin = async (req, res, next) => {
  let firstName = req.body.firstName.toLowerCase();
  let lastName = req.body.lastName.toLowerCase();
  let email = req.body.email.toLowerCase();
  let password = req.body.password;
  let confirmPassword = req.body.confirm_password;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      successful: false,
      message: "One or more details are missing",
    });
  }

  if (
    util.checkNumbersAndSpecialChar(firstName) ||
    util.checkNumbersAndSpecialChar(lastName)
  ) {
    return res.status(400).json({
      successful: false,
      message: "Invalid Name format",
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
      message:
        "Invalid Password Format. It should have at least one digit, one uppercase, one lowercase, one special character, and be at least 8 characters in length",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      successful: false,
      message: "Passwords do not match",
    });
  }

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

    // Insert new admin
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
};

const loginAdmin = async (req, res, next) => {
  let email = req.body.email.toLowerCase();
  let password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({
      successful: false,
      message: "Email or Password is missing",
    });
  } else {
    try {
      // Query the admin table using Knex
      const adminRow = await knex("admin").where({ email }).first();

      if (!adminRow) {
        return res.status(400).json({
          successful: false,
          message: "Invalid Credentials",
        });
      }

      const storedPassword = adminRow.password;
      const passwordMatch = await bcrypt.compare(password, storedPassword);

      if (!passwordMatch) {
        return res.status(400).json({
          successful: false,
          message: "Invalid Credentials",
        });
      } else {
        return res.status(200).json({
          successful: true,
          message: "Successfully Logged In",
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

const viewAdmins = async (req, res, next) => {
  try {
    const rows = await knex("admin").select(
      "id",
      "first_name",
      "last_name",
      "email"
    );

    return res.status(200).json({
      successful: true,
      message: "Successfully Retrieved Admins",
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
    const rows = await knex("user")
      .join("disability", "user.disability_id", "=", "disability.id")
      .select(
        "user.id",
        "disability.type AS type",
        knex.raw(
          "CONCAT(user.first_name, ' ', user.middle_initial, '. ', user.last_name) AS full_name"
        ),
        "email",
        "address",
        "city",
        "gender",
        "birth_date",
        "contact_number",
        "formal_picture"
      )
      .where("status", "VERIFIED");

    return res.status(200).json({
      successful: true,
      message: "Successfully Retrieved Users",
      data: rows,
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
        "address",
        "city",
        "contact_number",
        "email",
        "profile_picture"
      )
      .where("status", "VERIFIED");

    // Convert BLOB data to base64
    const processedCompanies = companies.map((company) => ({
      ...company,
      profile_picture: company.profile_picture
        ? company.profile_picture.toString("base64")
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
        "job_listing.description",
        "job_listing.qualification",
        "job_listing.minimum_salary",
        "job_listing.maximum_salary",
        "position_type.type AS position_type",
        "company.name AS company_name",
        "company.profile_picture AS company_profile_picture",
        knex.raw(
          "GROUP_CONCAT(disability.type SEPARATOR ', ') AS disability_types"
        )
      )
      .groupBy(
        "job_listing.id",
        "job_listing.position_name",
        "job_listing.description",
        "job_listing.qualification",
        "job_listing.minimum_salary",
        "job_listing.maximum_salary",
        "position_type.type",
        "company.profile_picture",
        "company.name"
      )
      .orderBy("job_listing.date_created", "desc");

    if (rows.length === 0) {
      return res.status(404).json({
        successful: false,
        message: "Job Listing not found",
      });
    } else {
      // Convert BLOB data to base64
      const processedRows = rows.map((row) => ({
        ...row,
        profile_picture: row.profile_picture
          ? row.profile_picture.toString("base64")
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
          "job_listing.description",
          "job_listing.qualification",
          "job_listing.minimum_salary",
          "job_listing.maximum_salary",
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
          "job_listing.qualification",
          "job_listing.minimum_salary",
          "job_listing.maximum_salary",
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
        // Convert BLOB data to base64
        const processedRows = rows.map((row) => ({
          ...row,
          company_profile_picture: row.company_profile_picture
            ? row.company_profile_picture.toString("base64")
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
  }

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
};

const viewAdminViaId = async (req, res, next) => {
  const id = req.params.id;

  if (!id) {
    return res.status(404).json({
      successful: false,
      message: "ID is missing",
    });
  }

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
};

const updateJobListing = async (req, res, next) => {
  const id = req.params.id;
  const {
    position_name,
    description,
    qualification,
    minimum_salary,
    maximum_salary,
    positiontype_id,
  } = req.body;

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
  }

  if (util.checkSpecialChar(position_name)) {
    return res.status(400).json({
      successful: false,
      message: "Position name must not contain special characters",
    });
  }

  if (!util.checkNumbers(minimum_salary) || minimum_salary < 0) {
    return res.status(400).json({
      successful: false,
      message:
        "Minimum Salary must only contain numbers that are greater than or equal to 0",
    });
  }

  if (!util.checkNumbers(maximum_salary) || maximum_salary <= minimum_salary) {
    return res.status(400).json({
      successful: false,
      message:
        "Maximum Salary must only contain numbers that are greater than minimum Salary",
    });
  }

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
};

module.exports = {
  registerAdmin,
  loginAdmin,
  viewAdmins,
  viewUsers,
  viewCompanies,
  viewAllJobListingNewestToOldest,
  viewJobListing,
  adminChangePassword,
  deleteUser,
  deleteCompany,
  deleteJob,
  searchUser,
  viewAdminViaId,
  updateJobListing,
};
