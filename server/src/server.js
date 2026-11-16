import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { initializeDatabase } from "./db.js";
import hotelRoutes from "./routes/hotels.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve("uploads")));
app.use("/api/hotels", hotelRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use((error, _req, res, _next) => {
  const status = error.code === "LIMIT_FILE_SIZE" ? 400 : 500;
  res.status(status).json({
    message: error.message || "Something went wrong on the server."
  });
});

initializeDatabase()
  .then(() => {
    app.listen(port, () => console.log(`Hotel API running on port ${port}`));
  })
  .catch((error) => {
    console.error("Database startup failed:", error.message);
    process.exit(1);
  });
