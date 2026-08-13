const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const env = require("./config/env");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const app = express();

app.use(cors({ origin: env.clientUrl }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "inventory-api" });
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
