const { json } = require("body-parser");
const knex = require("../models/connection_db");
const { jobListingModel } = require("../models/joblisting_model");
const util = require("./util");

const postJobs = async (req, res, next) => {
  const {
    position_name,
    description,
    qualification,
    minimum_salary,
    maximum_salary,
    positiontype_id,
    company_id,
    disability_ids,
  } = req.body;

  if (
    !position_name ||
    !description ||
    !qualification ||
    !positiontype_id ||
    !company_id ||
    !disability_ids ||
    disability_ids.length === 0
  ) {
    return res.status(404).json({
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
      // Check if position type exists
      const positionType = await knex("position_type")
        .select("id")
        .where("type", positiontype_id)
        .first();

      if (!positionType) {
        return res.status(400).json({
          successful: false,
          message: "Position Type Id is invalid",
        });
      }

      // Insert the job listing
      const [jobListingId] = await knex("job_listing")
        .insert({
          position_name,
          description,
          qualification,
          minimum_salary,
          maximum_salary,
          positiontype_id: positionType.id,
          company_id,
        })
        .returning("id");

      // Validate and insert disability job listings
      for (const disability_id of disability_ids) {
        const disability = await knex("disability")
          .select("id")
          .where("type", disability_id)
          .first();

        if (!disability) {
          // Rollback job listing creation if disability_id is invalid
          await knex("job_listing").where("id", jobListingId).del();
          return res.status(400).json({
            successful: false,
            message: "Disability Id does not exist",
          });
        }

        await knex("disability_job_listing").insert({
          disability_id: disability.id,
          joblisting_id: jobListingId,
        });
      }

      return res.status(200).json({
        successful: true,
        message: "Job listing posted successfully!",
      });
    } catch (err) {
      return res.status(500).json({
        successful: false,
        message: err.message,
      });
    }
  }
};

const viewJobListing = async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(404).json({
      successful: false,
      message: "id is missing",
    });
  } else {
    try {
      const rows = await knex("job_listing")
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
          "company.email AS company_email",
          "company.address AS company_address",
          "company.contact_number AS company_contact_number",
          "company.description AS company_description",
          knex.raw(
            'GROUP_CONCAT(disability.type SEPARATOR ", ") AS disability_types'
          )
        )
        .join(
          "position_type",
          "job_listing.positiontype_id",
          "position_type.id"
        )
        .join("company", "job_listing.company_id", "company.id")
        .join(
          "disability_job_listing",
          "job_listing.id",
          "disability_job_listing.joblisting_id"
        )
        .join(
          "disability",
          "disability_job_listing.disability_id",
          "disability.id"
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
          "company.name"
        );

      if (rows.length === 0) {
        return res.status(404).json({
          successful: false,
          message: "Job Listing not found",
        });
      } else {
        // Convert company_profile_picture BLOB to Base64 string for each row
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

const viewJobListingViaUserNewestToOldest = async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(404).json({
      successful: false,
      message: "id is missing",
    });
  } else {
    try {
      const rows = await knex("job_listing")
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
          "company.email AS company_email",
          "company.address AS company_address",
          "company.contact_number AS company_contact_number",
          "company.description AS company_description"
        )
        .join(
          "position_type",
          "job_listing.positiontype_id",
          "position_type.id"
        )
        .join("company", "job_listing.company_id", "company.id")
        .join(
          "disability_job_listing",
          "job_listing.id",
          "disability_job_listing.joblisting_id"
        )
        .join(
          "disability",
          "disability_job_listing.disability_id",
          "disability.id"
        )
        .join("user", "user.disability_id", "disability.id")
        .where("user.id", id)
        .orderBy("job_listing.date_created", "desc");

      if (rows.length === 0) {
        return res.status(404).json({
          successful: false,
          message: "Job Listing not found",
        });
      } else {
        // Convert company_profile_picture BLOB to Base64 string for each row
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

const viewJobsCreatedByCompanyNewestToOldest = async (req, res, next) => {
  const id = req.params.id;

  if (!id) {
    return res.status(404).json({
      successful: false,
      message: "id is missing",
    });
  }

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
      .where("company.id", id)
      .groupBy(
        "job_listing.id",
        "job_listing.position_name",
        "job_listing.description",
        "job_listing.qualification",
        "job_listing.minimum_salary",
        "job_listing.maximum_salary",
        "position_type.type",
        "company.name",
        "job_listing.date_created"
      )
      .orderBy("job_listing.date_created", "desc")
      .select(
        "job_listing.id",
        "job_listing.position_name",
        "job_listing.description",
        "job_listing.qualification",
        "job_listing.minimum_salary",
        "job_listing.maximum_salary",
        "position_type.type as position_type",
        "company.name as company_name",
        "company.profile_picture as company_profile_picture",
        "company.email as company_email",
        "company.address as company_address",
        "company.contact_number as company_contact_number",
        "company.description as company_description",
        knex.raw(
          'GROUP_CONCAT(disability.type SEPARATOR ", ") as disability_types'
        ),
        "job_listing.date_created"
      );

    if (rows.length === 0) {
      return res.status(404).json({
        successful: false,
        message: "Company's Job Listings not found",
      });
    }

    // Convert company_profile_picture BLOB to Base64 string for each row
    const processedRows = rows.map((row) => ({
      ...row,
      company_profile_picture: row.company_profile_picture
        ? row.company_profile_picture.toString("base64")
        : null,
    }));

    return res.status(200).json({
      successful: true,
      message: "Successfully Retrieved Company's Job Listings",
      data: processedRows,
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
  }

  try {
    const positionTypeExists = await knex("position_type")
      .where("id", positiontype_id)
      .first();

    if (!positionTypeExists) {
      return res.status(400).json({
        successful: false,
        message: "Position Type Id is invalid",
      });
    }

    const result = await knex("job_listing").where("id", id).update({
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

const deleteJob = async (req, res, next) => {
  const id = req.params.id;

  if (!id) {
    return res.status(404).json({
      successful: false,
      message: "Id is missing",
    });
  }

  try {
    const jobListing = await knex("job_listing").where("id", id).first();

    if (!jobListing) {
      return res.status(404).json({
        successful: false,
        message: "Job listing not found",
      });
    }

    await knex("job_listing").where("id", id).del();

    return res.status(200).json({
      successful: true,
      message: "Successfully Deleted Job Listing",
    });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

module.exports = {
  postJobs,
  viewJobListing,
  viewJobListingViaUserNewestToOldest,
  viewJobsCreatedByCompanyNewestToOldest,
  updateJobListing,
  deleteJob,
};
