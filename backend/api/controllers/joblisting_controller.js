const { json } = require("body-parser");
const knex = require("../models/connection_db");
const { jobListingModel } = require("../models/joblisting_model");
const util = require("./util");
const nodemailer = require("nodemailer");

const postJobs = async (req, res, next) => {
  let {
    position_name,
    level,
    description,
    qualification,
    requirement,
    minimum_salary,
    maximum_salary,
    salary_visibility,
    positiontype_id,
    company_id,
    disability_ids,
  } = req.body;

  // Input validation
  if (
    !position_name ||
    !level ||
    !description ||
    !qualification ||
    !requirement ||
    !minimum_salary ||
    !maximum_salary ||
    !salary_visibility ||
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
  } else if (!util.checkNumbers(minimum_salary) || minimum_salary < 12900) {
    return res.status(400).json({
      successful: false,
      message:
        "Minimum Salary must only contain numbers that are greater than or equal to The Minimum wage (₱12900)",
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
  }

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

    // Check if a job with the same position name and level already exists for the company
    const existingJob = await knex("job_listing")
      .select("id")
      .where({
        position_name: position_name.trim().toLowerCase(),
        level: level.trim().toLowerCase(),
        company_id,
      })
      .first();

    if (existingJob) {
      return res.status(400).json({
        successful: false,
        message: `There is a job listing already posted with a position name of: "${position_name}" and with the level of: "${level}".`,
      });
    }

    // Insert the job listing
    const [jobListingId] = await knex("job_listing")
      .insert({
        position_name: position_name.trim().toLowerCase(),
        level: level.trim().toLowerCase(),
        description,
        qualification,
        requirement,
        minimum_salary,
        maximum_salary,
        salary_visibility,
        positiontype_id: positionType.id,
        company_id,
      })
      .returning("id");

    // Insert all selected disability types
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
      } else {
        await knex("disability_job_listing").insert({
          disability_id: disability.id,
          joblisting_id: jobListingId,
        });
      }
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
};

const viewJobListing = async (req, res, next) => {
  let id = req.params.id;

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
          "job_listing.level",
          "job_listing.description",
          "job_listing.qualification",
          "job_listing.requirement",
          "job_listing.minimum_salary",
          "job_listing.maximum_salary",
          "job_listing.salary_visibility",
          "position_type.type AS position_type",
          "company.name AS company_name",
          "company.profile_picture AS company_profile_picture",
          "company.email AS company_email",
          "company.address AS company_address",
          "company.city AS company_city",
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
          "job_listing.level",
          "job_listing.description",
          "job_listing.qualification",
          "job_listing.requirement",
          "job_listing.minimum_salary",
          "job_listing.maximum_salary",
          "job_listing.salary_visibility",
          "position_type.type",
          "company.name"
        );

      if (rows.length === 0) {
        return res.status(404).json({
          successful: false,
          message: "Job Listing not found",
        });
      } else {
        // Convert company_profile_picture BLOB to string
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
  const id = req.params.id;
  const city = req.body.city;
  const position_name = req.body.position_name;
  const position_type = req.body.position_type;
  const page = 1; // Default to page 1 if not provided
  const limit = 1000; // Default to 1000 listings per page if not provided
  const offset = (page - 1) * limit; // Calculate offset for pagination
  const sortOption = req.query.sortOption || "Newest";

  if (!id) {
    return res.status(404).json({
      successful: false,
      message: "id is missing",
    });
  } else {
    try {
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
        .leftJoin("job_application", function () {
          this.on("job_listing.id", "=", "job_application.joblisting_id").andOn(
            "job_application.user_id",
            "=",
            knex.raw("?", [id])
          );
        })
        .where("user.id", id)
        .andWhere("job_listing.status", "ACTIVE");

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
      // Adjust sorting based on sortOption
      switch (sortOption) {
        case "Newest":
          baseQuery.orderBy("job_listing.date_created", "desc"); // Newest first
          break;
        case "Oldest":
          baseQuery.orderBy("job_listing.date_created", "asc"); // Oldest first
          break;
        case "A-Z":
          baseQuery.orderBy("job_listing.position_name", "asc"); // Alphabetical by job name
          break;
        case "Z-A":
          baseQuery.orderBy("job_listing.position_name", "desc"); // Reverse alphabetical by job name
          break;
        default:
          baseQuery.orderBy("job_listing.date_created", "desc"); // Default to Newest if no valid sortOption
      }
      // Fetch job listings with pagination and sort order
      const rows = await baseQuery
        .select(
          "job_listing.id",
          "job_listing.status",
          "job_listing.position_name",
          "job_listing.level",
          "job_listing.description",
          "job_listing.qualification",
          "job_listing.requirement",
          "job_listing.minimum_salary",
          "job_listing.maximum_salary",
          "job_listing.salary_visibility",
          "job_listing.date_created", // Added date_created field
          "position_type.type AS position_type",
          "company.name AS company_name",
          "company.profile_picture AS company_profile_picture",
          "company.email AS company_email",
          "company.address AS company_address",
          "company.city AS company_city",
          "company.contact_number AS company_contact_number",
          "company.description AS company_description",
          knex.raw(
            "CASE WHEN job_application.id IS NOT NULL THEN true ELSE false END AS is_applied"
          )
        )
        .where("company.status", "VERIFIED")
        .orderBy("job_listing.date_created", "desc")
        .limit(limit)
        .offset(offset);

      if (rows.length === 0) {
        return res.status(404).json({
          successful: false,
          message:
            "No job listings are available at the moment. Please check back soon for more listings.",
        });
      } else {
        // Convert company_profile_picture BLOB to String and format the data
        const processedRows = rows.map((row) => ({
          ...row,
          company_profile_picture: row.company_profile_picture
            ? row.company_profile_picture.toString()
            : null,
          is_disabled: row.is_applied, // Mark listing as disabled if the user already applied
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
      .whereIn("job_listing.status", ["ACTIVE", "INACTIVE"])
      .groupBy(
        "job_listing.id",
        "job_listing.status",
        "job_listing.position_name",
        "job_listing.level",

        "job_listing.description",
        "job_listing.qualification",
        "job_listing.minimum_salary",
        "job_listing.maximum_salary",
        "job_listing.salary_visibility",
        "position_type.type",
        "company.name",
        "job_listing.date_created"
      )
      .orderBy("job_listing.date_created", "desc")
      .select(
        "job_listing.id",
        "job_listing.status",
        "job_listing.position_name",
        "job_listing.level",

        "job_listing.description",
        "job_listing.qualification",
        "job_listing.requirement",
        "job_listing.minimum_salary",
        "job_listing.maximum_salary",
        "job_listing.salary_visibility",
        "position_type.type as position_type",
        "company.name as company_name",
        "company.profile_picture as company_profile_picture",
        "company.email as company_email",
        "company.address as company_address",
        "company.city as company_city",
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
    } else {
      // Convert company_profile_picture BLOB to string
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
    }
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

const updateJobListing = async (req, res, next) => {
  const id = req.params.id;
  const status = req.body.status;
  const position_name = req.body.position_name;
  const level = req.body.level;
  const description = req.body.description;
  const qualification = req.body.qualification;
  const requirement = req.body.requirement;
  const minimum_salary = req.body.minimum_salary;
  const maximum_salary = req.body.maximum_salary;
  const salary_visibility = req.body.salary_visibility;
  const positiontype_id = req.body.positiontype_id;
  const disability_ids = req.body.disability_ids;
  if (
    !id ||
    !status ||
    !position_name ||
    !level ||
    !description ||
    !qualification ||
    !requirement ||
    !minimum_salary ||
    !maximum_salary ||
    !salary_visibility ||
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
  } else if (!util.checkNumbers(minimum_salary) || minimum_salary < 12900) {
    return res.status(400).json({
      successful: false,
      message:
        "Minimum Salary must only contain numbers that are greater than or equal to The Minimum wage (₱12900)",
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
  } else {
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
      } else {
        // Fetch the company ID associated with the job listing
        const jobListing = await knex("job_listing").where("id", id).first();

        if (!jobListing) {
          return res.status(404).json({
            successful: false,
            message: "Job Listing not found",
          });
        }

        const companyId = jobListing.company_id;

        // Check for existing job listings with the same position name and level for the same company
        const duplicateJob = await knex("job_listing")
          .where({
            company_id: companyId,
            position_name: position_name,
            level: level,
          })
          .andWhereNot({ id }) // Exclude the current job listing being updated
          .first();

        if (duplicateJob) {
          return res.status(400).json({
            successful: false,
            message:
              "A job listing with the same position name and level already exists for this company",
          });
        }

        // Begin transaction
        await knex.transaction(async (trx) => {
          const result = await trx("job_listing").where("id", id).update({
            status,
            position_name,
            level,
            description,
            qualification,
            requirement,
            minimum_salary,
            maximum_salary,
            salary_visibility,
            positiontype_id,
          });

          if (result === 0) {
            return res.status(404).json({
              successful: false,
              message: "Job Listing not found",
            });
          } else {
            // Fetch existing disabilities for the job listing
            const existingDisabilities = await trx("disability_job_listing")
              .where("joblisting_id", id)
              .pluck("disability_id");

            // Fetch the IDs corresponding to the provided disability types
            const disabilities = await trx("disability")
              .select("id", "type")
              .whereIn("type", disability_ids);

            const disabilityIds = disabilities.map(
              (disability) => disability.id
            );

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

            if (disabilitiesToRemove.length > 0) {
              await trx("disability_job_listing")
                .where("joblisting_id", id)
                .whereIn("disability_id", disabilitiesToRemove)
                .del();
            }
          }
        });
        return res.status(200).json({
          successful: true,
          message: "Job Listing updated successfully",
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
  } else {
    try {
      const jobListing = await knex("job_listing").where("id", id).first();

      if (!jobListing) {
        return res.status(404).json({
          successful: false,
          message: "Job listing not found",
        });
      } else {
        await knex("job_listing").where("id", id).del();

        return res.status(200).json({
          successful: true,
          message: "Successfully Deleted Job Listing",
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

const viewCounts = async (req, res, next) => {
  const id = req.params.id;

  try {
    // Check if the company exists in the company table
    const companyExists = await knex("company").where({ id }).first();

    if (!companyExists) {
      return res.status(404).json({
        successful: false,
        message: "Company not found",
      });
    } else {
      // Query to count total job listings for the given company_id
      const jobListingsCount = await knex("job_listing")
        .where({ company_id: id })
        .count("id as count")
        .first();

      // Query to count job applications for job listings
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

      // Query to count full-time job listings
      const fullTimeJobListingsCount = await knex("job_listing")
        .join(
          "position_type",
          "job_listing.positiontype_id",
          "=",
          "position_type.id"
        )
        .where({
          "job_listing.company_id": id,
          "position_type.type": "Full-Time",
        })
        .count("job_listing.id as count")
        .first();

      // Query to count part-time job listings
      const partTimeJobListingsCount = await knex("job_listing")
        .join(
          "position_type",
          "job_listing.positiontype_id",
          "=",
          "position_type.id"
        )
        .where({
          "job_listing.company_id": id,
          "position_type.type": "Part-Time",
        })
        .count("job_listing.id as count")
        .first();

      // Combine all the results into a single response
      return res.status(200).json({
        successful: true,
        message: "Successfully Retrieved Counts",
        data: {
          job_listings: jobListingsCount.count,
          job_applications: jobApplicationsCount.count,
          full_time_job_listings: fullTimeJobListingsCount.count,
          part_time_job_listings: partTimeJobListingsCount.count,
        },
      });
    }
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

const deactivateJobListing = async (req, res, next) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({
      successful: false,
      message: "Job Listing ID is missing",
    });
  } else {
    try {
      await knex.transaction(async (trx) => {
        const result = await trx("job_listing").where("id", id).update({
          status: "DEACTIVATE",
        });

        if (result === 0) {
          return res.status(404).json({
            successful: false,
            message: "Job Listing not found",
          });
        }
      });

      return res.status(200).json({
        successful: true,
        message: "Job Listing deactivated successfully",
      });
    } catch (err) {
      return res.status(500).json({
        successful: false,
        message: err.message,
      });
    }
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
  deactivateJobListing,
};
