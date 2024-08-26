const { json } = require("body-parser");
const database = require("../models/connection_db");
const jobApplicationModel = require("../models/jobapplication_model");
const util = require("./util");

const uploadResume = async (req, res, next) => {
  let user_id = req.body.user_id;
  let joblisting_id = req.body.joblisting_id;
  let resume = req.body.resume;

  if (!user_id || !joblisting_id || !resume) {
    return res.status(404).json({
      successful: false,
      message: "One or more details are missing",
    });
  } else {
    try {
      const connection = await database.pool.getConnection();

      try {
        const selectUserIdQuery = `SELECT id FROM user WHERE id = ?`;
        const userIdRows = await connection.query(selectUserIdQuery, [user_id]);

        if (userIdRows.length === 0) {
          return res.status(400).json({
            successful: false,
            message: "User ID is invalid",
          });
        } else {
          const selectJobListingIdQuery = `SELECT id FROM job_listing WHERE id = ?`;
          const jobListingIdRows = await connection.query(
            selectJobListingIdQuery,
            [joblisting_id]
          );

          if (jobListingIdRows.length === 0) {
            return res.status(400).json({
              successful: false,
              message: "Job Listing ID is invalid",
            });
          } else {
            const selectExistingApplicationQuery = `
                        SELECT id FROM job_application
                        WHERE user_id = ? AND joblisting_id = ?
                    `;
            const existingApplicationRows = await connection.query(
              selectExistingApplicationQuery,
              [user_id, joblisting_id]
            );

            if (existingApplicationRows.length > 0) {
              return res.status(409).json({
                successful: false,
                message: "User has already applied for this job listing",
              });
            } else {
              const insertQuery = `INSERT into job_application (user_id, joblisting_id, resume) Values (?, ?, ?)`;
              const values = jobApplicationModel(
                user_id,
                joblisting_id,
                resume
              );
              const jobApplicationObj = [
                values.user_id,
                values.joblisting_id,
                values.resume,
              ];

              await connection.query(insertQuery, jobApplicationObj);

              return res.status(200).json({
                successful: true,
                message: "Successfuly uploaded resume",
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

const viewAllUsersApplicationsViaCompanyId = async (req, res, next) => {
  let id = req.params.id;

  if (!id) {
    return res.status(404).json({
      successful: false,
      message: "id is missing",
    });
  }

  try {
    const connection = await database.pool.getConnection();

    try {
      const selectIdQuery = `SELECT id FROM company WHERE id = ?`;
      const idRows = await connection.query(selectIdQuery, [id]);

      if (idRows.length === 0) {
        return res.status(400).json({
          successful: false,
          message: "Invalid Company ID",
        });
      }

      const selectQuery = `
        SELECT 
          disability.type,
          CONCAT(user.first_name, ' ', user.middle_initial,'. ', user.last_name) AS full_name,
          user.email, 
          CONCAT(user.address, ' ', user.city) AS Location,
          user.gender,
          user.birth_date,
          user.contact_number,
          user.formal_picture,
          resume,
          job_listing.position_name
        FROM job_application 
        JOIN user ON job_application.user_id = user.id
        JOIN disability ON user.disability_id = disability.id
        JOIN job_listing ON job_application.joblisting_id = job_listing.id
        WHERE job_listing.company_id = ?
      `;

      const rows = await connection.query(selectQuery, [id]);

      if (rows.length === 0) {
        return res.status(404).json({
          successful: false,
          message: "Job Applications not found",
        });
      }

      // Convert BLOB data to base64
      const processedRows = rows.map((row) => ({
        ...row,
        formal_picture: row.formal_picture
          ? row.formal_picture.toString("base64")
          : null,
        resume: row.resume ? row.resume.toString("base64") : null,
      }));

      return res.status(200).json({
        successful: true,
        message: "Successfully retrieved Job Applications",
        data: processedRows,
        count: processedRows.length,
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

const deleteJobApplication = async (req, res, next) => {
  let id = req.params.id;

  if (id == null) {
    return res.status(404).json({
      successful: false,
      message: "id is missing",
    });
  } else {
    try {
      const connection = await database.pool.getConnection();

      try {
        const selectQuery = "SELECT id FROM job_application WHERE id = ?";
        const rows = await connection.query(selectQuery, [id]);

        if (rows.length === 0) {
          return res.status(404).json({
            successful: false,
            message: "job_application not found",
          });
        } else {
          const updateQuery = `DELETE FROM job_application WHERE id = ?`;

          connection.query(updateQuery, [id]);
          return res.status(200).json({
            successful: true,
            message: "Successfully Deleted Job Application!",
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
  uploadResume,
  viewAllUsersApplicationsViaCompanyId,
  deleteJobApplication,
};
