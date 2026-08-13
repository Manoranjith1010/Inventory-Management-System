const app = require("./app");
const env = require("./config/env");
const connectDB = require("./config/db");

const startServer = async () => {
  try {
    await connectDB(env.mongoUri);
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Inventory API running on port ${env.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Server startup failed", error);
    process.exit(1);
  }
};

startServer();
