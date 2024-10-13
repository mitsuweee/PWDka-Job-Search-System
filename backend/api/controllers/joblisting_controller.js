const { json } = require("body-parser");
const knex = require("../models/connection_db");
const { jobListingModel } = require("../models/joblisting_model");
const util = require("./util");

const postJobs = async (req, res, next) => {
  const {
    position_name,
    description,
    qualification,
    requirement,
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
    !requirement ||
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
    maximum_salary < minimum_salary
  ) {
    return res.status(400).json({
      successful: false,
      message:
        "Maximum Salary must only contain numbers that are Equal or greater than minimum Salary",
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
          requirement,
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
          "job_listing.requirement",
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
          "job_listing.requirement",
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

const viewJobListingViaUserNewestToOldest = async (req, res, next) => {
  const { id } = req.params;
  const city = req.body.city;
  const position_name = req.body.position_name;
  const position_type = req.body.position_type; // Get filters from query parameters
  const page = 1; // Default to page 1 if not provided
  const limit = 1000; // Default to 1000 listings per page if not provided
  const offset = (page - 1) * limit; // Calculate offset for pagination

  if (!id) {
    return res.status(404).json({
      successful: false,
      message: "id is missing",
    });
  } else {
    try {
      // Get the total count of job listings for the user
      const baseQuery = knex("job_listing")
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
        .where("user.id", id);

      // Count job listings with applied filters
      const totalJobListings = await baseQuery.clone().count({ count: "*" });

      const totalCount = totalJobListings[0].count;

      // Add filtering conditions to the base query
      if (city) {
        baseQuery.where("company.city", "like", `%${city}%`);
      }

      if (position_name) {
        baseQuery.where(
          "job_listing.position_name",
          "like",
          `%${position_name}%`
        );
      }

      if (position_type) {
        baseQuery.where("position_type.type", "like", `%${position_type}%`);
      }

      // Retrieve paginated job listings with applied filters
      const rows = await baseQuery
        .select(
          "job_listing.id",
          "job_listing.position_name",
          "job_listing.description",
          "job_listing.qualification",
          "job_listing.requirement",
          "job_listing.minimum_salary",
          "job_listing.maximum_salary",
          "position_type.type AS position_type",
          "company.name AS company_name",
          "company.profile_picture AS company_profile_picture",
          "company.email AS company_email",
          "company.address AS company_address",
          "company.city AS company_city",
          "company.contact_number AS company_contact_number",
          "company.description AS company_description"
        )
        .orderBy("job_listing.date_created", "desc")
        .limit(limit)
        .offset(offset);

      if (rows.length === 0) {
        return res.status(404).json({
          successful: false,
          message:
            "No job listings are available at the moment. We are committed to bringing you new opportunities tailored to your skills and abilities. Please stay hopeful, more listings will be available soon.",
        });
      } else {
        // Convert company_profile_picture BLOB to Base64 string for each row
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
          pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            perPage: limit,
          },
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
        "job_listing.requirement",
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
        ? row.company_profile_picture.toString()
        : null,
    }));

    return res.status(200).json({
      successful: true,
      message: "Successfully Retrieved Company's Job Listings",
      data: processedRows,
      count: processedRows.length,
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
    requirement,
    minimum_salary,
    maximum_salary,
    positiontype_id,
    disability_ids, // These are now disability "types", not IDs
  } = req.body;

  if (
    !id ||
    !position_name ||
    !description ||
    !qualification ||
    !requirement ||
    !minimum_salary ||
    !maximum_salary ||
    !positiontype_id ||
    !disability_ids ||
    disability_ids.length === 0
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
    maximum_salary < minimum_salary
  ) {
    return res.status(400).json({
      successful: false,
      message:
        "Maximum Salary must only contain numbers that are equal or greater than Minimum Salary",
    });
  }

  try {
    // Check if position type exists
    const positionTypeExists = await knex("position_type")
      .where("id", positiontype_id)
      .first();

    if (!positionTypeExists) {
      return res.status(400).json({
        successful: false,
        message: "Position Type Id is invalid",
      });
    }

    // Begin transaction for updating the job listing and disabilities
    await knex.transaction(async (trx) => {
      // Update the job listing
      const result = await trx("job_listing").where("id", id).update({
        position_name,
        description,
        qualification,
        requirement,
        minimum_salary,
        maximum_salary,
        positiontype_id,
      });

      if (result === 0) {
        return res.status(404).json({
          successful: false,
          message: "Job Listing not found",
        });
      }

      // Fetch existing disabilities for the job listing
      const existingDisabilities = await trx("disability_job_listing")
        .where("joblisting_id", id)
        .pluck("disability_id");

      // Fetch the IDs corresponding to the provided disability types
      const disabilities = await trx("disability")
        .select("id", "type")
        .whereIn("type", disability_ids);

      const disabilityIds = disabilities.map((disability) => disability.id);

      if (disabilityIds.length !== disability_ids.length) {
        return res.status(400).json({
          successful: false,
          message: "One or more provided disability types are invalid",
        });
      }

      // Find new disabilities to add
      const disabilitiesToAdd = disabilityIds.filter(
        (disability_id) => !existingDisabilities.includes(disability_id)
      );

      // Find disabilities to remove (optional)
      const disabilitiesToRemove = existingDisabilities.filter(
        (disability_id) => !disabilityIds.includes(disability_id)
      );

      // Insert new disabilities that are not already associated with the job listing
      for (const disability_id of disabilitiesToAdd) {
        await trx("disability_job_listing").insert({
          disability_id: disability_id,
          joblisting_id: id,
        });
      }

      // Optionally remove disabilities that are no longer associated (if needed)
      if (disabilitiesToRemove.length > 0) {
        await trx("disability_job_listing")
          .where("joblisting_id", id)
          .whereIn("disability_id", disabilitiesToRemove)
          .del();
      }
    });

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

const viewCounts = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Query to count job listings for the given company_id
    const jobListingsCount = await knex("job_listing")
      .where({ company_id: id }) // Filter by company_id
      .count("id as count")
      .first();

    // Query to count job applications for job listings under the given company_id
    const jobApplicationsCount = await knex("job_application")
      .join(
        "job_listing",
        "job_application.joblisting_id",
        "=",
        "job_listing.id"
      )
      .where({ "job_listing.company_id": id })
      .count("job_application.id as count")
      .first();

    // Combine the results into a single response
    return res.status(200).json({
      successful: true,
      message: "Successfully Retrieved Counts",
      data: {
        job_listings: jobListingsCount.count, // Count of job listings for the given company
        job_applications: jobApplicationsCount.count, // Count of job applications for job listings under the given company
      },
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
  viewCounts,
};
