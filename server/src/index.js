import "dotenv/config";
import http from "http";
import app from "./app.js";
import connectDB from "./db/index.js";
import { PORT } from "./constants.js";
// import startCronJobs from "./crons/index.js";
import { initializeSocket } from "./socket/index.js";

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error in connecting express with mongodb", error);
      throw error;
    });

    const httpServer = http.createServer(app);

    initializeSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });

    // startCronJobs();
  })
  .catch((error) => {
    console.log("Error in executing mongodb connection", error);
    process.exit(1);
  });
