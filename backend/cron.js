const cron = require("node-cron");
const knex = require("./api/models/connection_db");

// Schedule a cron job to run every minute
cron.schedule("*/10 * * * * *", async () => {
  try {
    console.log("Running job expiration check...");

    const now = new Date();

    const result = await knex("job_listing")
      .where("expiration", "<=", now) // Find expired jobs
      .andWhere("status", "ACTIVE") // Only check active jobs
      .whereNotNull("expiration") // Exclude jobs with NULL expiration
      .update({ status: "INACTIVE" }); // Mark as inactive

    if (result) {
      console.log(`${result} job(s) marked as INACTIVE.`);
    } else {
      console.log("No expired jobs to update.");
    }
  } catch (err) {
    console.error("Error updating job statuses:", err.message);
  }
});
