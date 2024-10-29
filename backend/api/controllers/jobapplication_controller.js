const { json } = require("body-parser");
const knex = require("../models/connection_db");
const jobApplicationModel = require("../models/jobapplication_model");
const util = require("./util");

const uploadResume = async (req, res, next) => {
  let user_id = req.body.user_id;
  let joblisting_id = req.body.joblisting_id;
  let resume = req.body.resume;

  if (!user_id || !joblisting_id || !resume) {
    return res.status(400).json({
      successful: false,
      message: "One or more details are missing",
    });
  } else {
    try {
      // Check if the user ID is valid
      const userExists = await knex("user").where({ id: user_id }).first();
      if (!userExists) {
        return res.status(400).json({
          successful: false,
          message: "User ID is invalid",
        });
      } else {
        // Check if the job listing ID is valid
        const jobListingExists = await knex("job_listing")
          .where({ id: joblisting_id })
          .first();
        if (!jobListingExists) {
          return res.status(400).json({
            successful: false,
            message: "Job Listing ID is invalid",
          });
        } else {
          // Check if the user has already applied for this job listing
          const existingApplication = await knex("job_application")
            .where({ user_id, joblisting_id })
            .first();

          if (existingApplication) {
            return res.status(400).json({
              successful: false,
              message: "User has already applied for this job listing",
            });
          } else {
            // Insert new job application
            await knex("job_application").insert({
              user_id,
              joblisting_id,
              resume,
            });

            return res.status(200).json({
              successful: true,
              message: "Successfully uploaded resume",
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

const viewAllUsersApplicationsViaJobListingId = async (req, res, next) => {
  let id = req.params.id;

  if (!id) {
    return res.status(400).json({
      successful: false,
      message: "ID is missing",
    });
  }

  try {
    // Check if the Job Listing ID is valid
    const jobListingExists = await knex("job_listing").where({ id }).first();
    if (!jobListingExists) {
      return res.status(400).json({
        successful: false,
        message: "Invalid Job Listing ID",
      });
    } else {
      const applications = await knex("job_application")
        .select(
          "job_application.id",
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
          "job_application.resume",
          "job_listing.position_name",
          "job_application.date_created" // Include date_created field
        )
        .join("user", "job_application.user_id", "user.id")
        .join("disability", "user.disability_id", "disability.id")
        .join("job_listing", "job_application.joblisting_id", "job_listing.id")
        .where("job_listing.id", id)
        .andWhere("job_application.status", "Under Review");

      if (applications.length === 0) {
        return res.status(404).json({
          successful: false,
          message: "Job Applications not found",
        });
      } else {
        // Convert BLOB data to string and format date_created
        const processedApplications = applications.map((app) => ({
          ...app,
          formal_picture: app.formal_picture
            ? app.formal_picture.toString()
            : null,
          resume: app.resume ? app.resume.toString() : null,
          date_created: app.date_created
            ? new Date(app.date_created).toLocaleString()
            : null,
        }));

        return res.status(200).json({
          successful: true,
          message: "Successfully retrieved Job Applications",
          data: processedApplications,
          count: processedApplications.length,
        });
      }
    }
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

const viewUserJobApplicationStatus = async (req, res, next) => {
  let id = req.params.id;

  if (!id) {
    return res.status(400).json({
      successful: false,
      message: "Id is missing",
    });
  } else {
    try {
      const idExists = await knex("job_application").where({ id }).first();
      if (!idExists) {
        return res.status(400).json({
          successful: false,
          message: "Invalid User ID",
        });
      } else {
        // Retrieve all job applications of the user
        const applications = await knex("job_application")
          .select(
            "job_listing.position_name",
            "company.name as company_name",
            "job_application.status",
            "job_application.date_created"
          )
          .join(
            "job_listing",
            "job_application.joblisting_id",
            "job_listing.id"
          )
          .join("company", "job_listing.company_id", "company.id")
          .where("job_application.user_id", id)
          .orderBy("job_listing.date_created", "desc");

        if (applications.length === 0) {
          return res.status(404).json({
            successful: false,
            message: "No job applications found for this user",
          });
        } else {
          return res.status(200).json({
            successful: true,
            message: "Successfully retrieved user's job applications",
            data: applications,
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

const viewAllUsersByStatus = async (req, res, next) => {
  let id = req.params.id;
  let status = req.params.status;
  if (!id || !status) {
    return res.status(400).json({
      successful: false,
      message: "ID or STATUS is missing",
    });
  } else {
    try {
      // Check if the Job Listing ID is valid
      const jobListingExists = await knex("job_listing").where({ id }).first();
      if (!jobListingExists) {
        return res.status(400).json({
          successful: false,
          message: "Invalid Job Listing ID",
        });
      } else {
        // Retrieve job applications
        const applications = await knex("job_application")
          .select(
            "disability.type",
            "user.first_name",
            "user.middle_initial",
            "user.last_name",
            "user.email",
            knex.raw("CONCAT(user.address, ' ', user.city) AS Location"),
            "user.gender",
            "user.birth_date",
            "user.contact_number",
            "user.formal_picture",
            "resume",
            "job_application.date_created",
            "job_listing.position_name"
          )
          .join("user", "job_application.user_id", "user.id")
          .join("disability", "user.disability_id", "disability.id")
          .join(
            "job_listing",
            "job_application.joblisting_id",
            "job_listing.id"
          )
          .where("job_listing.id", id)
          .andWhere("job_application.status", status);

        if (applications.length === 0) {
          return res.status(404).json({
            successful: false,
            message: `There are no ${status} Users`,
          });
        } else {
          // Convert BLOB data to string
          const processedApplications = applications.map((app) => ({
            ...app,
            formal_picture: app.formal_picture
              ? app.formal_picture.toString()
              : null,
            resume: app.resume ? app.resume.toString() : null,
          }));

          return res.status(200).json({
            successful: true,
            message: "Successfully retrieved Job Applications",
            data: processedApplications,
            count: processedApplications.length,
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

const deleteJobApplication = async (req, res, next) => {
  let id = req.params.id;

  if (!id) {
    return res.status(400).json({
      successful: false,
      message: "ID is missing",
    });
  } else {
    try {
      // Check if the job application exists
      const applicationExists = await knex("job_application")
        .where({ id })
        .first();
      if (!applicationExists) {
        return res.status(404).json({
          successful: false,
          message: "Job application not found",
        });
      } else {
        // Delete the job application
        await knex("job_application").where({ id }).del();

        return res.status(200).json({
          successful: true,
          message: "Successfully Deleted Job Application!",
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

// const updateJobApplicationStatus = async (req, res, next) => {
//   let id = req.params.id;
//   let status = req.body.status;

//   if (!id || !status) {
//     return res.status(400).json({
//       successful: false,
//       message: "ID is missing",
//     });
//   } else {
//     try {
//       // Check if the job application exists
//       const applicationExists = await knex("job_application")
//         .where({ id })
//         .first();

//       if (!applicationExists) {
//         return res.status(404).json({
//           successful: false,
//           message: "Job application not found",
//         });
//       } else {
//         await knex("job_application").where({ id }).update({ status: status });

//         return res.status(200).json({
//           successful: true,
//           message: `Successfully updated Job Application status to '${status}'!`,
//         });
//       }
//     } catch (err) {
//       return res.status(500).json({
//         successful: false,
//         message: err.message,
//       });
//     }
//   }
// };

// akin to- mits ewan ko kung tama ba to or mali
const updateJobApplicationStatus = async (req, res, next) => {
  let id = req.params.id;
  let status = req.body.status;

  if (!id || !status) {
    return res.status(400).json({
      successful: false,
      message: "ID or STATUS is missing",
    });
  }

  try {
    const applicationExists = await knex("job_application")
      .where({ id })
      .first();

    if (!applicationExists) {
      return res.status(404).json({
        successful: false,
        message: "Job application not found",
      });
    }

    // Update the status in the database
    await knex("job_application").where({ id }).update({ status: status });

    // Fetch the updated applicant data
    const updatedApplicant = await knex("job_application")
      .select("id", "status") // Add other fields as needed
      .where({ id })
      .first();

    return res.status(200).json({
      successful: true,
      message: `Successfully updated Job Application status to '${status}'!`,
      data: updatedApplicant, // Include updated data in response
    });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

const getAllApplicantsByStatus = async (req, res) => {
  const { jobListingId } = req.params; // Assuming you have a job listing ID filter

  try {
    const applicants = await knex("job_application")
      .select(
        "job_application.id",
        "user.first_name",
        "user.middle_initial",
        "user.last_name",
        "user.email",
        "job_application.status",
        "job_application.resume" // Adding the resume field
      )
      .join("user", "job_application.user_id", "user.id")
      .where("job_application.joblisting_id", jobListingId); // Assuming you're filtering by job listing ID

    // Convert BLOB to string if necessary
    const processedApplicants = applicants.map((applicant) => ({
      ...applicant,
      resume: applicant.resume ? applicant.resume.toString() : null,
    }));

    res.status(200).json({
      successful: true,
      message: "Applicants retrieved successfully",
      data: processedApplicants,
    });
  } catch (error) {
    res.status(500).json({
      successful: false,
      message: "Failed to retrieve applicants",
    });
  }
};

module.exports = {
  uploadResume,
  viewAllUsersApplicationsViaJobListingId,
  viewAllUsersByStatus,
  viewUserJobApplicationStatus,
  deleteJobApplication,
  updateJobApplicationStatus,
  getAllApplicantsByStatus,
};
